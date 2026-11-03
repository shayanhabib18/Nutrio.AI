import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target,
  ArrowRight,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Scale,
  Dumbbell,
  Heart
} from 'lucide-react'

function NutritionGoals() {
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
    primaryGoal: savedData.primaryGoal || '',
    preferredPace: savedData.preferredPace || '',
    additionalGoals: savedData.additionalGoals || '',
  })

  const [error, setError] = useState('')

  const goals = [
    {
      value: 'weight-loss',
      title: 'Lose Weight',
      description: 'Work toward a healthy weight reduction.',
      icon: TrendingDown,
    },
    {
      value: 'weight-gain',
      title: 'Gain Weight',
      description: 'Work toward gradual, healthy weight gain.',
      icon: TrendingUp,
    },
    {
      value: 'maintain-weight',
      title: 'Maintain Weight',
      description: 'Maintain your current weight and habits.',
      icon: Scale,
    },
    {
      value: 'build-muscle',
      title: 'Build Muscle',
      description: 'Support strength and muscle development.',
      icon: Dumbbell,
    },
    {
      value: 'general-health',
      title: 'Improve General Health',
      description: 'Build healthier everyday eating habits.',
      icon: Heart,
    },
  ]

  const handleGoalSelect = (goal) => {
    setFormData((previous) => ({
      ...previous,
      primaryGoal: goal,
    }))

    setError('')
  }

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

    if (!formData.primaryGoal || !formData.preferredPace) {
      setError('Please select your primary goal and preferred pace.')
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

      navigate('/onboarding/preferences')
    } catch {
      setError('Unable to save your goals. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f9f6] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Target size={28} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            What Are Your Goals?
          </h1>

          <p className="mt-2 text-gray-500">
            Choose what you want to achieve with Nutrio.AI.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-green-700">
              Step 4 of 5
            </span>

            <span className="text-gray-500">
              Nutrition Goals
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-4/5 rounded-full bg-green-600" />
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"
        >
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Select Your Primary Goal
          </h2>

          <p className="mb-6 text-sm text-gray-500">
            Choose the goal that matters most to you right now.
          </p>

          {/* Goal Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {goals.map((goal) => {
              const Icon = goal.icon
              const selected = formData.primaryGoal === goal.value

              return (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => handleGoalSelect(goal.value)}
                  aria-pressed={selected}
                  className={`rounded-2xl border p-5 text-left transition ${
                    selected
                      ? 'border-green-600 bg-green-50 ring-2 ring-green-100'
                      : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
                        selected
                          ? 'bg-green-700 text-white'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    {selected && (
                      <span className="text-sm font-semibold text-green-700">
                        Selected
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-800">
                    {goal.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {goal.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Preferred Pace */}
          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              What pace do you prefer? *
            </label>

            <select
              name="preferredPace"
              value={formData.preferredPace}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">
                Select your preferred pace
              </option>

              <option value="gradual">
                Gradual and sustainable
              </option>

              <option value="moderate">
                Moderate and balanced
              </option>

              <option value="no-preference">
                No preference / Need guidance
              </option>
            </select>

            <p className="mt-2 text-xs text-gray-400">
              We'll use this preference to shape general nutrition suggestions,
              not to prescribe a medical weight-change target.
            </p>
          </div>

          {/* Additional Goals */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Any additional goals?

              <span className="ml-2 text-gray-400">
                (Optional)
              </span>
            </label>

            <textarea
              name="additionalGoals"
              value={formData.additionalGoals}
              onChange={handleChange}
              rows="3"
              placeholder="e.g. Improve energy, eat more vegetables, build healthier habits..."
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
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
              onClick={() => navigate('/onboarding/lifestyle')}
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
          Healthy progress takes time. Your plan should support sustainable habits.
        </p>

      </div>
    </div>
  )
}

export default NutritionGoals