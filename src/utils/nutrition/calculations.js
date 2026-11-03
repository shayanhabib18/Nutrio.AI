// src/utils/nutrition/calculations.js

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
}

/**
 * Calculate Basal Metabolic Rate (BMR)
 * Uses the Mifflin-St Jeor equation.
 *
 * Note: The equation uses male/female coefficients.
 * For other or unspecified gender values, we calculate
 * a range rather than assuming one.
 */
function calculateBMR({ age, gender, height, weight }) {
  const base = 10 * weight + 6.25 * height - 5 * age

  if (gender === 'male') {
    return {
      value: Math.round(base + 5),
      range: null,
    }
  }

  if (gender === 'female') {
    return {
      value: Math.round(base - 161),
      range: null,
    }
  }

  const lower = Math.round(base - 161)
  const upper = Math.round(base + 5)

  return {
    value: null,
    range: { min: lower, max: upper },
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE).
 */
function calculateTDEE(bmr, activityLevel) {
  const multiplier =
    ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.sedentary

  if (typeof bmr === 'number') {
    return Math.round(bmr * multiplier)
  }

  return {
    min: Math.round(bmr.min * multiplier),
    max: Math.round(bmr.max * multiplier),
  }
}

/**
 * Calculate daily calorie target based on the user's goal.
 * These are conservative demo estimates, not medical prescriptions.
 */
function calculateCalorieTarget(tdee, goal) {
  if (typeof tdee !== 'number') {
    return null
  }

  switch (goal) {
    case 'weight-loss':
      return Math.round(tdee * 0.9)

    case 'weight-gain':
    case 'build-muscle':
      return Math.round(tdee * 1.1)

    case 'maintain-weight':
    case 'general-health':
    default:
      return tdee
  }
}

/**
 * Estimate daily protein, fat and carbohydrate targets.
 */
function calculateMacros(calories, weight) {
  if (!calories) return null

  // General demo estimates:
  const protein = Math.round(weight * 1.2)
  const fat = Math.round((calories * 0.28) / 9)

  const proteinCalories = protein * 4
  const fatCalories = fat * 9

  const remainingCalories = Math.max(
    0,
    calories - proteinCalories - fatCalories
  )

  const carbohydrates = Math.round(remainingCalories / 4)

  return {
    protein,
    fat,
    carbohydrates,
  }
}

/**
 * Estimate daily water intake.
 * This is a general estimate, not a medical fluid prescription.
 */
function calculateWaterIntake(weight) {
  return Math.round(weight * 35)
}

/**
 * Main nutrition calculation function.
 * Receives the user's onboarding information.
 */
export function calculateNutrition(profile) {
  if (!profile) {
    throw new Error('User profile is required.')
  }

  const age = Number(profile.age)
  const height = Number(profile.height)
  const weight = Number(profile.currentWeight)

  if (
    !Number.isFinite(age) ||
    !Number.isFinite(height) ||
    !Number.isFinite(weight) ||
    age <= 0 ||
    height <= 0 ||
    weight <= 0
  ) {
    throw new Error('Valid age, height and weight are required.')
  }

  // Do not generate calorie targets for minors.
  if (age < 18) {
    return {
      status: 'professional-guidance-required',
      message:
        'Automated calorie and weight-change targets are not provided for users under 18. Please consult a qualified healthcare professional.',
    }
  }

  // Avoid automated targets for disclosed medical conditions.
  const medicalConditions = profile.medicalConditions

  const hasMedicalConditions =
    Array.isArray(medicalConditions) && medicalConditions.length > 0

  if (hasMedicalConditions) {
    return {
      status: 'professional-guidance-required',
      message:
        'Because you disclosed a medical condition, please consult a qualified healthcare professional or registered dietitian for personalized nutrition targets.',
    }
  }

  const bmrResult = calculateBMR({
    age,
    gender: profile.gender,
    height,
    weight,
  })

  const tdee = calculateTDEE(
    bmrResult.value ?? bmrResult.range,
    profile.activityLevel
  )

  // An unspecified gender produces a range, not a single calorie target.
  if (typeof tdee !== 'number') {
    return {
      status: 'estimate-range',
      bmr: bmrResult.range,
      tdee,
      message:
        'Your calorie expenditure is shown as a range because the selected information does not support one precise estimate.',
    }
  }

  const calorieTarget = calculateCalorieTarget(
    tdee,
    profile.primaryGoal
  )

  const macros = calculateMacros(calorieTarget, weight)

  const waterIntake = calculateWaterIntake(weight)

  return {
    status: 'success',

    bmr: bmrResult.value,

    tdee,

    dailyCalories: calorieTarget,

    macros: {
      protein: macros.protein,
      carbohydrates: macros.carbohydrates,
      fat: macros.fat,
    },

    waterIntake: {
      milliliters: waterIntake,
      liters: Number((waterIntake / 1000).toFixed(2)),
    },

    goal: profile.primaryGoal,

    disclaimer:
      'These are general estimates for demonstration purposes, not medical advice or a prescribed diet.',
  }
}