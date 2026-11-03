import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { supabase } from '../../lib/supabase.js'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess(false)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (err) {
      console.error('Password Recovery Error:', err)
      setError(err.message || 'Unable to send recovery email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Don't worry! Enter your email address and we'll help you reset your password."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <div className="flex gap-3 bg-green-50 text-green-800 p-4 rounded-xl">
            <CheckCircle size={21} className="shrink-0" />

            <div>
              <p className="font-semibold text-sm">
                Check your email
              </p>

              <p className="text-sm mt-1">
                If an account exists for this email address, password
                recovery instructions have been sent. Please check your
                inbox and spam folder.
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#315C45] hover:bg-[#264B37] text-white font-semibold py-3.5 rounded-xl transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
          {!loading && <ArrowRight size={19} />}
        </button>

      </form>

      {/* Back to Login */}
      <Link
        to="/login"
        className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 mt-8"
      >
        <ArrowLeft size={17} />
        Back to Login
      </Link>

    </AuthLayout>
  )
}

export default ForgotPassword