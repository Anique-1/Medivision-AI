from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import io
import os
import cv2
import numpy as np
from ultralytics import YOLO
import openai
import base64
import json
from datetime import datetime
from config import settings
import uuid

# Define model paths
MODELS_DIR = "backend/models" # Updated to reflect actual location

MODELS = {
    "bone_detection_model": os.path.join(MODELS_DIR, "bone_detection_model.pt"),
    "brain_tumor_segmentation_model": os.path.join(MODELS_DIR, "brain_tumor_segmentation_model.pt"),
    "eye_conjunctiva_detection_model": os.path.join(MODELS_DIR, "eye_conjuntiva_detection_model.pt"),
    "liver_disease_detection_model": os.path.join(MODELS_DIR, "liver_disease_detection_model.pt"),
    "skin_disease_detection_model": os.path.join(MODELS_DIR, "skin_disease_detection_model.pt"),
    "teeth_detection_model": os.path.join(MODELS_DIR, "teeth_detection_model.pt")
}

# Ensure required directories exist
UPLOAD_DIR = "uploads"
STATIC_DIR = "static"
# MODELS_DIR is now defined above

def ensure_directories():
    """Create uploads, static, and models directories if they don't exist"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(STATIC_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"Ensured directories exist: {UPLOAD_DIR}, {STATIC_DIR}, {MODELS_DIR}")

# Call this at module load time
ensure_directories()

# Eye conjunctiva specific configuration
EYE_CONJUNCTIVA_CLASS_NAMES = ['forniceal', 'forniceal_palpebral', 'palpebral']
EYE_CONJUNCTIVA_CLASS_COLORS = [
    (0, 0, 139),    # Dark red/blue for forniceal
    (0, 100, 0),    # Dark green for forniceal_palpebral
    (139, 0, 139)   # Dark magenta for palpebral
]

# Function to create custom eye conjunctiva visualization
def create_eye_conjunctiva_visualization(image_np, results):
    annotated_image = image_np.copy()
    if hasattr(results, 'masks') and results.masks is not None:
        masks = results.masks.data.cpu().numpy()
        classes = results.boxes.cls.cpu().numpy().astype(int)
        for mask, cls_idx in zip(masks, classes):
            if cls_idx < len(EYE_CONJUNCTIVA_CLASS_COLORS):
                color = EYE_CONJUNCTIVA_CLASS_COLORS[cls_idx]
                mask = (mask > 0.5).astype(np.uint8)
                mask_resized = cv2.resize(mask, (annotated_image.shape[1], annotated_image.shape[0]), interpolation=cv2.INTER_NEAREST)
                colored_mask = np.zeros_like(annotated_image, dtype=np.uint8)
                for c in range(3):
                    colored_mask[:, :, c] = mask_resized * color[c]
                annotated_image = cv2.addWeighted(annotated_image, 1.0, colored_mask, 0.6, 0)
                moments = cv2.moments(mask_resized)
                if moments["m00"] != 0:
                    cx = int(moments["m10"] / moments["m00"])
                    cy = int(moments["m01"] / moments["m00"])
                    label = EYE_CONJUNCTIVA_CLASS_NAMES[cls_idx]
                    offset_x, offset_y = 60, -40
                    label_x = min(cx + offset_x, annotated_image.shape[1] - 10)
                    label_y = max(cy + offset_y, 20)
                    cv2.arrowedLine(
                        annotated_image,
                        (label_x, label_y),
                        (cx, cy),
                        color,
                        2,
                        tipLength=0.2
                    )
                    font_scale = 0.6
                    font_thickness = 2
                    text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)[0]
                    highlight_color = (255, 255, 200)
                    padding_x, padding_y = 8, 8
                    cv2.rectangle(
                        annotated_image,
                        (label_x - padding_x, label_y - text_size[1] - padding_y),
                        (label_x + text_size[0] + padding_x, label_y + padding_y),
                        highlight_color, -1
                    )
                    cv2.putText(
                        annotated_image,
                        label,
                        (label_x, label_y),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        font_scale,
                        (0, 0, 0),
                        font_thickness,
                        cv2.LINE_AA
                    )
    return annotated_image

# Load models into memory
LOADED_MODELS = {}

def get_model(model_name: str):
    """Load and return a YOLO model"""
    if model_name not in MODELS:
        raise HTTPException(status_code=404, detail="Model not found")
    
    if model_name not in LOADED_MODELS:
        model_path = MODELS[model_name]
        
        if not os.path.exists(model_path):
            abs_path = os.path.abspath(model_path)
            error_msg = (
                f"Model file not found: {model_path}\n"
                f"Absolute path: {abs_path}\n"
                f"Please ensure the model file exists at this location.\n"
                f"Current working directory: {os.getcwd()}"
            )
            print(error_msg)
            raise HTTPException(
                status_code=404, 
                detail=f"Model file not found: {model_path}. Please place the model file in the models directory."
            )
        
        try:
            print(f"Loading model from: {model_path}")
            LOADED_MODELS[model_name] = YOLO(model_path)
            print(f"Successfully loaded model: {model_name}")
        except Exception as e:
            error_msg = f"Error loading model {model_name} from {model_path}: {str(e)}"
            print(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
    
    return LOADED_MODELS[model_name]

def generate_ai_analysis(model_name: str, detections: list, segmentation_info: list):
    """Generate AI medical analysis based on detections"""
    ai_query = ""
    
    if model_name == "eye_conjunctiva_detection_model" and segmentation_info:
        ai_query = f"""
