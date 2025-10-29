from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import User, Medicine
from schemas import MedicineCreate, MedicineUpdate, MedicineResponse
from utils.auth import get_current_user
from utils.schedular import create_reminders_for_medicine
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/medicines", tags=["Medicines"])

@router.post("/", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
async def create_medicine(
    medicine_data: MedicineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new medicine"""
    # Check if medicine with same name and dosage exists
    existing = db.query(Medicine).filter(
        Medicine.user_id == current_user.id,
        Medicine.name == medicine_data.name,
        Medicine.dosage == medicine_data.dosage,
        Medicine.status == "active"
    ).first()
    
    if existing:
        # Update times instead of creating duplicate
        existing_times = set(existing.times)
        new_times = set(medicine_data.times)
        merged_times = sorted(list(existing_times.union(new_times)))
        existing.times = merged_times
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        
        # Update reminders
        create_reminders_for_medicine(existing.id, current_user.id, merged_times, db)
        
        return existing
    
    # Create new medicine
    medicine = Medicine(
        user_id=current_user.id,
        name=medicine_data.name,
        dosage=medicine_data.dosage,
        times=medicine_data.times,
        instructions=medicine_data.instructions,
        status="active"
    )
    
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    
    # Create reminders
    create_reminders_for_medicine(medicine.id, current_user.id, medicine_data.times, db)
    
    return medicine

@router.get("/", response_model=List[MedicineResponse])
async def get_medicines(
    status: str = "active",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all medicines for current user"""
    query = db.query(Medicine).filter(Medicine.user_id == current_user.id)
    
    if status:
        query = query.filter(Medicine.status == status)
    
    medicines = query.order_by(Medicine.created_at.desc()).all()
    return medicines

@router.get("/{medicine_id}", response_model=MedicineResponse)
async def get_medicine(
    medicine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific medicine"""
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == current_user.id
    ).first()
    
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    
    return medicine

@router.put("/{medicine_id}", response_model=MedicineResponse)
async def update_medicine(
    medicine_id: int,
    medicine_data: MedicineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a medicine"""
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == current_user.id
    ).first()
    
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    
    # Update fields
    update_data = medicine_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(medicine, field, value)
    
    medicine.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(medicine)
    
    # Update reminders if times changed
    if medicine_data.times is not None:
        create_reminders_for_medicine(medicine.id, current_user.id, medicine_data.times, db)
    
    return medicine

@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medicine(
    medicine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a medicine"""
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == current_user.id
    ).first()
    
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    
    db.delete(medicine)
    db.commit()
    
    return None