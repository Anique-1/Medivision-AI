from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import User
from schemas import UserResponse, UserUpdate
from utils.auth import get_current_user, get_password_hash, verify_password
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/profile", tags=["Profile"])

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    
    # Check if email is being changed and if it's already taken
    if user_data.email and user_data.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_data.email
    
    # Update full name if provided
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password length
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.delete("/me")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete current user account"""
    
    # This will cascade delete all related medicines, reminders, etc.
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"}

@router.get("/stats")
@router.get("/")
async def profile_root():
    """Root endpoint for profile API"""
    return {"message": "Profile API root. Use /me or /stats."}

@router.get("/stats")
async def get_profile_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile statistics"""
    from models import Medicine, Reminder, ChatHistory
    
    total_medicines = db.query(Medicine).filter(
        Medicine.user_id == current_user.id
    ).count()
    
    total_reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id
    ).count()
    
    acknowledged_reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.status == "acknowledged"
    ).count()
    
    total_chats = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).count()
    
    # Calculate adherence rate
    adherence_rate = 0
    if total_reminders > 0:
        adherence_rate = round((acknowledged_reminders / total_reminders) * 100, 1)
    
    return {
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "member_since": current_user.created_at,
        "total_medicines": total_medicines,
        "total_reminders": total_reminders,
        "acknowledged_reminders": acknowledged_reminders,
        "adherence_rate": adherence_rate,
        "total_chats": total_chats
    }
