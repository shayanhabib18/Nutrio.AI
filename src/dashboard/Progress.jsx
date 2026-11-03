import { useEffect, useState } from 'react'
import {
  Flame,
  Droplets,
  Target,
  TrendingUp,
  CalendarDays,
  Activity,
  Utensils,
  Info,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Progress() {
  const { user } = useAuth()

  const [goals, setGoals] = useState(null)
  const [lifestyle, setLifestyle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProgressData() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const [goalsResult, lifestyleResult] = await Promise.all([
          supabase
            .from('nutrition_goals')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),

          supabase
            .from('lifestyle_information')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
        ])

        if (goalsResult.error) throw goalsResult.error
        if (lifestyleResult.error) throw lifestyleResult.error

        setGoals(goalsResult.data)
        setLifestyle(lifestyleResult.data)
      } catch (err) {
        console.error('Progress data error:', err)
        setError('Unable to load your nutrition goals. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProgressData()
  }, [user?.id])

  const stats = [
    {
      title: 'Average Calories',
      value: 'Not tracked',
      subtitle: 'No meal logs available',
      icon: Flame,
    },
    {
      title: 'Water Intake',
      value: 'Not tracked',
      subtitle: 'No water logs available',
      icon: Droplets,
    },
    {
      title: 'Goals Completed',
      value: 'Not available',
      subtitle: 'Requires activity records',
      icon: Target,
    },
    {
      title: 'Current Streak',
      value: 'Not available',
      subtitle: 'Requires daily tracking',
      icon: TrendingUp,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-[#315C45]" />
          <p className="mt-4 text-sm text-gray-500">
            Loading your progress...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Your Progress
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Monitor your nutrition goals and healthy habits.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600">
          <CalendarDays size={17} />
          <span>Progress overview</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <Info size={20} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Your Statistics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your recorded nutrition activity will appear here.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#315C45]">
                    <Icon size={21} />
                  </div>
                  <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                    No data
                  </span>
                </div>

                <p className="text-sm text-gray-500">{stat.title}</p>
                <h3 className="mt-1 text-xl font-bold text-gray-800">
                  {stat.value}
                </h3>
                <p className="mt-2 text-xs text-gray-400">
                  {stat.subtitle}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Weekly Progress */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#315C45]">
            <TrendingUp size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              Weekly Nutrition Progress
            </h2>
            <p className="text-sm text-gray-500">
              Your daily nutrition activity
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-5 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
            <Activity size={26} />
          </div>

          <h3 className="mt-4 font-semibold text-gray-700">
            No progress data yet
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            Once you start recording your meals and daily nutrition activity,
            your weekly progress chart will appear here.
          </p>
        </div>
      </section>

      {/* Nutrition Goals */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#315C45]">
            <Target size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">Your Nutrition Goals</h2>
            <p className="text-sm text-gray-500">
              Goals saved in your profile
            </p>
          </div>
        </div>

        {goals || lifestyle ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {goals?.primary_goal && (
              <GoalCard
                label="Primary Goal"
                value={formatValue(goals.primary_goal)}
              />
            )}

            {goals?.preferred_pace && (
              <GoalCard
                label="Preferred Pace"
                value={formatValue(goals.preferred_pace)}
              />
            )}

            {lifestyle?.activity_level && (
              <GoalCard
                label="Activity Level"
                value={formatValue(lifestyle.activity_level)}
              />
            )}

            {lifestyle?.daily_water_intake != null && (
              <GoalCard
                label="Daily Water Target"
                value={`${lifestyle.daily_water_intake} L`}
              />
            )}

            {lifestyle?.meals_per_day != null && (
              <GoalCard
                label="Preferred Meals Per Day"
                value={String(lifestyle.meals_per_day)}
              />
            )}

            {Array.isArray(goals?.additional_goals) &&
              goals.additional_goals.length > 0 && (
                <GoalCard
                  label="Additional Goals"
                  value={goals.additional_goals
                    .map(formatValue)
                    .join(', ')}
                />
              )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <Target className="mx-auto text-gray-400" size={28} />
            <p className="mt-3 font-medium text-gray-700">
              No nutrition goals found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Complete your onboarding or update your profile to see your goals.
            </p>
          </div>
        )}

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-green-50 p-4">
          <Info className="mt-0.5 shrink-0 text-[#315C45]" size={18} />
          <p className="text-sm leading-6 text-green-900">
            Your saved goals are displayed above. Actual completion percentages
            will be calculated when meal and activity tracking is available.
          </p>
        </div>
      </section>

      {/* Tracking Notice */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#315C45]">
            <Utensils size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-800">
              Start tracking your nutrition
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Your progress dashboard will become more informative as you
              record meals, consumed food, and water intake. Only recorded
              activity will contribute to your statistics.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function GoalCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 font-semibold capitalize text-gray-800">{value}</p>
    </div>
  )
}

function formatValue(value) {
  if (typeof value !== 'string') return String(value)

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export default Progress