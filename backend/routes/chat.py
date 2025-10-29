from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import User, ChatHistory
from schemas import ChatMessage, ChatResponse
from utils.auth import get_current_user
from utils.ai_agent import get_agent_graph, process_prescription_image, speech_to_text_tool, text_to_speech_tool
from utils.ai_agent import AgentState, HumanMessage, AIMessage
import logging
import io
import base64

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    chat_data: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a text message to AI agent"""
    try:
        # Get the agent graph and tools configured with the current db session and user_id
        agent_graph, tools = get_agent_graph(db, current_user.id)

        # Initialize agent state with user message and tools
        state = AgentState(messages=[HumanMessage(content=chat_data.message)], user_id=str(current_user.id), tools=tools)
        
        # Invoke the agent graph
        result = agent_graph.invoke(state)
        
        # Extract the AI's response
        ai_response_message = result["messages"][-1]
        response_content = ai_response_message.content if isinstance(ai_response_message, AIMessage) else str(ai_response_message)
        
        # Save to chat history
        chat_entry = ChatHistory(
            user_id=current_user.id,
            message=chat_data.message,
            response=response_content,
            message_type="text"
        )
        db.add(chat_entry)
        db.commit()
        
        return ChatResponse(
            response=response_content,
            timestamp=datetime.utcnow()
        )
    
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing message: {str(e)}"
        )

@router.post("/image")
async def send_chat_image(
    file: UploadFile = File(...),
    message: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an image (prescription or medicine) to AI agent for processing"""
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
        
        # Determine which tool to use based on message or default to prescription
        tool_call_message = ""
        if message and "prescription" in message.lower():
            tool_call_message = f"Process this as a prescription: {message}"
        elif message and "medicine" in message.lower():
            tool_call_message = f"Identify the medicine in this image: {message}"
        else:
            # Default to prescription processing if no specific instruction
            tool_call_message = "Process this image as a prescription."

        # Get the agent graph and tools configured with the current db session and user_id
        agent_graph, tools = get_agent_graph(db, current_user.id)

        # Initialize agent state with user message and image
        # Format the message content for multi-modal input
        multi_modal_content = [
            {"type": "text", "text": tool_call_message},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
        ]
        state = AgentState(
            messages=[HumanMessage(content=multi_modal_content)],
            user_id=str(current_user.id),
            tools=tools
        )
        
        # Invoke the agent graph
        result = agent_graph.invoke(state)
        
        # Extract the AI's response
        ai_response_message = result["messages"][-1]
        response_content = ai_response_message.content if isinstance(ai_response_message, AIMessage) else str(ai_response_message)
        
        # Save to chat history
        user_message_history = message or "Uploaded image"
        chat_entry = ChatHistory(
            user_id=current_user.id,
            message=user_message_history,
            response=response_content,
            message_type="image"
        )
        db.add(chat_entry)
        db.commit()
        
        return {
            "status": "success",
            "response": response_content,
            "timestamp": datetime.utcnow()
        }
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

@router.post("/audio")
async def send_chat_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an audio message to AI agent, get text response, and convert to audio"""
    try:
        if not file.content_type.startswith("audio/"):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        audio_bytes = await file.read()
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        
        # 1. Convert audio to text
        transcribed_text = speech_to_text_tool(audio_base64)
        if transcribed_text.startswith("Error"):
            raise HTTPException(status_code=500, detail=transcribed_text)
        
        # Get the agent graph and tools configured with the current db session and user_id
        agent_graph, tools = get_agent_graph(db, current_user.id)

        # 2. Feed text to agent graph
        state = AgentState(messages=[HumanMessage(content=transcribed_text)], user_id=str(current_user.id), tools=tools)
        result = agent_graph.invoke(state)
        ai_response_message = result["messages"][-1]
        response_content = ai_response_message.content if isinstance(ai_response_message, AIMessage) else str(ai_response_message)
        
        # 3. Convert agent's text response to audio
        response_audio_base64 = text_to_speech_tool(response_content)
        if response_audio_base64.startswith("Error"):
            raise HTTPException(status_code=500, detail=response_audio_base64)
        
        # Save to chat history
        chat_entry = ChatHistory(
            user_id=current_user.id,
            message=transcribed_text,
            response=response_content,
            message_type="audio"
        )
        db.add(chat_entry)
        db.commit()
        
        return {
            "status": "success",
            "response_text": response_content,
            "response_audio_base64": response_audio_base64,
            "timestamp": datetime.utcnow()
        }
    
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing audio: {str(e)}"
        )

@router.get("/history")
async def get_chat_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for current user"""
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": chat.id,
            "message": chat.message,
            "response": chat.response,
            "message_type": chat.message_type,
            "created_at": chat.created_at
        }
        for chat in history
    ]
