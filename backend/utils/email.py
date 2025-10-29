import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from config import settings
import logging

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add plain text version
        if text_content:
            part1 = MIMEText(text_content, 'plain')
            msg.attach(part1)
        
        # Add HTML version
        part2 = MIMEText(html_content, 'html')
        msg.attach(part2)
        
        # Connect to SMTP server
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_welcome_email(email: str, username: str):
    """Send welcome email to new user"""
    subject = "Welcome to Medicine Dispenser!"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">Welcome to Medicine Dispenser, {username}! 🎉</h2>
            <p>Thank you for registering with Medicine Dispenser. We're excited to help you manage your medications effectively.</p>
            
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #4CAF50; margin-top: 0;">What you can do:</h3>
                <ul>
                    <li>📋 Upload prescriptions and extract medicine information automatically</li>
                    <li>⏰ Set medicine reminders and get notified on time</li>
                    <li>💬 Chat with our AI health assistant</li>
                    <li>🏥 Find nearby pharmacies, doctors, and hospitals</li>
                    <li>💊 Get medicine pricing and information</li>
                </ul>
            </div>
            
            <p>Get started by logging into your account and adding your first medicine!</p>
            
            <a href="{settings.FRONTEND_URL}/login" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Go to Dashboard</a>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                If you didn't create this account, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Welcome to Medicine Dispenser, {username}!
    
    Thank you for registering. We're excited to help you manage your medications effectively.
    
    Visit {settings.FRONTEND_URL}/login to get started!
    """
    
    return send_email(email, subject, html_content, text_content)

def send_reminder_email(email: str, username: str, medicine_name: str, dosage: str, time: str):
    """Send medicine reminder email"""
    subject = f"⏰ Medicine Reminder: {medicine_name}"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #FF9800;">💊 Medicine Reminder</h2>
            <p>Hi {username},</p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #FF9800;">Time to take your medicine!</h3>
                <p style="margin: 10px 0;"><strong>Medicine:</strong> {medicine_name}</p>
                <p style="margin: 10px 0;"><strong>Dosage:</strong> {dosage}</p>
                <p style="margin: 10px 0;"><strong>Time:</strong> {time}</p>
            </div>
            
            <p>Please take your medicine as prescribed. Remember to maintain consistency for best results.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated reminder from Medicine Dispenser.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Medicine Reminder
    
    Hi {username},
    
    Time to take your medicine!
    
    Medicine: {medicine_name}
    Dosage: {dosage}
    Time: {time}
    
    Please take your medicine as prescribed.
    """
    
    return send_email(email, subject, html_content, text_content)