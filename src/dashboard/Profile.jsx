import { useEffect, useState } from 'react'
import {
  User,
  Mail,
  Camera,
  Save,
  HeartPulse,
  Activity,
  Target,
  Utensils,
  Pencil,
  Check,
  X,
  LoaderCircle,
} from 'lucide-react'

import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-600'

const sections = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Your basic personal details and measurements.',
    icon: User,
  },
  {
    id: 'health',
    title: 'Health Information',
    description: 'Your health conditions and dietary requirements.',
    icon: HeartPulse,
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Information',
    description: 'Your daily habits and activity levels.',
    icon: Activity,
  },
  {
    id: 'goals',
    title: 'Nutrition Goals',
    description: 'What you want to achieve with Nutrio.AI.',
    icon: Target,
  },
  {
    id: 'food',
    title: 'Food Preferences',
    description: 'Your favorite foods and meal preferences.',
    icon: Utensils,
  },
]

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

const selectOptions = {
  gender: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],

  dietaryRestrictions: [
    { value: 'none', label: 'No restrictions' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'halal', label: 'Halal' },
    { value: 'gluten-free', label: 'Gluten-free' },
    { value: 'keto', label: 'Keto' },
    { value: 'other', label: 'Other' },
  ],

  activityLevel: [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'light', label: 'Lightly Active' },
    { value: 'moderate', label: 'Moderately Active' },
    { value: 'very', label: 'Very Active' },
    { value: 'extra', label: 'Extremely Active' },
  ],

  exerciseFrequency: [
    { value: 'never', label: 'Never' },
    { value: '1-2', label: '1–2 days per week' },
    { value: '3-4', label: '3–4 days per week' },
    { value: '5-6', label: '5–6 days per week' },
    { value: 'daily', label: 'Every day' },
  ],

  sleepDuration: [
    { value: 'less-than-5', label: 'Less than 5 hours' },
    { value: '5-6', label: '5–6 hours' },
    { value: '7-8', label: '7–8 hours' },
    { value: '9-10', label: '9–10 hours' },
    { value: 'more-than-10', label: 'More than 10 hours' },
  ],

  dailyWaterIntake: [
    { value: 'less-than-1', label: 'Less than 1 litre' },
    { value: '1-2', label: '1–2 litres' },
    { value: '2-3', label: '2–3 litres' },
    { value: '3-plus', label: 'More than 3 litres' },
  ],

  mealsPerDay: [
    { value: '2', label: '2 meals' },
    { value: '3', label: '3 meals' },
    { value: '4', label: '4 meals' },
    { value: '5', label: '5 or more meals' },
  ],

  foodPreference: [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'non-vegetarian', label: 'Non-vegetarian' },
    { value: 'both', label: 'Both' },
    { value: 'vegan', label: 'Vegan' },
  ],

  primaryGoal: [
    { value: 'weight-loss', label: 'Lose Weight' },
    { value: 'weight-gain', label: 'Gain Weight' },
    { value: 'maintain-weight', label: 'Maintain Weight' },
    { value: 'build-muscle', label: 'Build Muscle' },
    { value: 'general-health', label: 'Improve General Health' },
  ],

  preferredPace: [
    { value: 'gradual', label: 'Gradual and Sustainable' },
    { value: 'moderate', label: 'Moderate and Balanced' },
    { value: 'no-preference', label: 'No Preference / Need Guidance' },
  ],

  dailyFoodBudget: [
    { value: 'low', label: 'Budget-friendly' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'flexible', label: 'Flexible' },
    { value: 'no-limit', label: 'No specific budget' },
  ],

  cookingTime: [
    { value: 'under-15', label: 'Less than 15 minutes' },
    { value: '15-30', label: '15–30 minutes' },
    { value: '30-60', label: '30–60 minutes' },
    { value: 'over-60', label: 'More than 60 minutes' },
  ],

  cookingPreference: [
    { value: 'cook-at-home', label: 'Mostly cook at home' },
    { value: 'eat-out', label: 'Mostly eat outside' },
    { value: 'both', label: 'A combination of both' },
    {
      value: 'someone-cooks',
      label: 'Someone else prepares my meals',
    },
  ],
}

