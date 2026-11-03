import json
import re

from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="llama3.2",
    temperature=0.4,
)


def generate_ai_response(prompt: str):
    """Generate a complete AI response."""
    try:
        response = llm.invoke(prompt)
        return response.content

    except Exception as error:
        print(f"Ollama Error: {error}")
        raise RuntimeError("Unable to generate AI response.")


def stream_ai_response(prompt: str):
    """Generate an AI response token by token."""
    try:
        for chunk in llm.stream(prompt):
            if chunk.content:
                yield chunk.content

    except Exception as error:
        print(f"Ollama Streaming Error: {error}")
        raise RuntimeError("Unable to stream AI response.")


def generate_meal_recommendations(profile: dict):
    prompt = f"""
You are Nutrio.AI, a careful and responsible nutrition assistant.

Generate personalized meal suggestions using the following user profile.

USER PROFILE:
Age: {profile.get("age")}
Gender: {profile.get("gender")}
Current weight: {profile.get("weight")} kg
Height: {profile.get("height")} cm
Goal: {profile.get("goal")}
Activity level: {profile.get("activityLevel")}
Dietary preference: {profile.get("dietaryPreference")}
Allergies: {profile.get("allergies", [])}
Disliked foods: {profile.get("dislikedFoods", [])}

REQUIREMENTS:

1. Generate 2 breakfast suggestions.
2. Generate 2 lunch suggestions.
3. Generate 2 dinner suggestions.
4. Generate 2 snack suggestions.
5. Respect all listed allergies and dietary restrictions.
6. Avoid disliked foods.
7. Use practical ingredients and realistic preparation instructions.
8. Do not claim that a meal treats or cures a medical condition.
9. Do not invent calorie, protein, carbohydrate, or fat values.
10. Set all nutrition values to null because no verified nutrition database is connected yet.
11. Do not invent food prices.
12. Return valid JSON only. Do not include Markdown or explanations outside JSON.

Use this exact JSON structure:

{{
  "meals": [
    {{
      "id": "unique-short-id",
      "category": "breakfast",
      "name": "Meal name",
      "description": "Short description",
      "ingredients": [
        "Ingredient and approximate quantity"
      ],
      "instructions": [
        "Preparation step"
      ],
      "cooking_time_minutes": 20,
      "nutrition": {{
        "calories": null,
        "protein_g": null,
        "carbohydrates_g": null,
        "fat_g": null
      }}
    }}
  ]
}}

Use only these category values:
breakfast, lunch, dinner, snacks.

The response must contain exactly 8 meal suggestions.
"""

    try:
        response = llm.invoke(prompt)

        content = response.content.strip()

        content = re.sub(
            r"^```(?:json)?\s*|\s*```$",
            "",
            content,
            flags=re.IGNORECASE,
        ).strip()

        result = json.loads(content)

        if not isinstance(result, dict):
            raise ValueError("AI response must be a JSON object.")

        meals = result.get("meals")

        if not isinstance(meals, list) or len(meals) != 8:
            raise ValueError("AI did not return the expected meal list.")

        valid_categories = {
            "breakfast",
            "lunch",
            "dinner",
            "snacks",
        }

        validated_meals = []

        for index, meal in enumerate(meals):
            if not isinstance(meal, dict):
                raise ValueError("Invalid meal format.")

            category = meal.get("category")

            if category not in valid_categories:
                raise ValueError("Invalid meal category.")

            ingredients = meal.get("ingredients", [])
            instructions = meal.get("instructions", [])

            if not isinstance(ingredients, list):
                ingredients = []

            if not isinstance(instructions, list):
                instructions = []

            cooking_time = meal.get("cooking_time_minutes")

            if not isinstance(cooking_time, int) or cooking_time <= 0:
                cooking_time = None

            validated_meals.append({
                "id": f"ai-meal-{index + 1}",
                "category": category,
                "name": str(meal.get("name", "Meal suggestion")),
                "description": str(meal.get("description", "")),
                "ingredients": [str(item) for item in ingredients],
                "instructions": [str(item) for item in instructions],
                "cooking_time_minutes": cooking_time,
                "nutrition": {
                    "calories": None,
                    "protein_g": None,
                    "carbohydrates_g": None,
                    "fat_g": None,
                },
            })

        return {"meals": validated_meals}

    except Exception as error:
        print(f"Meal Recommendation Error: {error}")
        raise RuntimeError(
            "Unable to generate valid meal recommendations."
        )