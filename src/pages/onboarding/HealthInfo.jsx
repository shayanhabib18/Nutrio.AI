import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, ArrowRight, ArrowLeft } from 'lucide-react'

function HealthInfo() {
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
    allergies: savedData.allergies || '',
    intolerances: savedData.intolerances || '',
    medicalConditions: savedData.medicalConditions || '',
    medications: savedData.medications || '',
    dietaryRestrictions: savedData.dietaryRestrictions || '',
  })

  const [consent, setConsent] = useState(
    savedData.healthConsent === true
  )

  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (error) setError('')
  }

  const handleConsentChange = (e) => {
    setConsent(e.target.checked)

    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!consent) {
      setError('Please provide consent to continue.')
      return
    }

    try {
      const existingData = getSavedData()

      const updatedData = {
        ...existingData,
        ...formData,
        healthConsent: consent,
      }

      localStorage.setItem(
        'nutrio_onboarding',
        JSON.stringify(updatedData)
      )

      navigate('/onboarding/lifestyle')
    } catch {
      setError('Unable to save your information. Please try again.')
    }
  }

  const textareaClass =
    'w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100'

  return (
    <div className="min-h-screen bg-[#f6f9f6] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <HeartPulse size={28} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Your Health Matters
          </h1>

          <p className="mt-2 text-gray-500">
            Help us understand your dietary and health requirements.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-green-700">
              Step 2 of 5
            </span>

            <span className="text-gray-500">
              Health Information
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-2/5 rounded-full bg-green-600" />
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"
        >
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Health & Dietary Details
          </h2>

          <p className="mb-7 text-sm text-gray-500">
            These questions are optional. If something does not apply to you,
            simply leave it blank.
          </p>

          <div className="space-y-6">

            {/* Allergies */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Do you have any food allergies?
              </label>

              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows="2"
                placeholder="e.g. Peanuts, dairy, eggs..."
                className={textareaClass}
              />
            </div>

            {/* Intolerances */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Do you have any food intolerances?
              </label>

              <textarea
                name="intolerances"
                value={formData.intolerances}
                onChange={handleChange}
                rows="2"
                placeholder="e.g. Lactose intolerance, gluten sensitivity..."
                className={textareaClass}
              />
            </div>

            {/* Medical Conditions */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Do you have any medical conditions?
              </label>

              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                rows="2"
                placeholder="e.g. Diabetes, high blood pressure..."
                className={textareaClass}
              />
            </div>

            {/* Medications */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Are you currently taking any medications?

                <span className="ml-2 text-gray-400">
                  (Optional)
                </span>
              </label>

              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                rows="2"
                placeholder="Enter medication names if relevant..."
                className={textareaClass}
              />
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Do you follow any dietary restrictions?
              </label>

              <select
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select an option</option>
                <option value="none">No restrictions</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="halal">Halal</option>
                <option value="gluten-free">Gluten-free</option>
                <option value="keto">Keto</option>
                <option value="other">Other</option>
              </select>
            </div>

          </div>

          {/* Privacy Notice */}
          <div className="mt-7 rounded-xl border border-green-100 bg-green-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={handleConsentChange}
                required
                className="mt-1 h-4 w-4 accent-green-700"
              />

              <span className="text-sm leading-6 text-gray-600">
                I agree that Nutrio.AI may use the health information I provide
                to personalize nutrition suggestions. I understand that this
                information is sensitive and that AI suggestions are not a
                substitute for professional medical advice.
              </span>
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/onboarding/personal')}
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
          Your health information should be handled securely and privately.
        </p>

      </div>
    </div>
  )
}

export default HealthInfo