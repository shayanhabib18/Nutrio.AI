import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Utensils,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

function FoodPreferences() {
  const navigate = useNavigate()

  const getSavedData = () => {
    try {
      return JSON.parse(
        localStorage.getItem('nutrio_onboarding') || '{}'
      )
    } catch {
      return {}
    }
  }

  const savedData = getSavedData()

  const cuisineOptions = [
    'Pakistani',
    'Indian',
    'Chinese',
    'Italian',
    'Mediterranean',
    'Mexican',
    'Japanese',
    'Middle Eastern',
    'Other',
  ]

  const [formData, setFormData] = useState({
    cuisines: Array.isArray(savedData.cuisines)
      ? savedData.cuisines
      : [],
    favoriteFoods: savedData.favoriteFoods || '',
    dislikedFoods: savedData.dislikedFoods || '',
    dailyFoodBudget: savedData.dailyFoodBudget || '',
    cookingTime: savedData.cookingTime || '',
    cookingPreference: savedData.cookingPreference || '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (error) setError('')
  }

  const handleCuisineToggle = (cuisine) => {
    setFormData((previous) => {
      const updatedCuisines = previous.cuisines.includes(cuisine)
        ? previous.cuisines.filter((item) => item !== cuisine)
        : [...previous.cuisines, cuisine]

      return {
        ...previous,
        cuisines: updatedCuisines,
      }
    })

    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (
      formData.cuisines.length === 0 ||
      !formData.dailyFoodBudget ||
      !formData.cookingTime ||
      !formData.cookingPreference
    ) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)

    try {
      // Get the authenticated user.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError

      if (!user) {
        throw new Error('Your session has expired. Please log in again.')
      }

      // Get all previously saved onboarding information.
      const existingData = getSavedData()

      // Check that all previous onboarding steps are completed.
      const requiredFields = [
        'fullName',
        'age',
        'height',
        'currentWeight',
        'targetWeight',
        'healthConsent',
        'activityLevel',
        'exerciseFrequency',
        'sleepDuration',
        'dailyWaterIntake',
        'mealsPerDay',
        'foodPreference',
        'primaryGoal',
        'preferredPace',
      ]

      const missingFields = requiredFields.filter((field) => {
        const value = existingData[field]

        return (
          value === undefined ||
          value === null ||
          value === '' ||
          (field === 'healthConsent' && value !== true)
        )
      })

      if (missingFields.length > 0) {
        throw new Error(
          'Some onboarding information is missing. Please revisit the previous steps.'
        )
      }

      // Combine the saved information with the final step.
      const allData = {
        ...existingData,
        ...formData,
      }

      const userId = user.id

      // 1. Save personal information.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: allData.fullName.trim(),
            age: Number(allData.age),
            gender: allData.gender || null,
            height: Number(allData.height),
            current_weight: Number(allData.currentWeight),
            target_weight: Number(allData.targetWeight),
            onboarding_completed: false,
          },
          { onConflict: 'id' }
        )

      if (profileError) throw profileError

      // 2. Save health information and consent.
      const { error: healthError } = await supabase
        .from('health_information')
        .upsert(
          {
            user_id: userId,
            allergies: allData.allergies || '',
            intolerances: allData.intolerances || '',
            medical_conditions: allData.medicalConditions || '',
            medications: allData.medications || '',
            dietary_restrictions: allData.dietaryRestrictions || '',
            health_consent: true,
            health_consent_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (healthError) throw healthError

      // 3. Save lifestyle information.
      const { error: lifestyleError } = await supabase
        .from('lifestyle_information')
        .upsert(
          {
            user_id: userId,
            activity_level: allData.activityLevel,
            exercise_frequency: allData.exerciseFrequency,
            sleep_duration: allData.sleepDuration,
            daily_water_intake: allData.dailyWaterIntake,
            meals_per_day: allData.mealsPerDay,
            food_preference: allData.foodPreference,
          },
          { onConflict: 'user_id' }
        )

      if (lifestyleError) throw lifestyleError

      // 4. Save nutrition goals.
      const { error: goalsError } = await supabase
        .from('nutrition_goals')
        .upsert(
          {
            user_id: userId,
            primary_goal: allData.primaryGoal,
            preferred_pace: allData.preferredPace,
            additional_goals: allData.additionalGoals || '',
          },
          { onConflict: 'user_id' }
        )

      if (goalsError) throw goalsError

      // 5. Save food preferences.
      const { error: preferencesError } = await supabase
        .from('food_preferences')
        .upsert(
          {
            user_id: userId,
            cuisines: allData.cuisines,
            favorite_foods: allData.favoriteFoods || '',
            disliked_foods: allData.dislikedFoods || '',
            daily_food_budget: allData.dailyFoodBudget,
            cooking_time: allData.cookingTime,
            cooking_preference: allData.cookingPreference,
          },
          { onConflict: 'user_id' }
        )

      if (preferencesError) throw preferencesError

      // 6. Mark onboarding complete only after all saves succeed.
      const { error: completionError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
        })
        .eq('id', userId)

      if (completionError) throw completionError

      // Clear the temporary onboarding information.
      localStorage.removeItem('nutrio_onboarding')

      // Open the dashboard.
      navigate('/dashboard', { replace: true })

    } catch (err) {
      console.error('Onboarding error:', err)

      setError(
        err.message || 'Unable to complete setup. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100'

  return (
    <div className="min-h-screen bg-[#f6f9f6] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Utensils size={28} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Your Food Preferences
          </h1>

          <p className="mt-2 text-gray-500">
            Tell us what you enjoy eating so we can personalize your meals.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-green-700">
              Step 5 of 5
            </span>

            <span className="text-gray-500">
              Food Preferences
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-full rounded-full bg-green-600" />
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"
        >
          {/* Cuisine */}
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Which cuisines do you enjoy?
            </h2>

            <p className="mb-5 mt-2 text-sm text-gray-500">
              Select all that apply.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cuisineOptions.map((cuisine) => {
                const selected = formData.cuisines.includes(cuisine)

                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => handleCuisineToggle(cuisine)}
                    aria-pressed={selected}
                    disabled={loading}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      selected
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-green-400'
                    }`}
                  >
                    {cuisine}

                    {selected && <Check size={17} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Favorite Foods */}
          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              What are your favorite foods?

              <span className="ml-2 text-gray-400">
                (Optional)
              </span>
            </label>

            <textarea
              name="favoriteFoods"
              value={formData.favoriteFoods}
              onChange={handleChange}
              rows="3"
              placeholder="Enter foods you enjoy..."
              disabled={loading}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Disliked Foods */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Which foods do you dislike or want to avoid?

              <span className="ml-2 text-gray-400">
                (Optional)
              </span>
            </label>

            <textarea
              name="dislikedFoods"
              value={formData.dislikedFoods}
              onChange={handleChange}
              rows="3"
              placeholder="Enter foods you dislike..."
              disabled={loading}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Budget */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              What is your daily food budget? *
            </label>

            <select
              name="dailyFoodBudget"
              value={formData.dailyFoodBudget}
              onChange={handleChange}
              required
              disabled={loading}
              className={inputClass}
            >
              <option value="">Select your budget</option>
              <option value="low">Budget-friendly</option>
              <option value="moderate">Moderate</option>
              <option value="flexible">Flexible</option>
              <option value="no-limit">No specific budget</option>
            </select>
          </div>

          {/* Cooking Time */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              How much time can you spend cooking daily? *
            </label>

            <select
              name="cookingTime"
              value={formData.cookingTime}
              onChange={handleChange}
              required
              disabled={loading}
              className={inputClass}
            >
              <option value="">Select cooking time</option>
              <option value="under-15">Less than 15 minutes</option>
              <option value="15-30">15–30 minutes</option>
              <option value="30-60">30–60 minutes</option>
              <option value="over-60">More than 60 minutes</option>
            </select>
          </div>

          {/* Cooking Preference */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              How do you usually get your meals? *
            </label>

            <select
              name="cookingPreference"
              value={formData.cookingPreference}
              onChange={handleChange}
              required
              disabled={loading}
              className={inputClass}
            >
              <option value="">Select an option</option>
              <option value="cook-at-home">I mostly cook at home</option>
              <option value="eat-out">I mostly eat outside</option>
              <option value="both">A combination of both</option>
              <option value="someone-cooks">
                Someone else prepares my meals
              </option>
            </select>
          </div>

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/onboarding/goals')}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-green-700 px-7 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Complete Setup'}

              {!loading && <Check size={18} />}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Your preferences help us create meals that fit your lifestyle.
        </p>

      </div>
    </div>
  )
}

export default FoodPreferences