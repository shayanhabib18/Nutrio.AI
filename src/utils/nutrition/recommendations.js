// src/utils/nutrition/recommendations.js

// Sample recipe database.
// Nutritional values are illustrative estimates per serving.

export const recipes = [
  {
    id: 1,
    name: 'Grilled Chicken Rice Bowl',
    category: 'Lunch',
    cuisine: 'Pakistani',
    calories: 450,
    protein: 40,
    carbohydrates: 45,
    fat: 12,
    cookingTime: 25,
    cost: 350,
    ingredients: ['chicken', 'rice', 'yogurt', 'spices'],
    allergens: ['dairy'],
    dietaryTags: ['high-protein'],
    description: 'Grilled chicken served with rice and yogurt.',
  },
  {
    id: 2,
    name: 'Vegetable Omelette',
    category: 'Breakfast',
    cuisine: 'Continental',
    calories: 280,
    protein: 20,
    carbohydrates: 10,
    fat: 17,
    cookingTime: 15,
    cost: 180,
    ingredients: ['eggs', 'tomatoes', 'onions', 'spinach'],
    allergens: ['eggs'],
    dietaryTags: ['vegetarian', 'low-carb'],
    description: 'A protein-rich omelette with fresh vegetables.',
  },
  {
    id: 3,
    name: 'Oats and Banana Bowl',
    category: 'Breakfast',
    cuisine: 'Continental',
    calories: 320,
    protein: 12,
    carbohydrates: 55,
    fat: 7,
    cookingTime: 10,
    cost: 150,
    ingredients: ['oats', 'banana', 'milk', 'honey'],
    allergens: ['dairy'],
    dietaryTags: ['vegetarian'],
    description: 'A simple bowl of oats, banana and milk.',
  },
  {
    id: 4,
    name: 'Lentil Daal with Roti',
    category: 'Dinner',
    cuisine: 'Pakistani',
    calories: 380,
    protein: 18,
    carbohydrates: 60,
    fat: 8,
    cookingTime: 30,
    cost: 160,
    ingredients: ['lentils', 'wheat', 'tomatoes', 'spices'],
    allergens: ['gluten'],
    dietaryTags: ['vegetarian'],
    description: 'Traditional lentils served with whole-wheat roti.',
  },
  {
    id: 5,
    name: 'Grilled Fish with Vegetables',
    category: 'Dinner',
    cuisine: 'Mediterranean',
    calories: 390,
    protein: 35,
    carbohydrates: 20,
    fat: 18,
    cookingTime: 30,
    cost: 450,
    ingredients: ['fish', 'broccoli', 'carrots', 'olive oil'],
    allergens: ['fish'],
    dietaryTags: ['high-protein', 'low-carb'],
    description: 'Grilled fish served with fresh vegetables.',
  },
  {
    id: 6,
    name: 'Chickpea Salad',
    category: 'Lunch',
    cuisine: 'Mediterranean',
    calories: 300,
    protein: 15,
    carbohydrates: 40,
    fat: 9,
    cookingTime: 12,
    cost: 200,
    ingredients: ['chickpeas', 'cucumber', 'tomatoes', 'lemon'],
    allergens: [],
    dietaryTags: ['vegan', 'vegetarian'],
    description: 'A refreshing salad made with chickpeas and vegetables.',
  },
  {
    id: 7,
    name: 'Chicken Sandwich',
    category: 'Lunch',
    cuisine: 'Continental',
    calories: 420,
    protein: 32,
    carbohydrates: 42,
    fat: 12,
    cookingTime: 15,
    cost: 250,
    ingredients: ['chicken', 'bread', 'lettuce', 'yogurt'],
    allergens: ['gluten', 'dairy'],
    dietaryTags: ['high-protein'],
    description: 'A chicken sandwich with fresh lettuce.',
  },
  {
    id: 8,
    name: 'Fruit and Nut Bowl',
    category: 'Snack',
    cuisine: 'Continental',
    calories: 220,
    protein: 6,
    carbohydrates: 30,
    fat: 10,
    cookingTime: 5,
    cost: 180,
    ingredients: ['apple', 'banana', 'almonds', 'walnuts'],
    allergens: ['nuts'],
    dietaryTags: ['vegetarian'],
    description: 'A healthy snack with fresh fruits and nuts.',
  },
]

