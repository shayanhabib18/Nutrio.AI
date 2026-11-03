import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { supabase } from '../../lib/supabase.js'

function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [checkingRecovery, setCheckingRecovery] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setRecoveryReady(true)
        setError('')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const checkRecoverySession = async () => {
      // Allow Supabase time to process the recovery callback.
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError('Unable to verify your recovery session. Request a new link.')
      } else if (data.session && window.location.search.includes('code=')) {
        // The recovery link has returned with a PKCE authorization code.
        setRecoveryReady(true)
      }

      setCheckingRecovery(false)
    }

    checkRecoverySession()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()

    setError('')

    if (!recoveryReady) {
      setError('Your recovery session is invalid or expired. Please request a new password reset link.')
      return
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      setSuccess(true)

      // End the recovery session after the password is updated.
      await supabase.auth.signOut()

    } catch (err) {
      console.error('Password Reset Error:', err)
      setError(err.message || 'Unable to update your password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a new password for your Nutrio.AI account."
    >
      {checkingRecovery ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600">
            Verifying your password recovery link...
          </p>
        </div>
      ) : success ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle size={20} />
            Password updated successfully!
          </div>

          <p className="text-sm mt-2">
            Your password has been changed. You can now sign in using
            your new password.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 w-full bg-[#315C45] hover:bg-[#264B37] text-white font-semibold py-3 rounded-xl transition"
          >
            Continue to Login
          </button>
        </div>
      ) : !recoveryReady ? (
        <div className="space-y-4">
          <p className="text-sm text-red-600 bg-red-50 p-4 rounded-xl">
            Your password recovery link is invalid or expired. Please request
            a new recovery email.
          </p>

          <Link
            to="/forgot-password"
            className="block text-center font-semibold text-green-700 hover:text-green-800"
          >
            Request a New Recovery Link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>

            <div className="relative">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>

            <div className="relative">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#315C45] hover:bg-[#264B37] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition"
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>

        </form>
      )}

      {/* Back to Login */}
      {!success && (
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 mt-8"
        >
          <ArrowLeft size={17} />
          Back to Login
        </Link>
      )}

    </AuthLayout>
  )
}

export default ResetPassword