import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout.jsx'
import { supabase } from '../../lib/supabase.js'

function Signup() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    // Validate form fields
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all fields.')
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      // Create account using Supabase Authentication
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          },
        },
      })

      if (error) {
        throw error
      }

      // Initialize basic onboarding information
      localStorage.setItem(
        'nutrio_onboarding',
        JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
        })
      )

      // If email verification is disabled, a session is returned.
      if (data.session) {
        navigate('/onboarding/personal')
      } else {
        setSuccess(
          'Your account has been created! Please check your email and confirm your account before signing in.'
        )
      }
    } catch (err) {
      console.error('Signup Error:', err)

      setError(
        err.message || 'Unable to create your account. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Start your journey towards healthier eating."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Full Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full Name
          </label>

          <div className="relative">
            <User
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>

          <div className="relative">
            <Lock
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>

          <div className="relative">
            <Lock
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-green-700 hover:text-green-800"
          >
            Sign In
          </Link>
        </p>

      </form>
    </AuthLayout>
  )
}

export default Signup