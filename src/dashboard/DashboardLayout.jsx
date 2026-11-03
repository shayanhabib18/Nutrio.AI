import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import {
  Leaf,
  LayoutDashboard,
  Utensils,
  BookOpen,
  MessageCircle,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext.jsx'

function DashboardLayout() {
  const navigate = useNavigate()

  const { user, signOut } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  // Get actual user information from Supabase.
  const fullName = user?.user_metadata?.full_name || ''
  const email = user?.email || ''

  const displayName = fullName || email
  const initial = (fullName || email).charAt(0).toUpperCase()

  const navigation = [
    {
      title: 'MAIN MENU',
      items: [
        {
          name: 'Overview',
          path: '/dashboard',
          icon: LayoutDashboard,
          end: true,
        },
        {
          name: 'Meal Planner',
          path: '/dashboard/meals',
          icon: Utensils,
        },
        {
          name: 'Recipes',
          path: '/dashboard/recipes',
          icon: BookOpen,
        },
        {
          name: 'AI Assistant',
          path: '/dashboard/ai-chat',
          icon: MessageCircle,
        },
        {
          name: 'Progress',
          path: '/dashboard/progress',
          icon: TrendingUp,
        },
      ],
    },
    {
      title: 'PERSONAL',
      items: [
        {
          name: 'My Profile',
          path: '/dashboard/profile',
          icon: User,
        },
      ],
    },
  ]

  // Sign out using Supabase authentication.
  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      setLogoutError('')

      await signOut()

      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      setLogoutError(error.message || 'Unable to log out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F6]">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72
          bg-[#202B27] text-white flex flex-col
          transform transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        {/* Logo */}
        <div className="h-20 px-7 flex items-center justify-between border-b border-white/10">

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="bg-[#B7E4C7] text-[#202B27] p-2 rounded-xl">
              <Leaf size={24} />
            </div>

            <h1 className="text-2xl font-bold">
              Nutrio<span className="text-[#B7E4C7]">.AI</span>
            </h1>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-300 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>

        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-5 py-7">

          {navigation.map((section) => (
            <div key={section.title} className="mb-8">

              <p className="text-xs font-semibold tracking-widest text-gray-400 px-3 mb-4">
                {section.title}
              </p>

              <div className="space-y-2">

                {section.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                          isActive
                            ? 'bg-[#B7E4C7] text-[#202B27] font-semibold'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <Icon size={20} />
                      <span className="text-sm">{item.name}</span>
                    </NavLink>
                  )
                })}

              </div>

            </div>
          ))}

        </div>

        {/* Sidebar Bottom */}
        <div className="p-5 border-t border-white/10">

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-50"
          >
            <LogOut size={19} />

            <span className="text-sm font-medium">
              {loggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>

          {logoutError && (
            <p className="mt-2 px-2 text-xs text-red-400">
              {logoutError}
            </p>
          )}

        </div>

      </aside>

      {/* Main Area */}
      <div className="lg:ml-72 min-h-screen">

        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-5 md:px-8 flex items-center justify-between sticky top-0 z-30">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600"
              aria-label="Open sidebar"
            >
              <Menu size={25} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-[#202B27]">
                Nutrio Dashboard
              </h2>

              <p className="text-xs text-gray-400 hidden sm:block">
                Your personal nutrition space
              </p>
            </div>

          </div>

          {/* Header Right */}
          <div className="flex items-center gap-3 md:gap-4">

            {/* Actual Supabase User Information */}
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 bg-[#D8EBDD] text-[#315C45] rounded-full flex items-center justify-center font-bold">
                {initial || <User size={20} />}
              </div>

              <div className="hidden sm:block max-w-48">
                <p className="text-sm font-semibold text-[#202B27] truncate">
                  {displayName}
                </p>

                <p className="text-xs text-gray-400 truncate">
                  {email}
                </p>
              </div>

              <ChevronDown
                size={17}
                className="hidden sm:block text-gray-400"
              />

            </div>

          </div>

        </header>

        {/* Page Content */}
        <main className="p-5 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default DashboardLayout