Based on eye conjunctiva segmentation analysis, the following regions were detected:

"""
        for data in segmentation_info:
            ai_query += f"- **{data['class'].upper()}**: Confidence {data['confidence']:.1%}, Coverage {data['area_percentage']:.2f}% ({data['area_pixels']:,} pixels)\n"

        ai_query += """

Please provide:
1. **Medical Interpretation**: What do these segmented conjunctiva regions indicate about eye health?
2. **Clinical Significance**: Explain the importance of each detected region (forniceal, forniceal_palpebral, palpebral)
3. **Health Recommendations**: Provide specific recommendations based on the segmentation results
4. **Warning Signs**: What symptoms or conditions should be monitored?
5. **When to Seek Medical Care**: Under what circumstances should professional medical attention be sought?
6. **Preventive Measures**: What can be done to maintain healthy conjunctiva?

Please provide clear, actionable, and medically sound advice.
"""
    elif detections:
        detection_text = ", ".join(detections)
        ai_query = f"""
Describe the medical significance of these detections in the image: {detection_text}.

Please provide:
1. **Medical Interpretation**: What do these detections indicate about the patient's health?
2. **Clinical Significance**: Explain the importance of these findings
3. **Recommendations**: Provide specific recommendations based on the detection results
4. **Suggestions**: What are the suggested next steps for the patient?
5. **Warning Signs**: What symptoms or conditions should be monitored?
6. **When to Seek Medical Care**: Under what circumstances should professional medical attention be sought?
7. **Preventive Measures**: What can be done to prevent or manage related conditions?

Please provide clear, actionable, and medically sound advice.
"""
    else:
        ai_query = """
No specific medical objects or conditions detected in the image. However, please provide general recommendations and suggestions for medical image analysis and health monitoring.

Please provide:
1. **General Recommendations**: What are the best practices for medical imaging?
2. **Health Suggestions**: General advice for maintaining health when no specific conditions are detected
3. **Monitoring**: What should patients monitor in their health?
4. **Preventive Measures**: General preventive healthcare measures
5. **When to Seek Care**: When should someone consult a healthcare professional even without specific detections?

