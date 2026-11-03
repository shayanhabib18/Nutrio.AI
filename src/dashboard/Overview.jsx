import { useEffect, useState } from 'react'
import {
  Leaf,
  Scale,
  Target,
  Flame,
  RefreshCw,
  User,
} from 'lucide-react'

import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

function Overview() {
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [nutritionGoal, setNutritionGoal] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fullName = user?.user_metadata?.full_name || ''
  const email = user?.email || ''

  const displayName = fullName || email || 'there'

  // Dynamic greeting based on the user's local time.
  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? 'Good Morning'
      : hour < 17
        ? 'Good Afternoon'
        : 'Good Evening'

  useEffect(() => {
    if (user?.id) {
      fetchOverviewData()
    }
  }, [user?.id])

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch the user's actual profile.
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      // Fetch the user's actual nutrition goal.
      const { data: goalData, error: goalError } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (goalError) {
        throw goalError
      }

      setProfile(profileData)
      setNutritionGoal(goalData)
    } catch (err) {
      console.error('Overview data error:', err)
      setError('Unable to load your overview information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      icon: <Scale size={22} />,
      title: 'Current Weight',
      value:
        profile?.current_weight != null
          ? `${profile.current_weight} kg`
          : 'Not available',
      subtitle: 'Your recorded weight',
    },
    {
      icon: <Target size={22} />,
      title: 'Target Weight',
      value:
        profile?.target_weight != null
          ? `${profile.target_weight} kg`
          : 'Not available',
      subtitle: 'Your recorded target',
    },
    {
      icon: <Flame size={22} />,
      title: 'Nutrition Goal',
      value: nutritionGoal?.primary_goal
        ? nutritionGoal.primary_goal
        : 'Not set',
      subtitle: 'Your selected goal',
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="mx-auto mb-3 animate-spin text-green-700"
            size={28}
          />
          <p className="text-sm text-gray-500">
            Loading your nutrition overview...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, {displayName}!
          </h1>

          <p className="text-gray-500 mt-2">
            Here's your personal nutrition overview.
          </p>
        </div>

        <button
          onClick={fetchOverviewData}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-sm">{error}</p>

          <button
            onClick={fetchOverviewData}
            className="text-sm font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Profile Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
              <User size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Personal Information
              </h2>

              <p className="text-xs text-gray-400">
                Your saved profile information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Full Name"
              value={profile?.full_name || fullName || 'Not provided'}
            />

            <InfoRow
              label="Email"
              value={email || 'Not available'}
            />

            <InfoRow
              label="Age"
              value={profile?.age != null ? `${profile.age} years` : 'Not provided'}
            />

            <InfoRow
              label="Gender"
              value={profile?.gender || 'Not provided'}
            />

            <InfoRow
              label="Height"
              value={profile?.height != null ? `${profile.height} cm` : 'Not provided'}
            />
          </div>
        </div>

        {/* Nutrition Goal Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
              <Leaf size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Nutrition Goals
              </h2>

              <p className="text-xs text-gray-400">
                Your saved nutrition preferences
              </p>
            </div>
          </div>

          {nutritionGoal ? (
            <div className="space-y-4">
              <InfoRow
                label="Primary Goal"
                value={nutritionGoal.primary_goal || 'Not provided'}
              />

              <InfoRow
                label="Preferred Pace"
                value={nutritionGoal.preferred_pace || 'Not provided'}
              />

              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Additional Goals
                </p>

                {Array.isArray(nutritionGoal.additional_goals) &&
                nutritionGoal.additional_goals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {nutritionGoal.additional_goals.map((goal, index) => (
                      <span
                        key={`${goal}-${index}`}
                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No additional goals recorded.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Target size={32} className="mx-auto text-gray-300 mb-3" />

              <p className="text-gray-600 font-medium">
                No nutrition goal found
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Complete your nutrition goals onboarding to see your information here.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h3 className="text-xl font-bold text-gray-800 mt-1 break-words">
        {value}
      </h3>

      <p className="text-xs text-gray-400 mt-2">
        {subtitle}
      </p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-800 text-right break-words">
        {value}
      </span>
    </div>
  )
}

export default Overview