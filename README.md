# 🥗 Nutrio.AI

### AI-Powered Personalized Nutrition & Meal Planning Platform

Nutrio.AI is an AI-powered nutrition and meal-planning application designed to help users make informed food choices through personalized meal recommendations and AI-assisted nutrition guidance.

The platform combines a modern React frontend, a FastAPI backend, Supabase for authentication and data storage, and locally running AI models through Ollama.

---

## ✨ Features

### 🔐 Authentication
- User registration and login.
- Supabase authentication.
- Protected dashboard routes.
- Password recovery pages.
- User-specific data access.

### 👤 Personalized Onboarding
Users provide information to personalize their nutrition experience:

- Personal information.
- Health information.
- Allergies and food intolerances.
- Lifestyle and activity level.
- Nutrition goals.
- Food preferences and disliked foods.
- Cooking preferences and daily food budget.

### 🍽️ AI Meal Planner
- Generate personalized meal recommendations.
- Consider user profile information and dietary preferences.
- Organize recommendations into breakfast, lunch, dinner, and snacks.
- View ingredients and cooking instructions.
- Save generated daily meal plans.
- Keep saved meal plans locked against modification.

### 📖 Recipes
- Generate AI-powered recipe suggestions.
- Filter recipes by category.
- Search available recipes.
- View ingredients and cooking instructions.
- Generate recommendations based on user preferences.

### 🤖 AI Nutrition Assistant
- AI-powered conversational nutrition assistance.
- Natural-language responses.
- Streaming response support through the backend API.
- Markdown-compatible response support planned for the frontend.

### 📊 Dashboard
- Personalized dashboard.
- Profile information.
- Nutrition goals.
- Current and target weight information.
- Access to meal planning, recipes, and AI assistance.

### 👥 Profile Management
- View and update personal information.
- Manage health information.
- Update lifestyle details.
- Modify nutrition goals.
- Manage food preferences.

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend
- Python
- FastAPI
- Pydantic
- Uvicorn

### AI & Machine Learning
- Ollama
- Llama 3.2
- LangChain
- Local AI inference

### Database & Authentication
- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)

### Development Tools
- Git
- GitHub
- VS Code
- Ubuntu

---

## 🏗️ Project Architecture

```text
Nutrio-AI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── ollama_service.py
│   │   ├── database.py
│   │   └── ...
│   │
│   ├── .env
│   └── requirements.txt
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── AuthLayout.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── dashboard/
│   │   ├── DashboardLayout.jsx
│   │   ├── Overview.jsx
│   │   ├── MealPlanner.jsx
│   │   ├── Recipes.jsx
│   │   ├── AIChat.jsx
│   │   ├── Progress.jsx
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   │
│   │   └── onboarding/
│   │
│   ├── lib/
│   │   └── supabase.js
│   │
│   ├── utils/
│   │   └── nutrition/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

*Note: The structure above represents the main application organization. Individual files and folders may vary as development continues.*

---

## ⚙️ Installation & Setup

Follow these instructions to run Nutrio.AI locally.

### 1. Clone the Repository

```bash
git clone https://github.com/shayanhabib18/Nutrio.AI.git
```

Navigate into the project:

```bash
cd Nutrio.AI
```

### 2. Frontend Setup

Install the frontend dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Replace the placeholder values with your actual Supabase project credentials.

Start the frontend:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

### 3. Backend Setup

Open another terminal:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_server_key
```

Use the appropriate server-side Supabase key for your backend configuration. Never expose a Supabase service-role key in frontend environment variables.

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend API:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### 4. Ollama Setup

Install Ollama from its official website:

https://ollama.com/

Download the Llama 3.2 model:

```bash
ollama pull llama3.2
```

Verify the installed model:

```bash
ollama list
```

Run the model:

```bash
ollama run llama3.2
```

Make sure Ollama is running before using the AI-powered features.

---

## 🔌 API Endpoints

The FastAPI backend currently provides the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API welcome message |
| GET | `/api/health` | Backend health check |
| POST | `/api/ai/chat` | Generate an AI chat response |
| POST | `/api/ai/chat/stream` | Generate a streaming AI chat response |
| POST | `/api/ai/meal-recommendations` | Generate AI meal recommendations |

### Example: AI Chat Request

**Endpoint:**

```text
POST /api/ai/chat
```

**Request Body:**

```json
{
  "message": "Suggest some healthy breakfast ideas."
}
```

### Example: Meal Recommendation Request

**Endpoint:**

```text
POST /api/ai/meal-recommendations
```

**Request Body:**

```json
{
  "age": 23,
  "gender": "Male",
  "weight": 70,
  "height": 175,
  "goal": "Maintain Weight",
  "activityLevel": "Moderately Active",
  "dietaryPreference": "No restrictions",
  "allergies": [],
  "dislikedFoods": []
}
```

These values are illustrative request parameters, not actual user data.

---

## 🗄️ Database Structure

Nutrio.AI uses Supabase PostgreSQL to store user-specific information.

The main application tables include:

| Table | Purpose |
|---|---|
| `profiles` | Personal and physical information |
| `health_information` | Allergies, intolerances, and health details |
| `lifestyle_information` | Activity, sleep, water intake, and lifestyle |
| `nutrition_goals` | User nutrition goals |
| `food_preferences` | Food preferences and cooking details |
| `nutrition_plan_history` | Nutrition plan history |
| `meal_plans` | Saved daily meal plans |

Row Level Security (RLS) is used to restrict access to user-specific records.

---

## 🔒 Security Considerations

- Supabase handles user authentication.
- Protected routes restrict access to authenticated pages.
- Row Level Security protects user-specific database records.
- Backend credentials are stored in environment variables.
- Sensitive environment files should never be committed to GitHub.
- Health-related information should only be accessed by authorized users.

---

## 🚀 Running the Complete Application

You need three services running:

| Service | Command |
|---|---|
| Ollama | `ollama run llama3.2` |
| Backend | `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` |
| Frontend | `npm run dev` |

Start each service in a separate terminal.

---

## 🎯 Project Goals

The main objectives of Nutrio.AI are to:

- Make personalized nutrition guidance more accessible.
- Help users discover meals based on their dietary preferences.
- Provide AI-assisted nutrition conversations.
- Organize meal recommendations in one platform.
- Give users control over their personal nutrition profiles.

---

## 🔮 Future Improvements

Potential areas for further development include:

- Verified nutrition data integration using a food composition database.
- Accurate calorie and macronutrient calculations.
- Persistent AI chat history using Supabase.
- Progress tracking with real user records.
- AI-generated shopping lists.
- More advanced personalized nutrition recommendations.
- Improved AI response performance.
- Mobile application support.

---

## 👨‍💻 Developer

**Shayan Habib**

Software Engineer | Full-Stack Developer

- GitHub: https://github.com/shayanhabib18
- LinkedIn: https://linkedin.com/in/shayanhabib18

---

## 📄 License

This project is currently under development. Licensing information can be added when a license is selected.
