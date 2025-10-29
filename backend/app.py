from fastapi import FastAPI, Request, status # Import status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder # Import jsonable_encoder
from contextlib import asynccontextmanager
import logging
import sys
from logging.handlers import RotatingFileHandler # Import RotatingFileHandler

from fastapi.staticfiles import StaticFiles

# Helper function to recursively convert bytes to strings for JSON serialization
def convert_bytes_to_str(obj):
    if isinstance(obj, bytes):
        try:
            return obj.decode('utf-8')
        except UnicodeDecodeError:
            return repr(obj) # Fallback to repr for non-UTF-8 bytes
    elif isinstance(obj, dict):
        return {k: convert_bytes_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_bytes_to_str(elem) for elem in obj]
    else:
        return obj

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        RotatingFileHandler(
            'backend/app.log', # Specify the path relative to the current working directory
            maxBytes=5 * 1024 * 1024, # 5 MB
            backupCount=5,
            encoding='utf-8'
        )
    ]
)

logger = logging.getLogger(__name__)

# Import database and scheduler
from database import init_db
from utils.schedular import start_scheduler, stop_scheduler

# Import routes
from routes import auth, medicine, chat, dashboard, profile, yolo

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting application...")
    try:
        # Initialize database
        init_db()
        logger.info("Database initialized")
        
        # Start scheduler
        start_scheduler()
        logger.info("Scheduler started")
        
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    try:
        stop_scheduler()
        logger.info("Scheduler stopped")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

# Create FastAPI app
app = FastAPI(
    title="Medicine Dispenser API",
    description="AI-powered medicine management system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Request validation error: {exc.errors()}", exc_info=True)
    
    # Sanitize errors to ensure no bytes objects are passed to jsonable_encoder
    sanitized_errors = convert_bytes_to_str(exc.errors())

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": sanitized_errors})
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )

# Include routers
app.include_router(auth.router)
app.include_router(medicine.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(yolo.router)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "MediVision API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Medicine Dispenser API",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
