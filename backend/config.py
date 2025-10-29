from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./medicine_dispenser.db"
    
    # JWT Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI/ML API Keys
    AIMLAPI_KEY: str
    OPENAI_API_KEY: Optional[str] = None
    SERPAPI_API_KEY: Optional[str] = None
    
    # Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    FROM_EMAIL: str
    FROM_NAME: str = "Medicine Dispenser"
    
    # MongoDB (Optional)
    MONGODB_URI: Optional[str] = None
    DB_NAME: str = "medicine_dispenser"
    
    # URLs
    BACKEND_BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = "backend/.env"
        case_sensitive = True

settings = Settings()