// Normalize text for consistent comparisons.
function normalize(value) {
  return String(value ?? '').trim().toLowerCase()
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (!value) return []
  return [value]
}

// Check whether a recipe contains an ingredient the user dislikes.
function containsDislikedFood(recipe, dislikedFoods) {
  const ingredients = recipe.ingredients.map(normalize)

  return dislikedFoods.some((food) => {
    const disliked = normalize(food)

    return (
      disliked &&
      ingredients.some(
        (ingredient) =>
          ingredient.includes(disliked) ||
          disliked.includes(ingredient)
      )
    )
  })
}

// Exclude recipes containing declared allergens.
function containsAllergen(recipe, allergies) {
  const recipeAllergens = recipe.allergens.map(normalize)

  return allergies.some((allergy) => {
    const normalizedAllergy = normalize(allergy)

    return (
      normalizedAllergy &&
      recipeAllergens.includes(normalizedAllergy)
    )
  })
}

// Check dietary restrictions against recipe tags.
function violatesDietaryRestriction(recipe, restrictions) {
  const tags = recipe.dietaryTags.map(normalize)

  return restrictions.some((restriction) => {
    const value = normalize(restriction)

    if (value === 'vegan') {
      return !tags.includes('vegan')
    }

    if (value === 'vegetarian') {
      return !tags.includes('vegetarian') && !tags.includes('vegan')
    }

    if (value === 'gluten-free') {
      return recipe.allergens.includes('gluten')
    }

    if (value === 'dairy-free') {
      return recipe.allergens.includes('dairy')
    }

    return false
  })
}

// Apply user preferences and return suitable recipes.
export function filterRecipes(profile) {
  if (!profile) {
    return []
  }

  const allergies = toArray(profile.allergies)
  const dislikedFoods = toArray(profile.dislikedFoods)
  const dietaryRestrictions = toArray(profile.dietaryRestrictions)

  const preferredCuisines = toArray(profile.cuisines).map(normalize)

  const maxCookingTime = Number(profile.cookingTime)
  const dailyBudget = Number(profile.dailyFoodBudget)

  return recipes.filter((recipe) => {
    if (containsAllergen(recipe, allergies)) {
      return false
    }

    if (containsDislikedFood(recipe, dislikedFoods)) {
      return false
    }

    if (violatesDietaryRestriction(recipe, dietaryRestrictions)) {
      return false
    }

    if (
      Number.isFinite(maxCookingTime) &&
      maxCookingTime > 0 &&
      recipe.cookingTime > maxCookingTime
    ) {
      return false
    }

    // Do not recommend a single meal exceeding the entire daily budget.
    if (
      Number.isFinite(dailyBudget) &&
      dailyBudget > 0 &&
      recipe.cost > dailyBudget
    ) {
      return false
    }

    // Cuisine preference is a ranking preference, not a hard restriction.
    return true
  }).sort((a, b) => {
    const aPreferred = preferredCuisines.includes(normalize(a.cuisine))
    const bPreferred = preferredCuisines.includes(normalize(b.cuisine))

    return Number(bPreferred) - Number(aPreferred)
  })
}

// Return meals grouped by category.
export function getMealsByCategory(profile) {
  const filteredRecipes = filterRecipes(profile)

  return {
    breakfast: filteredRecipes.filter(
      (recipe) => recipe.category === 'Breakfast'
    ),

    lunch: filteredRecipes.filter(
      (recipe) => recipe.category === 'Lunch'
    ),

    dinner: filteredRecipes.filter(
      (recipe) => recipe.category === 'Dinner'
    ),

    snacks: filteredRecipes.filter(
      (recipe) => recipe.category === 'Snack'
    ),
  }
}