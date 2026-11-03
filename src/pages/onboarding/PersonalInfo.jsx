import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

function PersonalInfo() {
  const navigate = useNavigate()
  const { user } = useAuth()

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

  const [formData, setFormData] = useState({
    fullName:
      savedData.fullName ||
      user?.user_metadata?.full_name ||
      '',
    age: savedData.age || '',
    gender: savedData.gender || '',
    height: savedData.height || '',
    currentWeight: savedData.currentWeight || '',
    targetWeight: savedData.targetWeight || '',
  })

  const [error, setError] = useState('')

  // Update the name if the authenticated user's information loads later.
  useEffect(() => {
    if (!savedData.fullName && user?.user_metadata?.full_name) {
      setFormData((previous) => ({
        ...previous,
        fullName: user.user_metadata.full_name,
      }))
    }
  }, [user, savedData.fullName])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const {
      fullName,
      age,
      height,
      currentWeight,
      targetWeight,
    } = formData

    if (
      !fullName.trim() ||
      !age ||
      !height ||
      !currentWeight ||
      !targetWeight
    ) {
      setError('Please complete all required fields.')
      return
    }

    const ageValue = Number(age)
    const heightValue = Number(height)
    const currentWeightValue = Number(currentWeight)
    const targetWeightValue = Number(targetWeight)

    if (
      !Number.isFinite(ageValue) ||
      ageValue < 13 ||
      ageValue > 120 ||
      !Number.isFinite(heightValue) ||
      heightValue <= 0 ||
      !Number.isFinite(currentWeightValue) ||
      currentWeightValue <= 0 ||
      !Number.isFinite(targetWeightValue) ||
      targetWeightValue <= 0
    ) {
      setError('Please enter valid personal information.')
      return
    }

    try {
      const existingData = getSavedData()

      const updatedData = {
        ...existingData,
        ...formData,
        fullName: fullName.trim(),
        age: ageValue,
        height: heightValue,
        currentWeight: currentWeightValue,
        targetWeight: targetWeightValue,
      }

      localStorage.setItem(
        'nutrio_onboarding',
        JSON.stringify(updatedData)
      )

      navigate('/onboarding/health')
    } catch {
      setError('Unable to save your information. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f9f6] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <User size={28} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Let's Get to Know You
          </h1>

          <p className="mt-2 text-gray-500">
            Tell us a little about yourself to personalize your nutrition plan.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-green-700">
              Step 1 of 5
            </span>
            <span className="text-gray-500">
              Personal Information
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/5 rounded-full bg-green-600" />
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"
        >
          <h2 className="mb-6 text-xl font-bold text-gray-800">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name *
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Age */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Age *
              </label>

              <input
                type="number"
                name="age"
                min="13"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 25"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">
                  Prefer not to say
                </option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Height (cm) *
              </label>

              <input
                type="number"
                name="height"
                min="1"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 175"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Current Weight */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Weight (kg) *
              </label>

              <input
                type="number"
                name="currentWeight"
                min="0.1"
                step="0.1"
                value={formData.currentWeight}
                onChange={handleChange}
                placeholder="e.g. 75"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Target Weight */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Target Weight (kg) *
              </label>

              <input
                type="number"
                name="targetWeight"
                min="0.1"
                step="0.1"
                value={formData.targetWeight}
                onChange={handleChange}
                placeholder="e.g. 70"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                You can choose to maintain your current weight later.
              </p>
            </div>

          </div>

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Continue Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-green-700 px-7 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Your information helps us personalize your nutrition experience.
        </p>

      </div>
    </div>
  )
}

export default PersonalInfo