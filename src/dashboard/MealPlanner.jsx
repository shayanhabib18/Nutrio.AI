import { useEffect, useState } from 'react'

import {
  Sparkles,
  LoaderCircle,
  CalendarDays,
  Clock,
  Flame,
  Utensils,
  ChevronLeft,
  ChevronRight,
  X,
  ChefHat,
  Check,
  AlertCircle,
  Lock,
  History,
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')

const categories = [
  { id: 'breakfast', label: 'Breakfast', icon: '☀️' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snacks', label: 'Snacks', icon: '🍎' },
]

function getList(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }

  return []
}

function getLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function MealPlanner() {
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [meals, setMeals] = useState([])
  const [savedPlan, setSavedPlan] = useState(null)

  const [loadingAI, setLoadingAI] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(false)

  const [activeCategory, setActiveCategory] = useState('breakfast')
  const [selectedMeal, setSelectedMeal] = useState(null)

  const [selectedDate, setSelectedDate] = useState(new Date())

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Load the user's profile.
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      if (!user?.id) {
        setLoadingProfile(false)
        return
      }

      setLoadingProfile(true)
      setError('')

      try {
        const [
          personalResult,
          healthResult,
          lifestyleResult,
          goalsResult,
          foodResult,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle(),

          supabase
            .from('health_information')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),

          supabase
            .from('lifestyle_information')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),

          supabase
            .from('nutrition_goals')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),

          supabase
            .from('food_preferences')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
        ])

        const results = [
          personalResult,
          healthResult,
          lifestyleResult,
          goalsResult,
          foodResult,
        ]

        const failed = results.find((result) => result.error)

        if (failed) throw failed.error

        if (!personalResult.data || !goalsResult.data) {
          throw new Error(
            'Please complete your profile and nutrition goals first.'
          )
        }

        if (!cancelled) {
          setProfile({
            personal: personalResult.data,
            health: healthResult.data,
            lifestyle: lifestyleResult.data,
            goals: goalsResult.data,
            food: foodResult.data,
          })
        }
      } catch (err) {
        console.error('Profile loading error:', err)

        if (!cancelled) {
          setError(err.message || 'Unable to load your profile.')
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  // Load the saved plan whenever the selected date changes.
  useEffect(() => {
    let cancelled = false

    async function loadSavedPlan() {
      if (!user?.id) return

      setLoadingPlan(true)
      setError('')
      setNotice('')
      setSavedPlan(null)
      setMeals([])
      setSelectedMeal(null)

      try {
        const planDate = getLocalDateString(selectedDate)

        const { data, error: queryError } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('plan_date', planDate)
          .maybeSingle()

        if (queryError) throw queryError

        if (cancelled) return

        if (data) {
          if (!Array.isArray(data.meals)) {
            throw new Error('The saved meal plan has an invalid format.')
          }

          setSavedPlan(data)
          setMeals(data.meals)
        }
      } catch (err) {
        console.error('Saved plan loading error:', err)

        if (!cancelled) {
          setError(err.message || 'Unable to load the saved meal plan.')
        }
      } finally {
        if (!cancelled) {
          setLoadingPlan(false)
        }
      }
    }

    loadSavedPlan()

    return () => {
      cancelled = true
    }
  }, [user?.id, selectedDate])

  // Prepare the actual profile data for the AI backend.
  function prepareProfile() {
    if (!profile) {
      throw new Error('Your profile is not available.')
    }

    const { personal, health, lifestyle, goals, food } = profile

    const age = Number(personal.age)
    const weight = Number(personal.current_weight)
    const height = Number(personal.height)

    const missing = []

    if (!Number.isFinite(age) || age <= 0) missing.push('age')
    if (!personal.gender) missing.push('gender')

    if (!Number.isFinite(weight) || weight <= 0) {
      missing.push('current weight')
    }

    if (!Number.isFinite(height) || height <= 0) {
      missing.push('height')
    }

    if (!goals.primary_goal) missing.push('nutrition goal')
    if (!lifestyle?.activity_level) missing.push('activity level')

    if (missing.length > 0) {
      throw new Error(
        `Please complete these profile fields: ${missing.join(', ')}.`
      )
    }

    const dietaryPreferences = [
      lifestyle?.food_preference,
      health?.dietary_restrictions,
      ...getList(food?.cuisines),
    ].filter(Boolean)

    return {
      age,
      gender: String(personal.gender),
      weight,
      height,
      goal: String(goals.primary_goal),
      activityLevel: String(lifestyle.activity_level),

      dietaryPreference:
        [...new Set(dietaryPreferences)].join(', ') ||
        'No specific preference',

      allergies: getList(health?.allergies),
      dislikedFoods: getList(food?.disliked_foods),
    }
  }

  // Generate and save a meal plan only if the date has no existing plan.
  async function generateMealPlan() {
    if (!user?.id || savedPlan || loadingAI || loadingPlan) return

    setLoadingAI(true)
    setError('')
    setNotice('')
    setSelectedMeal(null)

    const planDate = getLocalDateString(selectedDate)

    try {
      // Check the database before calling Ollama.
      const { data: existingPlan, error: checkError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_date', planDate)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingPlan) {
        setSavedPlan(existingPlan)
        setMeals(existingPlan.meals)
        setNotice('Your existing saved meal plan has been loaded.')
        return
      }

      // Generate recommendations using the user's real profile.
      const requestData = prepareProfile()

      const response = await fetch(
        `${API_BASE_URL}/api/ai/meal-recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to generate your meal plan.'
        )
      }

      if (
        !data.success ||
        !Array.isArray(data.recommendations?.meals) ||
        data.recommendations.meals.length === 0
      ) {
        throw new Error(
          'The AI returned an invalid meal plan. Please try again.'
        )
      }

      // Save the generated plan permanently.
      const { data: newPlan, error: saveError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          plan_date: planDate,
          meals: data.recommendations.meals,
        })
        .select()
        .single()

      if (saveError) {
        // Another request may have saved the same date first.
        if (saveError.code === '23505') {
          const { data: existing, error: fetchError } = await supabase
            .from('meal_plans')
            .select('*')
            .eq('user_id', user.id)
            .eq('plan_date', planDate)
            .single()

          if (fetchError) throw fetchError

          setSavedPlan(existing)
          setMeals(existing.meals)
          setNotice('Your existing saved meal plan has been loaded.')
          return
        }

        throw saveError
      }

      setSavedPlan(newPlan)
      setMeals(newPlan.meals)

      setNotice(
        'Your meal plan has been saved and locked for this date.'
      )
    } catch (err) {
      console.error('Meal generation error:', err)

      setError(
        err.message || 'Unable to connect to Nutrio AI.'
      )
    } finally {
      setLoadingAI(false)
    }
  }

  // Calendar calculations.
  const selectedDateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const weekStart = new Date(selectedDate)
  const weekday = (weekStart.getDay() + 6) % 7

  weekStart.setDate(weekStart.getDate() - weekday)

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return date
  })

  function changeWeek(direction) {
    const nextDate = new Date(selectedDate)
    nextDate.setDate(nextDate.getDate() + direction * 7)
    setSelectedDate(nextDate)
  }

  const visibleMeals = meals.filter(
    (meal) => meal.category === activeCategory
  )

  const isLoading = loadingAI || loadingPlan

  if (loadingProfile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <LoaderCircle
          className="animate-spin text-[#315C45]"
          size={36}
        />

        <p className="mt-4 text-gray-500">
          Loading your nutrition profile...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-7 pb-10">

      {/* Page Header */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#315C45]">
            <Sparkles size={16} />
            PERSONALIZED NUTRITION
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Meal Planner
          </h1>

          <p className="mt-2 text-gray-500">
            Your personalized daily meal plans, saved in one place.
          </p>
        </div>

        <button
          onClick={generateMealPlan}
          disabled={!profile || isLoading || !!savedPlan}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315C45] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#264B37] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : savedPlan ? (
            <Lock size={18} />
          ) : (
            <Sparkles size={18} />
          )}

          {loadingProfile
            ? 'Loading profile...'
            : loadingPlan
              ? 'Loading saved plan...'
              : loadingAI
                ? 'Creating your meal plan...'
                : savedPlan
                  ? 'Meal Plan Locked'
                  : 'Generate AI Meal Plan'}
        </button>
      </section>

      {/* Error Message */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />

          <div className="flex-1 text-sm">
            {error}
          </div>

          <button
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Success Message */}

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-800">
          <Check size={17} />
          <span>{notice}</span>

          <button
            onClick={() => setNotice('')}
            className="ml-auto"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Saved Plan Status */}

      {savedPlan && (
        <div className="flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#315C45]">
              <Lock size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-green-900">
                This meal plan is saved and locked
              </h3>

              <p className="mt-1 text-sm text-green-800">
                Your plan cannot be regenerated or modified for this date.
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-green-800">
            Saved{' '}
            {new Date(savedPlan.created_at).toLocaleString()}
          </span>
        </div>
      )}

      {/* Weekly Calendar */}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-[#315C45]" />

              <h2 className="font-bold text-gray-900">
                Your Schedule
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Select a date to view its saved meal plan.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <button
              onClick={() => changeWeek(-1)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
              aria-label="Previous week"
            >
              <ChevronLeft size={19} />
            </button>

            <span className="min-w-[130px] text-center text-sm font-semibold text-[#315C45]">
              {weekStart.toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
              })}
            </span>

            <button
              onClick={() => changeWeek(1)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
              aria-label="Next week"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date) => {
            const active =
              date.toDateString() === selectedDate.toDateString()

            const isToday =
              date.toDateString() === new Date().toDateString()

            return (
              <button
                key={getLocalDateString(date)}
                onClick={() => setSelectedDate(date)}
                className={`rounded-xl border px-1 py-3 text-center transition ${
                  active
                    ? 'border-[#315C45] bg-[#315C45] text-white shadow-sm'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50'
                }`}
              >
                <span className="block text-xs opacity-80">
                  {date.toLocaleDateString(undefined, {
                    weekday: 'short',
                  })}
                </span>

                <span className="mt-1 block text-lg font-bold">
                  {date.getDate()}
                </span>

                <span className="mt-1 block text-[10px]">
                  {isToday ? 'Today' : '\u00A0'}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Selected date
          </p>

          <p className="text-sm font-semibold text-gray-800">
            {selectedDateLabel}
          </p>
        </div>
      </section>

      {/* Daily Meal Plan */}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                Daily Meal Plan
              </h2>

              {savedPlan && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-[#315C45]">
                  <Lock size={12} />
                  Locked
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {selectedDateLabel}
            </p>
          </div>

          {savedPlan && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <History size={16} />
              Saved meal plan
            </div>
          )}
        </div>

        {/* Category Tabs */}

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const categoryCount = meals.filter(
              (meal) => meal.category === category.id
            ).length

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeCategory === category.id
                    ? 'bg-[#315C45] text-white'
                    : 'border border-gray-100 bg-white text-gray-600 hover:bg-green-50'
                }`}
              >
                <span>{category.icon}</span>
                {category.label}

                {meals.length > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeCategory === category.id
                        ? 'bg-white/20'
                        : 'bg-gray-100'
                    }`}
                  >
                    {categoryCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Loading State */}

        {isLoading && (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
              <LoaderCircle
                size={28}
                className="animate-spin text-[#315C45]"
              />
            </div>

            <h3 className="mt-5 font-bold text-gray-900">
              {loadingAI
                ? 'Preparing your personalized meals'
                : 'Loading your saved meal plan'}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {loadingAI
                ? 'Nutrio AI is considering your saved profile and preferences.'
                : 'Checking your meal plan history.'}
            </p>
          </div>
        )}

        {/* Empty State */}

        {!isLoading && meals.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-[#315C45]">
              <ChefHat size={30} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              No meal plan for this date
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Generate a personalized meal plan using your saved profile,
              food preferences, allergies, and nutrition goals. Once saved,
              the plan will be locked for this date.
            </p>

            <button
              onClick={generateMealPlan}
              disabled={!profile || loadingAI || loadingPlan}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#315C45] px-5 py-3 font-semibold text-white transition hover:bg-[#264B37] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={17} />
              Generate Meal Plan
            </button>
          </div>
        )}

        {/* Meal Cards */}

        {!isLoading && meals.length > 0 && (
          <>
            {visibleMeals.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
                <Utensils
                  size={30}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 font-semibold text-gray-700">
                  No meals in this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {visibleMeals.map((meal, index) => (
                  <MealCard
                    key={meal.id || `${meal.category}-${index}`}
                    meal={meal}
                    onView={() => setSelectedMeal(meal)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Recipe Details Modal */}

      {selectedMeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMeal(null)
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-gray-100 bg-white p-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#315C45]">
                  {selectedMeal.category}
                </span>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedMeal.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {selectedMeal.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedMeal(null)}
                className="rounded-lg p-2 transition hover:bg-gray-100"
                aria-label="Close recipe"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={17} className="text-[#315C45]" />

                {selectedMeal.cooking_time_minutes
                  ? `${selectedMeal.cooking_time_minutes} minutes`
                  : 'Cooking time not provided'}
              </div>

              <div>
                <h3 className="mb-3 font-bold text-gray-900">
                  Ingredients
                </h3>

                {selectedMeal.ingredients?.length ? (
                  <ul className="space-y-2">
                    {selectedMeal.ingredients.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm text-gray-600"
                      >
                        <span className="text-[#315C45]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">
                    No ingredients provided.
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-3 font-bold text-gray-900">
                  Preparation
                </h3>

                {selectedMeal.instructions?.length ? (
                  <ol className="space-y-3">
                    {selectedMeal.instructions.map((step, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-600"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-[#315C45]">
                          {index + 1}
                        </span>

                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-400">
                    No preparation instructions provided.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-800">
                <Lock size={17} />
                This recipe is part of your saved daily meal plan.
              </div>

              <button
                onClick={() => setSelectedMeal(null)}
                className="w-full rounded-xl bg-[#315C45] py-3 font-semibold text-white transition hover:bg-[#264B37]"
              >
                Close Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MealCard({ meal, onView }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-green-100 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#315C45]">
            {meal.category}
          </span>

          <h3 className="mt-2 text-lg font-bold text-gray-900">
            {meal.name}
          </h3>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#315C45]">
          <Utensils size={19} />
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
        {meal.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <Clock size={15} />

          {meal.cooking_time_minutes
            ? `${meal.cooking_time_minutes} min`
            : 'Time unavailable'}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
          <Lock size={13} />
          Saved
        </span>

        <button
          onClick={onView}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View Recipe
        </button>
      </div>
    </article>
  )
}

export default MealPlanner