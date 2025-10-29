from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from models import User, Medicine, Reminder
from schemas import DashboardStats, ReminderResponse, MedicineResponse
from utils.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    
    # Total medicines
    total_medicines = db.query(Medicine).filter(
        Medicine.user_id == current_user.id
    ).count()
    
    # Active medicines
    active_medicines = db.query(Medicine).filter(
        Medicine.user_id == current_user.id,
        Medicine.status == "active"
    ).count()
    
    # Today's reminders
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    today_reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.reminder_time >= today_start,
        Reminder.reminder_time < today_end
    ).count()
    
    # Upcoming reminders (next 7 days)
    week_end = today_start + timedelta(days=7)
    upcoming_reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.reminder_time >= today_end,
        Reminder.reminder_time < week_end,
        Reminder.status == "pending"
    ).count()
    
    # Recent medicines (last 5)
    recent_medicines = db.query(Medicine).filter(
        Medicine.user_id == current_user.id,
        Medicine.status == "active"
    ).order_by(Medicine.created_at.desc()).limit(5).all()
    
    return DashboardStats(
        total_medicines=total_medicines,
        active_medicines=active_medicines,
        today_reminders=today_reminders,
        upcoming_reminders=upcoming_reminders,
        recent_medicines=recent_medicines
    )

@router.get("/reminders/today")
async def get_today_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's reminders"""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    reminders = db.query(Reminder).join(Medicine).filter(
        Reminder.user_id == current_user.id,
        Reminder.reminder_time >= today_start,
        Reminder.reminder_time < today_end
    ).order_by(Reminder.reminder_time).all()
    
    return [
        ReminderResponse(
            id=r.id,
            medicine_id=r.medicine_id,
            medicine_name=r.medicine.name,
            dosage=r.medicine.dosage,
            reminder_time=r.reminder_time,
            status=r.status
        )
        for r in reminders
    ]

@router.get("/reminders/upcoming")
async def get_upcoming_reminders(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming reminders for next N days"""
    now = datetime.utcnow()
    end_date = now + timedelta(days=days)
    
    reminders = db.query(Reminder).join(Medicine).filter(
        Reminder.user_id == current_user.id,
        Reminder.reminder_time >= now,
        Reminder.reminder_time < end_date,
        Reminder.status == "pending"
    ).order_by(Reminder.reminder_time).all()
    
    return [
        ReminderResponse(
            id=r.id,
            medicine_id=r.medicine_id,
            medicine_name=r.medicine.name,
            dosage=r.medicine.dosage,
            reminder_time=r.reminder_time,
            status=r.status
        )
        for r in reminders
    ]

@router.post("/reminders/{reminder_id}/acknowledge")
async def acknowledge_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Acknowledge a reminder (mark as taken)"""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder.status = "acknowledged"
    reminder.acknowledged_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Reminder acknowledged", "reminder_id": reminder_id}