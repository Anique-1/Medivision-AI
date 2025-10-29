from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Medicine, Reminder, User
from utils.email import send_reminder_email
import pytz
import logging

logger = logging.getLogger(__name__)

# Pakistan timezone
PKT = pytz.timezone('Asia/Karachi')

scheduler = BackgroundScheduler(timezone=PKT)

def get_current_pkt_time():
    """Get current time in Pakistan timezone"""
    return datetime.now(PKT)

def check_and_send_reminders():
    """Check for pending reminders and send emails"""
    db = SessionLocal()
    try:
        now_pkt = get_current_pkt_time()
        now_utc = now_pkt.astimezone(pytz.utc)
        
        # Define a window for checking reminders: precisely the current minute (in UTC)
        # This ensures reminders are sent exactly when their scheduled minute starts.
        past_window_utc = now_utc.replace(second=0, microsecond=0)
        future_window_utc = now_utc.replace(second=59, microsecond=999999)
        
        logger.info(f"Checking reminders at PKT: {now_pkt.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Looking for reminders between {past_window_utc.strftime('%Y-%m-%d %H:%M:%S')} and {future_window_utc.strftime('%Y-%m-%d %H:%M:%S')} UTC")
        
        # Query reminders (compare as naive UTC datetime)
        reminders = db.query(Reminder).filter(
            Reminder.status == "pending",
            Reminder.reminder_time >= past_window_utc.replace(tzinfo=None),
            Reminder.reminder_time <= future_window_utc.replace(tzinfo=None)
        ).all()
        
        logger.info(f"Found {len(reminders)} pending reminders")
        
        for reminder in reminders:
            user = db.query(User).filter(User.id == reminder.user_id).first()
            medicine = db.query(Medicine).filter(Medicine.id == reminder.medicine_id).first()
            
            if user and medicine:
                # Localize stored naive UTC datetime to UTC, then convert to PKT for display
                reminder_utc_aware = pytz.utc.localize(reminder.reminder_time)
                reminder_pkt = reminder_utc_aware.astimezone(PKT)
                time_str = reminder_pkt.strftime("%H:%M")
                
                logger.info(f"Sending reminder for {medicine.name} to {user.email} at {time_str} (PKT). Original UTC: {reminder.reminder_time.strftime('%H:%M')}")
                
                success = send_reminder_email(
                    user.email,
                    user.username,
                    medicine.name,
                    medicine.dosage,
                    time_str
                )
                
                if success:
                    reminder.status = "sent"
                    reminder.sent_at = get_current_pkt_time().astimezone(pytz.utc).replace(tzinfo=None) # Store sent_at as naive UTC
                    db.commit()
                    logger.info(f"✅ Reminder sent for medicine {medicine.name} to user {user.username}")
                else:
                    logger.error(f"❌ Failed to send reminder for {medicine.name} to {user.email}")
        
    except Exception as e:
        logger.error(f"❌ Error in check_and_send_reminders: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
    finally:
        db.close()

def create_reminders_for_medicine(medicine_id: int, user_id: int, times: list, db: Session):
    """Create reminder entries for a medicine (using Pakistan timezone)"""
    try:
        # Delete existing pending reminders for this medicine
        db.query(Reminder).filter(
            Reminder.medicine_id == medicine_id,
            Reminder.status == "pending"
        ).delete()
        
        # Get current Pakistan time
        now_pkt = get_current_pkt_time()
        today_pkt = now_pkt.date()
        
        logger.info(f"Creating reminders for medicine {medicine_id} in PKT timezone")
        logger.info(f"Current PKT time: {now_pkt.strftime('%Y-%m-%d %H:%M:%S')}")
        
        for time_str in times:
            try:
                # Parse time in 24-hour format (HH:MM)
                time_str = time_str.strip()
                
                # Try multiple formats
                time_obj = None
                for fmt in ["%H:%M", "%H:%M:%S", "%I:%M %p", "%I:%M%p"]:
                    try:
                        time_obj = datetime.strptime(time_str, fmt).time()
                        break
                    except ValueError:
                        continue
                
                if time_obj is None:
                    logger.error(f"Could not parse time: {time_str}")
                    continue
                
                logger.debug(f"Parsed time '{time_str}' to time object: {time_obj}")

                # Create reminder datetime in Pakistan timezone
                reminder_datetime_pkt = PKT.localize(datetime.combine(today_pkt, time_obj))
                logger.debug(f"Initial reminder datetime (PKT): {reminder_datetime_pkt.strftime('%Y-%m-%d %H:%M:%S %Z%z')}")
                
                # If time has passed today, schedule for tomorrow
                if reminder_datetime_pkt < now_pkt:
                    reminder_datetime_pkt = reminder_datetime_pkt + timedelta(days=1)
                    logger.info(f"Time {time_str} has passed today ({now_pkt.strftime('%H:%M')}), scheduling for tomorrow: {reminder_datetime_pkt.strftime('%Y-%m-%d %H:%M:%S %Z%z')}")
                
                # Convert PKT-aware datetime to UTC for storage
                reminder_datetime_utc = reminder_datetime_pkt.astimezone(pytz.utc)
                
                reminder = Reminder(
                    user_id=user_id,
                    medicine_id=medicine_id,
                    reminder_time=reminder_datetime_utc.replace(tzinfo=None), # Store as naive UTC
                    status="pending"
                )
                db.add(reminder)
                
                logger.info(f"✅ Created reminder for {time_str} -> PKT: {reminder_datetime_pkt.strftime('%Y-%m-%d %H:%M:%S %Z%z')} -> UTC (stored): {reminder_datetime_utc.strftime('%Y-%m-%d %H:%M:%S %Z%z')}")
                
            except Exception as e:
                logger.error(f"❌ Error parsing time {time_str}: {str(e)}")
                continue
        
        db.commit()
        logger.info(f"✅ Successfully created reminders for medicine {medicine_id}")

    except Exception as e:
        logger.error(f"❌ Error creating reminders: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        db.rollback()

def schedule_daily_reminder_creation():
    """Create reminders for the next day at midnight PKT"""
    db = SessionLocal()
    try:
        logger.info(f"Running daily reminder creation at {get_current_pkt_time().strftime('%Y-%m-%d %H:%M:%S')} PKT")
        
        active_medicines = db.query(Medicine).filter(Medicine.status == "active").all()
        
        logger.info(f"Found {len(active_medicines)} active medicines")
        
        for medicine in active_medicines:
            if medicine.times and len(medicine.times) > 0:
                logger.info(f"Creating reminders for medicine {medicine.id} with times: {medicine.times}")
                create_reminders_for_medicine(medicine.id, medicine.user_id, medicine.times, db)
            else:
                logger.warning(f"Medicine {medicine.id} ({medicine.name}) has no times set")
        
        logger.info("✅ Daily reminders created successfully")

    except Exception as e:
        logger.error(f"❌ Error in schedule_daily_reminder_creation: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
    finally:
        db.close()

def start_scheduler():
    """Start the scheduler with Pakistan timezone"""
    current_time = get_current_pkt_time()
    logger.info(f"🚀 Starting scheduler with Pakistan Time (PKT)")
    logger.info(f"Current PKT time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check for reminders every 1 minute (increased frequency)
    scheduler.add_job(
        check_and_send_reminders,
        trigger=CronTrigger(minute="*/1", timezone=PKT),
        id="check_reminders",
        replace_existing=True
    )
    logger.info("✓ Added job: Check reminders every 1 minute (PKT)")

    # Create next day's reminders at midnight PKT
    scheduler.add_job(
        schedule_daily_reminder_creation,
        trigger=CronTrigger(hour=0, minute=0, timezone=PKT),
        id="daily_reminder_creation",
        replace_existing=True
    )
    logger.info("✓ Added job: Daily reminder creation at 00:00 (PKT)")

    # Run daily reminder creation immediately on startup
    scheduler.add_job(
        schedule_daily_reminder_creation,
        trigger='date',
        run_date=datetime.now() + timedelta(seconds=5),
        id="startup_reminder_creation"
    )
    logger.info("✓ Added job: Initial reminder creation (runs in 5 seconds)")

    scheduler.start()
    logger.info("✅ Scheduler started successfully in Pakistan Time (PKT)")

def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
    logger.info("🛑 Scheduler stopped")

def get_upcoming_reminders(user_id: int, db: Session, limit: int = 10):
    """Get upcoming reminders for a user (in PKT)"""
    now_utc = datetime.now(pytz.utc) # Get current UTC time
    
    reminders = db.query(Reminder).filter(
        Reminder.user_id == user_id,
        Reminder.status == "pending",
        Reminder.reminder_time >= now_utc.replace(tzinfo=None) # Compare with naive UTC
    ).order_by(Reminder.reminder_time).limit(limit).all()
    
    result = []
    for reminder in reminders:
        medicine = db.query(Medicine).filter(Medicine.id == reminder.medicine_id).first()
        if medicine:
            # Localize stored naive UTC datetime to UTC, then convert to PKT for display
            reminder_utc_aware = pytz.utc.localize(reminder.reminder_time)
            reminder_pkt = reminder_utc_aware.astimezone(PKT)
            result.append({
                "id": reminder.id,
                "medicine_name": medicine.name,
                "dosage": medicine.dosage,
                "reminder_time": reminder_pkt.strftime("%Y-%m-%d %H:%M:%S"),
                "time_only": reminder_pkt.strftime("%H:%M")
            })
    
    return result

def test_reminder_system():
    """Test function to check if reminders are working"""
    db = SessionLocal()
    try:
        now = get_current_pkt_time()
        logger.info(f"\n{'='*50}")
        logger.info(f"REMINDER SYSTEM TEST")
        logger.info(f"{'='*50}")
        logger.info(f"Current PKT time: {now.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Check pending reminders
        pending = db.query(Reminder).filter(Reminder.status == "pending").all()
        logger.info(f"\nTotal pending reminders: {len(pending)}")
        
        for reminder in pending:
            medicine = db.query(Medicine).filter(Medicine.id == reminder.medicine_id).first()
            user = db.query(User).filter(User.id == reminder.user_id).first()
            
            if medicine and user:
                logger.info(f"\n  Reminder ID: {reminder.id}")
                logger.info(f"  Medicine: {medicine.name}")
                logger.info(f"  User: {user.username} ({user.email})")
                logger.info(f"  Time: {reminder.reminder_time.strftime('%Y-%m-%d %H:%M:%S')}")
                
                time_diff = reminder.reminder_time - now.replace(tzinfo=None)
                logger.info(f"  Time until reminder: {time_diff}")
        
        logger.info(f"\n{'='*50}\n")
        
    except Exception as e:
        logger.error(f"Error in test: {str(e)}")
    finally:
        db.close()