const emptyForm = {
  age: '',
  gender: '',
  height: '',
  currentWeight: '',
  targetWeight: '',

  allergies: '',
  intolerances: '',
  medicalConditions: '',
  medications: '',
  dietaryRestrictions: '',

  activityLevel: '',
  exerciseFrequency: '',
  sleepDuration: '',
  dailyWaterIntake: '',
  mealsPerDay: '',
  foodPreference: '',

  primaryGoal: '',
  preferredPace: '',
  additionalGoals: '',

  cuisines: [],
  favoriteFoods: '',
  dislikedFoods: '',
  dailyFoodBudget: '',
  cookingTime: '',
  cookingPreference: '',
}

// Reusable form field
function Field({
  label,
  name,
  value,
  onChange,
  disabled,
  type = 'text',
  options,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {options ? (
        <select
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          className={inputClass}
        >
          <option value="">Not provided</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          placeholder={placeholder}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  )
}

// Reusable section header
function SectionHeader({
  section,
  editing,
  onEdit,
  onSave,
  onCancel,
  saving,
}) {
  const Icon = section.icon

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Icon size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {section.title}
          </h2>

          <p className="text-sm text-gray-500">
            {section.description}
          </p>
        </div>
      </div>

      {editing ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-green-600 hover:text-green-700"
        >
          <Pencil size={16} />
          Edit
        </button>
      )}
    </div>
  )
}

