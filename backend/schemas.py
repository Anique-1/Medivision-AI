from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Medicine Schemas
class MedicineBase(BaseModel):
    name: str
    dosage: str
    times: List[str]
    instructions: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    times: Optional[List[str]] = None
    instructions: Optional[str] = None
    status: Optional[str] = None

class MedicineResponse(MedicineBase):
    id: int
    user_id: int
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Reminder Schemas
class ReminderResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: str
    dosage: str
    reminder_time: datetime
    status: str
    
    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

# Dashboard Schema
class DashboardStats(BaseModel):
    total_medicines: int
    active_medicines: int
    today_reminders: int
    upcoming_reminders: int
    recent_medicines: List[MedicineResponse]

# Prescription Schema
class PrescriptionResponse(BaseModel):
    id: int
    filename: str
    extracted_data: Optional[Dict[str, Any]]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True