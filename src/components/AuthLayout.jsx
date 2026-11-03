import { Leaf } from 'lucide-react'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F8FAF8]">

      {/* Left Section */}
      <div className="hidden lg:flex flex-col justify-between bg-[#202B27] text-white p-12">

        <div className="flex items-center gap-3">
          <div className="bg-[#B7E4C7] text-[#202B27] p-2 rounded-xl">
            <Leaf size={25} />
          </div>

          <h1 className="text-2xl font-bold">
            Nutrio<span className="text-[#B7E4C7]">.AI</span>
          </h1>
        </div>

        <div className="max-w-lg">
          <p className="text-[#B7E4C7] font-medium mb-4">
            YOUR PERSONAL AI NUTRITION COMPANION
          </p>

          <h2 className="text-5xl font-bold leading-tight">
            Eat Better.
            <br />
            Live Healthier.
            <br />
            Feel Amazing.
          </h2>

          <p className="text-gray-300 mt-6 text-lg leading-relaxed">
            Build healthier habits with personalized meal plans,
            smart nutrition insights, and your AI-powered food companion.
          </p>
        </div>

        <p className="text-gray-400 text-sm">
          © 2026 Nutrio.AI. All rights reserved.
        </p>

      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="bg-[#B7E4C7] text-[#202B27] p-2 rounded-xl">
              <Leaf size={22} />
            </div>

            <h1 className="text-2xl font-bold text-[#202B27]">
              Nutrio.AI
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#202B27]">
              {title}
            </h2>

            <p className="text-gray-500 mt-2">
              {subtitle}
            </p>
          </div>

          {children}

        </div>

      </div>

    </div>
  )
}

export default AuthLayout