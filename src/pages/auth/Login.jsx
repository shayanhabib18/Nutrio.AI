import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { supabase } from '../../lib/supabase.js'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setLoading(true)

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })

      if (loginError) throw loginError

      if (!data.user) {
        throw new Error('Unable to authenticate your account.')
      }

      // Check the user's onboarding status in Supabase.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError) throw profileError

      if (!profile || profile.onboarding_completed !== true) {
        navigate('/onboarding/personal', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }

    } catch (err) {
      console.error('Login Error:', err)

      if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before signing in.')
      } else {
        setError(err.message || 'Unable to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue your healthy journey."
    >
      <form onSubmit={handleLogin} className="space-y-5">

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
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-green-700 hover:text-green-800"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative">
            <Lock
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-red-600 bg-red-50 p-3 rounded-lg"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#315C45] hover:bg-[#264B37] text-white font-semibold py-3.5 rounded-xl transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing In...' : 'Sign In'}
          {!loading && <ArrowRight size={19} />}
        </button>

      </form>

      <p className="text-center text-sm text-gray-500 mt-8">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="text-green-700 font-semibold hover:text-green-800"
        >
          Create Account
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400 mt-8">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </AuthLayout>
  )
}

export default Login