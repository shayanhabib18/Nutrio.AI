import { Routes, Route, Navigate } from 'react-router-dom'

// Authentication pages
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'

// Onboarding pages
import PersonalInfo from './pages/onboarding/PersonalInfo.jsx'
import HealthInfo from './pages/onboarding/HealthInfo.jsx'
import LifestyleInfo from './pages/onboarding/LifestyleInfo.jsx'
import NutritionGoals from './pages/onboarding/NutritionGoals.jsx'
import FoodPreferences from './pages/onboarding/FoodPreferences.jsx'

// Dashboard pages
import DashboardLayout from './dashboard/DashboardLayout.jsx'
import Overview from './dashboard/Overview.jsx'
import MealPlanner from './dashboard/MealPlanner.jsx'
import Recipes from './dashboard/Recipes.jsx'
import AIChat from './dashboard/AIChat.jsx'
import Progress from './dashboard/Progress.jsx'
import Profile from './dashboard/Profile.jsx'

// Authentication protection
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Settings page
function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">
        Settings
      </h1>

      <p className="mt-2 text-gray-500">
        Manage your account settings.
      </p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Public authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected onboarding routes */}
      <Route
        path="/onboarding/personal"
        element={
          <ProtectedRoute>
            <PersonalInfo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/health"
        element={
          <ProtectedRoute>
            <HealthInfo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/lifestyle"
        element={
          <ProtectedRoute>
            <LifestyleInfo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/goals"
        element={
          <ProtectedRoute>
            <NutritionGoals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/preferences"
        element={
          <ProtectedRoute>
            <FoodPreferences />
          </ProtectedRoute>
        }
      />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="meals" element={<MealPlanner />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="ai-chat" element={<AIChat />} />
        <Route path="progress" element={<Progress />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App