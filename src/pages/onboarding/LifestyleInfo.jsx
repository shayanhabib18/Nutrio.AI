import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, ArrowLeft } from 'lucide-react'

function LifestyleInfo() {
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

  const [formData, setFormData] = useState({
    activityLevel: savedData.activityLevel || '',
    exerciseFrequency: savedData.exerciseFrequency || '',
    sleepDuration: savedData.sleepDuration || '',
    dailyWaterIntake: savedData.dailyWaterIntake || '',
    mealsPerDay: savedData.mealsPerDay || '',
    foodPreference: savedData.foodPreference || '',
  })

  const [error, setError] = useState('')

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

    if (Object.values(formData).some((value) => !value)) {
      setError('Please complete all fields before continuing.')
      return
    }

    try {
      const existingData = getSavedData()

      const updatedData = {
        ...existingData,
        ...formData,
      }

      localStorage.setItem(
        'nutrio_onboarding',
        JSON.stringify(updatedData)
      )

      navigate('/onboarding/goals')
    } catch {
      setError('Unable to save your information. Please try again.')
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
            <Activity size={28} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Tell Us About Your Lifestyle
          </h1>

          <p className="mt-2 text-gray-500">
            Your daily habits help us understand your nutritional needs.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-green-700">
              Step 3 of 5
            </span>

            <span className="text-gray-500">
              Lifestyle Information
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-3/5 rounded-full bg-green-600" />
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"
        >
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Your Daily Routine
          </h2>

          <p className="mb-7 text-sm text-gray-500">
            Choose the options that best describe your everyday habits.
          </p>

          <div className="space-y-6">

            {/* Activity Level */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                What is your activity level? *
              </label>

              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select activity level</option>

                <option value="sedentary">
                  Sedentary — Mostly sitting or little movement
                </option>

                <option value="light">
                  Lightly Active — Light daily activity
                </option>

                <option value="moderate">
                  Moderately Active — Regular movement or exercise
                </option>

                <option value="very">
                  Very Active — Frequent physical activity
                </option>

                <option value="extra">
                  Extremely Active — Intense physical activity
                </option>
              </select>
            </div>

            {/* Exercise Frequency */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                How often do you exercise? *
              </label>

              <select
                name="exerciseFrequency"
                value={formData.exerciseFrequency}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select exercise frequency</option>
                <option value="never">Never</option>
                <option value="1-2">1–2 days per week</option>
                <option value="3-4">3–4 days per week</option>
                <option value="5-6">5–6 days per week</option>
                <option value="daily">Every day</option>
              </select>
            </div>

            {/* Sleep Duration */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                How many hours do you usually sleep? *
              </label>

              <select
                name="sleepDuration"
                value={formData.sleepDuration}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select sleep duration</option>
                <option value="less-than-5">Less than 5 hours</option>
                <option value="5-6">5–6 hours</option>
                <option value="7-8">7–8 hours</option>
                <option value="9-10">9–10 hours</option>
                <option value="more-than-10">More than 10 hours</option>
              </select>
            </div>

            {/* Water Intake */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                How much water do you drink daily? *
              </label>

              <select
                name="dailyWaterIntake"
                value={formData.dailyWaterIntake}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select daily water intake</option>
                <option value="less-than-1">Less than 1 litre</option>
                <option value="1-2">1–2 litres</option>
                <option value="2-3">2–3 litres</option>
                <option value="3-plus">More than 3 litres</option>
              </select>
            </div>

            {/* Meals Per Day */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                How many meals do you prefer per day? *
              </label>

              <select
                name="mealsPerDay"
                value={formData.mealsPerDay}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select number of meals</option>
                <option value="2">2 meals</option>
                <option value="3">3 meals</option>
                <option value="4">4 meals</option>
                <option value="5">5 or more meals</option>
              </select>
            </div>

            {/* Food Preference */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                What type of food do you prefer? *
              </label>

              <select
                name="foodPreference"
                value={formData.foodPreference}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select food preference</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-vegetarian</option>
                <option value="both">
                  Both vegetarian and non-vegetarian
                </option>
                <option value="vegan">Vegan</option>
              </select>
            </div>

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
              onClick={() => navigate('/onboarding/health')}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={18} />
              Back
            </button>

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
          You can update your lifestyle preferences later.
        </p>

      </div>
    </div>
  )
}

export default LifestyleInfo