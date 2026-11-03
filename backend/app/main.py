import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.ollama_service import (
    generate_ai_response,
    generate_meal_recommendations,
    stream_ai_response,
)


# --------------------------------------------------
# Initialize FastAPI
# --------------------------------------------------

app = FastAPI(
    title="Nutrio.AI API",
    description="AI-powered nutrition and meal planning backend",
    version="1.0.0",
)


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request Models
# --------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class MealRecommendationRequest(BaseModel):
    age: int = Field(gt=0, le=120)
    gender: str
    weight: float = Field(gt=0, le=500)
    height: float = Field(gt=0, le=300)
    goal: str
    activityLevel: str
    dietaryPreference: str
    allergies: list[str] = Field(default_factory=list)
    dislikedFoods: list[str] = Field(default_factory=list)


# --------------------------------------------------
# Home Endpoint
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to Nutrio.AI API",
        "status": "Running",
    }


# --------------------------------------------------
# Health Check Endpoint
# --------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "Nutrio.AI",
    }


# --------------------------------------------------
# Normal AI Chat Endpoint
# --------------------------------------------------

@app.post("/api/ai/chat")
def ai_chat(request: ChatRequest):
    try:
        response = generate_ai_response(request.message)

        return {
            "success": True,
            "response": response,
        }

    except Exception as error:
        print(f"AI Chat Error: {error}")

        raise HTTPException(
            status_code=503,
            detail="AI service is currently unavailable.",
        )


# --------------------------------------------------
# Streaming AI Chat Endpoint
# --------------------------------------------------

@app.post("/api/ai/chat/stream")
def ai_chat_stream(request: ChatRequest):

    def generate():
        try:
            for token in stream_ai_response(request.message):

                if token:
                    token_data = json.dumps({
                        "token": token,
                    })

                    yield f"data: {token_data}\n\n"

            # Tell the frontend that generation is complete.
            yield "data: [DONE]\n\n"

        except Exception as error:
            print(f"AI Streaming Error: {error}")

            error_data = json.dumps({
                "error": "AI service is currently unavailable.",
            })

            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# --------------------------------------------------
# AI Meal Recommendation Endpoint
# --------------------------------------------------

@app.post("/api/ai/meal-recommendations")
def meal_recommendations(request: MealRecommendationRequest):
    try:
        profile = request.model_dump()

        recommendations = generate_meal_recommendations(profile)

        return {
            "success": True,
            "recommendations": recommendations,
        }

    except Exception as error:
        print(f"Meal Recommendation Error: {error}")

        raise HTTPException(
            status_code=503,
            detail="Unable to generate meal recommendations.",
        )