Please provide clear, actionable, and medically sound advice.
"""
    
    # Generate AI analysis
    try:
        api_key = settings.AIMLAPI_KEY
        if not api_key:
            return "AI/ML API key not configured. Please set AIMLAPI_KEY in backend/.env"
        
        aiml_client = openai.OpenAI(
            api_key=api_key,
            base_url="https://api.aimlapi.com/v1"
        )
        response = aiml_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a medical AI assistant providing professional medical analysis and recommendations based on image analysis results."},
                {"role": "user", "content": ai_query}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating AI analysis: {e}")
        return f"Error generating AI analysis: {str(e)}"

async def process_image_analysis(model_name: str, file: UploadFile):
    """Common image analysis processing logic"""
    try:
        ensure_directories()
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        safe_filename = os.path.basename(file.filename)
        original_filename = f"{unique_id}_{safe_filename}"
        annotated_filename = f"{unique_id}_annotated_{safe_filename}"

        # Save original image
        upload_path = os.path.join(UPLOAD_DIR, original_filename)
        file_content = await file.read()
        
        with open(upload_path, "wb") as f:
            f.write(file_content)
        
        print(f"Saved uploaded image to: {upload_path}")

        # Read and process image
        image = Image.open(upload_path).convert('RGB')
        img_array = np.array(image)

        # Load model
        model = get_model(model_name)

        # Perform inference
        results = model(img_array, verbose=False)

        # Process detections
        detections = []
        segmentation_info = []

        for result in results:
            if hasattr(result, 'masks') and result.masks is not None:
                masks = result.masks.data.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy().astype(int)
                confidences = result.boxes.conf.cpu().numpy()
                
                for i, (mask, cls_idx, conf) in enumerate(zip(masks, classes, confidences)):
                    class_name = model.names[cls_idx]
                    detections.append(f"{class_name} (confidence: {conf:.2f})")
                    
                    mask_binary = (mask > 0.5).astype(np.uint8)
                    area_pixels = np.sum(mask_binary)
                    total_pixels = mask_binary.shape[0] * mask_binary.shape[1]
                    area_percentage = (area_pixels / total_pixels) * 100
                    
                    segmentation_info.append({
                        'class': class_name,
                        'confidence': float(conf),
                        'area_percentage': float(area_percentage),
                        'area_pixels': int(area_pixels)
                    })
            elif result.boxes is not None:
                boxes = result.boxes
                for box in boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = model.names[cls]
                    detections.append(f"{class_name} (confidence: {conf:.2f})")

        # Generate AI analysis
        ai_analysis_content = generate_ai_analysis(model_name, detections, segmentation_info)

        # Generate annotated image
        if model_name == "eye_conjunctiva_detection_model" and segmentation_info:
            annotated_img_np = create_eye_conjunctiva_visualization(img_array, results[0])
            annotated_img_np = cv2.cvtColor(annotated_img_np, cv2.COLOR_BGR2RGB)
        else:
            annotated_img_np = results[0].plot()
            annotated_img_np = cv2.cvtColor(annotated_img_np, cv2.COLOR_BGR2RGB)

        # Save annotated image
        annotated_path = os.path.join(STATIC_DIR, annotated_filename)
        Image.fromarray(annotated_img_np).save(annotated_path, format="PNG")
        print(f"Saved annotated image to: {annotated_path}")

        annotated_image_url = f"/static/{annotated_filename}"

        return {
            "model_name": model_name,
            "detections": detections,
            "segmentation_info": segmentation_info,
            "ai_analysis": ai_analysis_content,
            "annotated_image_url": annotated_image_url
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in process_image_analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Create router
router = APIRouter(prefix="/api")

@router.get("/models")
async def list_models():
    """List all available models and their status"""
    model_status = {}
    for model_name, model_path in MODELS.items():
        exists = os.path.exists(model_path)
        loaded = model_name in LOADED_MODELS
        model_status[model_name] = {
            "path": model_path,
            "exists": exists,
            "loaded": loaded,
            "absolute_path": os.path.abspath(model_path)
        }
    
    return JSONResponse(content={
        "models": model_status,
        "current_directory": os.getcwd()
    })

# Bone Detection Model Route
@router.post("/bone-detection")
async def analyze_bone_detection(file: UploadFile = File(...)):
    """
    Analyzes bone fractures and abnormalities in X-ray images
    """
    return JSONResponse(content=await process_image_analysis("bone_detection_model", file))

# Brain Tumor Segmentation Model Route
@router.post("/brain-tumor")
async def analyze_brain_tumor(file: UploadFile = File(...)):
    """
    Segments and analyzes brain tumors in MRI images
    """
    return JSONResponse(content=await process_image_analysis("brain_tumor_segmentation_model", file))

# Eye Conjunctiva Detection Model Route
@router.post("/eye-conjunctiva")
async def analyze_eye_conjunctiva(file: UploadFile = File(...)):
    """
    Analyzes eye conjunctiva regions (forniceal, palpebral, forniceal_palpebral)
    """
    return JSONResponse(content=await process_image_analysis("eye_conjunctiva_detection_model", file))

# Liver Disease Detection Model Route
@router.post("/liver-disease")
async def analyze_liver_disease(file: UploadFile = File(...)):
    """
    Detects liver abnormalities and diseases in medical images
    """
    return JSONResponse(content=await process_image_analysis("liver_disease_detection_model", file))

# Skin Disease Detection Model Route
@router.post("/skin-disease")
async def analyze_skin_disease(file: UploadFile = File(...)):
    """
    Classifies various skin conditions and diseases
    """
    return JSONResponse(content=await process_image_analysis("skin_disease_detection_model", file))

# Teeth Detection Model Route
@router.post("/teeth-detection")
async def analyze_teeth(file: UploadFile = File(...)):
    """
    Analyzes dental images for oral health assessment
    """
    return JSONResponse(content=await process_image_analysis("teeth_detection_model", file))

# Legacy route for backward compatibility
@router.post("/analyze/{model_name}")
async def analyze_image(model_name: str, file: UploadFile = File(...)):
    """
    Legacy endpoint - analyzes an uploaded medical image using the specified YOLO model
    """
    if model_name not in MODELS:
        raise HTTPException(
            status_code=404, 
            detail=f"Model '{model_name}' not found. Available models: {', '.join(MODELS.keys())}"
        )
    
    return JSONResponse(content=await process_image_analysis(model_name, file))