function Profile() {
  const { user } = useAuth()

  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
  })

  const [formData, setFormData] = useState(emptyForm)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSection, setEditingSection] = useState('')
  const [snapshot, setSnapshot] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  // Fetch profile information from Supabase
  const fetchProfile = async () => {
    if (!user?.id) return

    setLoading(true)
    setError('')

    try {
      const userId = user.id

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
          .eq('id', userId)
          .maybeSingle(),

        supabase
          .from('health_information')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),

        supabase
          .from('lifestyle_information')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),

        supabase
          .from('nutrition_goals')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),

        supabase
          .from('food_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
      ])

      const results = [
        profileResult,
        healthResult,
        lifestyleResult,
        goalsResult,
        preferencesResult,
      ]

      const failedResult = results.find((result) => result.error)

      if (failedResult) {
        throw failedResult.error
      }

      const profile = profileResult.data || {}
      const health = healthResult.data || {}
      const lifestyle = lifestyleResult.data || {}
      const goals = goalsResult.data || {}
      const preferences = preferencesResult.data || {}

      setUserData({
        fullName:
          profile.full_name ||
          user.user_metadata?.full_name ||
          '',
        email: user.email || '',
      })

      setFormData({
        age: profile.age ?? '',
        gender: profile.gender || '',
        height: profile.height ?? '',
        currentWeight: profile.current_weight ?? '',
        targetWeight: profile.target_weight ?? '',

        allergies: health.allergies || '',
        intolerances: health.intolerances || '',
        medicalConditions: health.medical_conditions || '',
        medications: health.medications || '',
        dietaryRestrictions: health.dietary_restrictions || '',

        activityLevel: lifestyle.activity_level || '',
        exerciseFrequency: lifestyle.exercise_frequency || '',
        sleepDuration: lifestyle.sleep_duration || '',
        dailyWaterIntake: lifestyle.daily_water_intake || '',
        mealsPerDay: lifestyle.meals_per_day || '',
        foodPreference: lifestyle.food_preference || '',

        primaryGoal: goals.primary_goal || '',
        preferredPace: goals.preferred_pace || '',
        additionalGoals: goals.additional_goals || '',

        cuisines: Array.isArray(preferences.cuisines)
          ? preferences.cuisines
          : [],

        favoriteFoods: preferences.favorite_foods || '',
        dislikedFoods: preferences.disliked_foods || '',
        dailyFoodBudget: preferences.daily_food_budget || '',
        cookingTime: preferences.cooking_time || '',
        cookingPreference: preferences.cooking_preference || '',
      })
    } catch (err) {
      console.error('Profile loading error:', err)
      setError(err.message || 'Unable to load your profile.')
    } finally {
      setLoading(false)
    }
  }

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Handle account information changes
  const handleUserChange = (e) => {
    const { name, value } = e.target

    setUserData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Handle cuisine selection
  const handleCuisineToggle = (cuisine) => {
    setFormData((previous) => ({
      ...previous,
      cuisines: previous.cuisines.includes(cuisine)
        ? previous.cuisines.filter((item) => item !== cuisine)
        : [...previous.cuisines, cuisine],
    }))
  }

  // Start editing
  const startEditing = (section) => {
    setSnapshot({
      userData: { ...userData },
      formData: {
        ...formData,
        cuisines: [...formData.cuisines],
      },
    })

    setEditingSection(section)
    setMessage('')
    setError('')
  }

  // Cancel editing
  const cancelEditing = () => {
    if (snapshot) {
      setUserData(snapshot.userData)
      setFormData(snapshot.formData)
    }

    setSnapshot(null)
    setEditingSection('')
    setMessage('')
    setError('')
  }

  // Save profile information
  const handleSave = async (section) => {
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const userId = user.id

      // Account information
      if (section === 'account') {
        if (!userData.fullName.trim() || !userData.email.trim()) {
          throw new Error('Please enter your name and email address.')
        }

        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: userData.fullName.trim(),
          },
        })

        if (authError) throw authError

        // Update email only if it has changed
        if (
          userData.email.trim().toLowerCase() !==
          user.email?.toLowerCase()
        ) {
          const { error: emailError } = await supabase.auth.updateUser({
            email: userData.email.trim().toLowerCase(),
          })

          if (emailError) throw emailError
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              full_name: userData.fullName.trim(),
            },
            { onConflict: 'id' }
          )

        if (profileError) throw profileError
      }

      // Personal information
      if (section === 'personal') {
        const { error: saveError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              full_name: userData.fullName.trim(),
              age: formData.age === '' ? null : Number(formData.age),
              gender: formData.gender || null,
              height:
                formData.height === ''
                  ? null
                  : Number(formData.height),
              current_weight:
                formData.currentWeight === ''
                  ? null
                  : Number(formData.currentWeight),
              target_weight:
                formData.targetWeight === ''
                  ? null
                  : Number(formData.targetWeight),
            },
            { onConflict: 'id' }
          )

        if (saveError) throw saveError
      }

      // Health information
      if (section === 'health') {
        const { error: saveError } = await supabase
          .from('health_information')
          .upsert(
            {
              user_id: userId,
              allergies: formData.allergies,
              intolerances: formData.intolerances,
              medical_conditions: formData.medicalConditions,
              medications: formData.medications,
              dietary_restrictions: formData.dietaryRestrictions,
            },
            { onConflict: 'user_id' }
          )

        if (saveError) throw saveError
      }

      // Lifestyle information
      if (section === 'lifestyle') {
        const { error: saveError } = await supabase
          .from('lifestyle_information')
          .upsert(
            {
              user_id: userId,
              activity_level: formData.activityLevel,
              exercise_frequency: formData.exerciseFrequency,
              sleep_duration: formData.sleepDuration,
              daily_water_intake: formData.dailyWaterIntake,
              meals_per_day: formData.mealsPerDay,
              food_preference: formData.foodPreference,
            },
            { onConflict: 'user_id' }
          )

        if (saveError) throw saveError
      }

      // Nutrition goals
      if (section === 'goals') {
        const { error: saveError } = await supabase
          .from('nutrition_goals')
          .upsert(
            {
              user_id: userId,
              primary_goal: formData.primaryGoal,
              preferred_pace: formData.preferredPace,
              additional_goals: formData.additionalGoals,
            },
            { onConflict: 'user_id' }
          )

        if (saveError) throw saveError
      }

      // Food preferences
      if (section === 'food') {
        const { error: saveError } = await supabase
          .from('food_preferences')
          .upsert(
            {
              user_id: userId,
              cuisines: formData.cuisines,
              favorite_foods: formData.favoriteFoods,
              disliked_foods: formData.dislikedFoods,
              daily_food_budget: formData.dailyFoodBudget,
              cooking_time: formData.cookingTime,
              cooking_preference: formData.cookingPreference,
            },
            { onConflict: 'user_id' }
          )

        if (saveError) throw saveError
      }

      setSnapshot(null)
      setEditingSection('')

      const sectionName =
        section === 'account'
          ? 'Account information'
          : sections.find((item) => item.id === section)?.title || section

      setMessage(`${sectionName} updated successfully.`)

      await fetchProfile()
    } catch (err) {
      console.error('Profile save error:', err)
      setError(err.message || 'Unable to save your changes.')
    } finally {
      setSaving(false)
    }
  }

  // Render reusable fields
  const renderField = (sectionId, props) => (
    <Field
      {...props}
      value={formData[props.name]}
      onChange={handleChange}
      disabled={editingSection !== sectionId || saving}
    />
  )

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-gray-500">
        <LoaderCircle className="animate-spin" size={22} />
        Loading your profile...
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          My Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your personal information and nutrition preferences.
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          <Check size={18} />
          {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchProfile}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Profile Overview */}
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-700">
            <User size={45} />
          </div>

          <button
            type="button"
            disabled
            className="absolute bottom-0 right-0 cursor-not-allowed rounded-full bg-[#315C45] p-2 text-white opacity-60"
            title="Profile photo is not available yet"
          >
            <Camera size={15} />
          </button>
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-800">
            {userData.fullName || 'Name not provided'}
          </h2>

          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-gray-500 sm:justify-start">
            <Mail size={15} />
            {userData.email || 'Email not available'}
          </p>

          <span className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            Nutrio.AI Member
          </span>
        </div>
      </div>

      {/* Account Information */}
      <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Account Information
            </h2>

            <p className="text-sm text-gray-500">
              Update your name and email address.
            </p>
          </div>

          {editingSection === 'account' ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSave('account')}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save size={17} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startEditing('account')}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-green-700"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Full Name"
            name="fullName"
            value={userData.fullName}
            onChange={handleUserChange}
            disabled={editingSection !== 'account' || saving}
          />

          <Field
            label="Email Address"
            name="email"
            type="email"
            value={userData.email}
            onChange={handleUserChange}
            disabled={editingSection !== 'account' || saving}
          />
        </div>

        {editingSection === 'account' && (
          <p className="text-xs leading-5 text-gray-500">
            Supabase may send a confirmation email when you change your email address.
          </p>
        )}
      </section>

      {/* Personal Information */}
      <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeader
          section={sections[0]}
          editing={editingSection === 'personal'}
          saving={saving}
          onEdit={() => startEditing('personal')}
          onSave={() => handleSave('personal')}
          onCancel={cancelEditing}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {renderField('personal', {
            label: 'Age',
            name: 'age',
            type: 'number',
          })}

          {renderField('personal', {
            label: 'Gender',
            name: 'gender',
            options: selectOptions.gender,
          })}

          {renderField('personal', {
            label: 'Height (cm)',
            name: 'height',
            type: 'number',
          })}

          {renderField('personal', {
            label: 'Current Weight (kg)',
            name: 'currentWeight',
            type: 'number',
          })}

          {renderField('personal', {
            label: 'Target Weight (kg)',
            name: 'targetWeight',
            type: 'number',
          })}
        </div>
      </section>

      {/* Health Information */}
      <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeader
          section={sections[1]}
          editing={editingSection === 'health'}
          saving={saving}
          onEdit={() => startEditing('health')}
          onSave={() => handleSave('health')}
          onCancel={cancelEditing}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {renderField('health', {
            label: 'Food Allergies',
            name: 'allergies',
            type: 'textarea',
            placeholder: 'Your food allergies...',
          })}

          {renderField('health', {
            label: 'Food Intolerances',
            name: 'intolerances',
            type: 'textarea',
            placeholder: 'Your food intolerances...',
          })}

          {renderField('health', {
            label: 'Medical Conditions',
            name: 'medicalConditions',
            type: 'textarea',
            placeholder: 'Your medical conditions...',
          })}

          {renderField('health', {
            label: 'Current Medications',
            name: 'medications',
            type: 'textarea',
            placeholder: 'Your medications...',
          })}

          {renderField('health', {
            label: 'Dietary Restrictions',
            name: 'dietaryRestrictions',
            options: selectOptions.dietaryRestrictions,
          })}
        </div>

        <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Health information is sensitive. Make sure your Supabase security policies and privacy controls are properly configured before storing real medical information.
        </p>
      </section>

      {/* Lifestyle Information */}
      <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeader
          section={sections[2]}
          editing={editingSection === 'lifestyle'}
          saving={saving}
          onEdit={() => startEditing('lifestyle')}
          onSave={() => handleSave('lifestyle')}
          onCancel={cancelEditing}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {renderField('lifestyle', {
            label: 'Activity Level',
            name: 'activityLevel',
            options: selectOptions.activityLevel,
          })}

          {renderField('lifestyle', {
            label: 'Exercise Frequency',
            name: 'exerciseFrequency',
            options: selectOptions.exerciseFrequency,
          })}

          {renderField('lifestyle', {
            label: 'Sleep Duration',
            name: 'sleepDuration',
            options: selectOptions.sleepDuration,
          })}

          {renderField('lifestyle', {
            label: 'Daily Water Intake',
            name: 'dailyWaterIntake',
            options: selectOptions.dailyWaterIntake,
          })}

          {renderField('lifestyle', {
            label: 'Meals Per Day',
            name: 'mealsPerDay',
            options: selectOptions.mealsPerDay,
          })}

          {renderField('lifestyle', {
            label: 'Food Preference',
            name: 'foodPreference',
            options: selectOptions.foodPreference,
          })}
        </div>
      </section>

      {/* Nutrition Goals */}
      <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeader
          section={sections[3]}
          editing={editingSection === 'goals'}
          saving={saving}
          onEdit={() => startEditing('goals')}
          onSave={() => handleSave('goals')}
          onCancel={cancelEditing}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {renderField('goals', {
            label: 'Primary Nutrition Goal',
            name: 'primaryGoal',
            options: selectOptions.primaryGoal,
          })}

          {renderField('goals', {
            label: 'Preferred Pace',
            name: 'preferredPace',
            options: selectOptions.preferredPace,
          })}

          <div className="md:col-span-2">
            {renderField('goals', {
              label: 'Additional Goals',
              name: 'additionalGoals',
              type: 'textarea',
              placeholder: 'Your additional nutrition goals...',
            })}
          </div>
        </div>
      </section>

      {/* Food Preferences */}
      <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SectionHeader
          section={sections[4]}
          editing={editingSection === 'food'}
          saving={saving}
          onEdit={() => startEditing('food')}
          onSave={() => handleSave('food')}
          onCancel={cancelEditing}
        />

        {/* Preferred Cuisines */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Preferred Cuisines
          </label>

          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map((cuisine) => {
              const selected = formData.cuisines.includes(cuisine)

              return (
                <button
                  key={cuisine}
                  type="button"
                  disabled={editingSection !== 'food' || saving}
                  onClick={() => handleCuisineToggle(cuisine)}
                  className={`rounded-full border px-4 py-2 text-sm transition disabled:cursor-default ${
                    selected
                      ? 'border-green-600 bg-green-50 font-medium text-green-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {cuisine}

                  {selected && (
                    <Check size={13} className="ml-1 inline" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {renderField('food', {
            label: 'Favorite Foods',
            name: 'favoriteFoods',
            type: 'textarea',
            placeholder: 'Your favorite foods...',
          })}

          {renderField('food', {
            label: 'Disliked Foods',
            name: 'dislikedFoods',
            type: 'textarea',
            placeholder: 'Foods you dislike...',
          })}

          {renderField('food', {
            label: 'Daily Food Budget',
            name: 'dailyFoodBudget',
            options: selectOptions.dailyFoodBudget,
          })}

          {renderField('food', {
            label: 'Available Cooking Time',
            name: 'cookingTime',
            options: selectOptions.cookingTime,
          })}

          {renderField('food', {
            label: 'Cooking Preference',
            name: 'cookingPreference',
            options: selectOptions.cookingPreference,
          })}
        </div>
      </section>

    </div>
  )
}

export default Profile