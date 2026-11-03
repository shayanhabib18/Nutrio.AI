import {
  Search,
  Clock,
  Flame,
  Heart,
  ChefHat,
  Sparkles,
  RefreshCw,
  X,
  Utensils,
  AlertCircle,
  LoaderCircle,
  BookOpen,
} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks']

function Recipes() {
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const [recipes, setRecipes] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

  // Load the user's actual profile from Supabase.
  const loadProfile = async () => {
    if (!user?.id) {
      throw new Error('Please log in to view your personalized recipes.')
    }

    const [
      profileResult,
      healthResult,
      lifestyleResult,
      goalsResult,
      preferencesResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),

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
      profileResult,
      healthResult,
      lifestyleResult,
      goalsResult,
      preferencesResult,
    ]

    const failedRequest = results.find((result) => result.error)

    if (failedRequest) {
      throw new Error(failedRequest.error.message)
    }

    const userProfile = {
      profile: profileResult.data,
      health: healthResult.data,
      lifestyle: lifestyleResult.data,
      goals: goalsResult.data,
      preferences: preferencesResult.data,
    }

    setProfile(userProfile)

    return userProfile
  }

  // Convert the user's profile into the format expected by FastAPI.
  const prepareAIRequest = (userProfile) => {
    const personal = userProfile.profile
    const health = userProfile.health || {}
    const lifestyle = userProfile.lifestyle || {}
    const goals = userProfile.goals || {}
    const preferences = userProfile.preferences || {}

    if (
      !personal?.age ||
      !personal?.gender ||
      !personal?.current_weight ||
      !personal?.height ||
      !goals?.primary_goal ||
      !lifestyle?.activity_level
    ) {
      throw new Error(
        'Your profile is incomplete. Please complete your personal information, lifestyle, and nutrition goals first.'
      )
    }

    return {
      age: Number(personal.age),
      gender: personal.gender,
      weight: Number(personal.current_weight),
      height: Number(personal.height),

      goal: goals.primary_goal,
      activityLevel: lifestyle.activity_level,

      dietaryPreference:
        preferences.food_preference ||
        lifestyle.food_preference ||
        'No specific preference',

      allergies: [
        ...(Array.isArray(health.allergies) ? health.allergies : []),
        ...(Array.isArray(health.intolerances) ? health.intolerances : []),
        ...(Array.isArray(health.dietary_restrictions)
          ? health.dietary_restrictions
          : []),
      ],

      dislikedFoods: Array.isArray(preferences.disliked_foods)
        ? preferences.disliked_foods
        : [],
    }
  }

  // Generate recipes using the existing backend AI endpoint.
  const generateRecipes = async (userProfile, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const requestData = prepareAIRequest(userProfile)

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

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.detail ||
            data.message ||
            'Unable to generate recipes. Please try again.'
        )
      }

      const generatedMeals = data.recommendations?.meals

      if (!Array.isArray(generatedMeals) || generatedMeals.length === 0) {
        throw new Error('The AI did not return any recipes. Please try again.')
      }

      const formattedRecipes = generatedMeals.map((meal, index) => ({
        id: meal.id || `${Date.now()}-${index}`,
        name: meal.name || 'Untitled recipe',
        category: formatCategory(meal.category),
        description: meal.description || '',
        ingredients: Array.isArray(meal.ingredients)
          ? meal.ingredients
          : [],
        instructions: Array.isArray(meal.instructions)
          ? meal.instructions
          : [],
        cookingTime: meal.cooking_time_minutes || null,

        // Only show nutrition if a trusted source has supplied it.
        nutrition: meal.nutrition || null,
      }))

      setRecipes(formattedRecipes)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCategory = (category) => {
    const value = String(category || '').toLowerCase()

    const categoryMap = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snacks: 'Snacks',
      snack: 'Snacks',
    }

    return categoryMap[value] || 'Other'
  }

  // Load profile and generate the first set of recipes.
  useEffect(() => {
    let active = true

    const initializeRecipes = async () => {
      try {
        setLoading(true)
        setError('')

        const userProfile = await loadProfile()

        if (active) {
          await generateRecipes(userProfile)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load your profile.')
          setLoading(false)
        }
      }
    }

    initializeRecipes()

    return () => {
      active = false
    }
  }, [user?.id])

  // Generate another set of recipes.
  const handleRefresh = async () => {
    try {
      setError('')

      const userProfile = profile || (await loadProfile())

      await generateRecipes(userProfile, true)
    } catch (err) {
      setError(err.message || 'Unable to refresh recipes.')
      setRefreshing(false)
    }
  }

  // Search and category filtering.
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(search.toLowerCase()) ||
        recipe.category.toLowerCase().includes(search.toLowerCase()) ||
        recipe.description.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        activeCategory === 'All' ||
        recipe.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [recipes, search, activeCategory])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <LoaderCircle size={38} className="animate-spin text-[#315C45]" />

        <h2 className="mt-5 text-lg font-semibold text-gray-800">
          Creating your personalized recipes
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          AI is considering your profile and food preferences.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Healthy Recipes
            </h1>

            <Sparkles className="text-[#315C45]" size={23} />
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Discover AI-generated recipes based on your personal nutrition
            profile.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#315C45] px-5 py-3 font-semibold text-white transition hover:bg-[#264B37] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={refreshing ? 'animate-spin' : ''}
          />

          {refreshing ? 'Generating...' : 'Refresh Recipes'}
        </button>
      </div>

      {/* Profile-based recommendation notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
        <Sparkles size={21} className="mt-0.5 shrink-0 text-[#315C45]" />

        <div>
          <h3 className="font-semibold text-[#315C45]">
            Personalized recommendations
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            These recipes are generated using your saved nutrition goals,
            dietary preferences, allergies, and lifestyle information.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />

          <div>
            <p className="font-semibold text-red-700">
              Unable to load recipes
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              onClick={handleRefresh}
              className="mt-3 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search recipes, ingredients or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-[#315C45] focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              activeCategory === category
                ? 'bg-[#315C45] text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-[#315C45]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Recipe count */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Recommended for you
        </h2>

        <span className="text-sm text-gray-500">
          {filteredRecipes.length} recipes
        </span>
      </div>

      {/* Recipe cards */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      ) : (
        !error && (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <ChefHat size={42} className="mx-auto text-gray-300" />

            <h3 className="mt-4 font-semibold text-gray-800">
              No recipes found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try another search or generate a new set of recipes.
            </p>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-5 rounded-xl bg-[#315C45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#264B37] disabled:opacity-60"
            >
              Generate Recipes
            </button>
          </div>
        )
      )}

      {/* Recipe details modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  )
}

function RecipeCard({ recipe, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <ChefHat size={48} className="text-[#315C45]" />
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#315C45]">
            {recipe.category}
          </span>

          <Sparkles size={17} className="text-[#315C45]" />
        </div>

        <h3 className="text-lg font-bold text-gray-900">
          {recipe.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
          {recipe.description || 'AI-generated recipe recommendation.'}
        </p>

        <div className="mt-5 flex items-center gap-5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock size={16} />

            {recipe.cookingTime
              ? `${recipe.cookingTime} min`
              : 'Time unavailable'}
          </span>

          <span className="flex items-center gap-1.5">
            <Flame size={16} />

            {recipe.nutrition?.calories != null
              ? `${recipe.nutrition.calories} kcal`
              : 'Calories unavailable'}
          </span>
        </div>

        <button
          onClick={onView}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#315C45] py-3 font-semibold text-white transition hover:bg-[#264B37]"
        >
          <BookOpen size={17} />
          View Recipe
        </button>
      </div>
    </div>
  )
}

function RecipeModal({ recipe, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white p-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#315C45]">
              {recipe.category}
            </span>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {recipe.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-7 p-5 sm:p-7">
          {/* Description */}
          <div>
            <p className="leading-7 text-gray-600">
              {recipe.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Clock size={17} />

                {recipe.cookingTime
                  ? `${recipe.cookingTime} minutes`
                  : 'Cooking time unavailable'}
              </span>

              <span className="flex items-center gap-2">
                <Utensils size={17} />

                {recipe.category}
              </span>
            </div>
          </div>

          {/* Ingredients */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-gray-900">
              Ingredients
            </h3>

            {recipe.ingredients.length > 0 ? (
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#315C45]" />

                    {ingredient}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Ingredients are not available.
              </p>
            )}
          </section>

          {/* Instructions */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-gray-900">
              Preparation Instructions
            </h3>

            {recipe.instructions.length > 0 ? (
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-[#315C45]">
                      {index + 1}
                    </span>

                    <p className="pt-1 text-sm leading-6 text-gray-600">
                      {instruction}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-500">
                Preparation instructions are not available.
              </p>
            )}
          </section>

          {/* Nutrition */}
          <section className="rounded-xl bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-800">
              Nutrition Information
            </h3>

            <p className="text-sm leading-6 text-gray-500">
              {recipe.nutrition?.calories != null
                ? `Calories: ${recipe.nutrition.calories} kcal`
                : 'Verified nutrition information is not available for this recipe yet.'}
            </p>
          </section>
        </div>

        <div className="border-t border-gray-100 p-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#315C45] py-3 font-semibold text-white hover:bg-[#264B37]"
          >
            Close Recipe
          </button>
        </div>
      </div>
    </div>
  )
}

export default Recipes