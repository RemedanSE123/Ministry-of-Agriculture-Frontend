"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { useRouter } from "next/navigation"
import { Sprout, TrendingUp, Shield, Users } from "lucide-react"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRegister = () => {
    router.push("/register")
  }

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-white via-gray-50 to-green-50/30">
      {/* Left Section - 60% Image & Content - Hidden on mobile */}
      <div className="hidden md:block w-full md:w-3/5 relative min-h-screen">
        {/* Image Background */}
        <div className="absolute inset-0 w-full h-full">
          <img src="/6.png" alt="Ministry of Agriculture Ethiopia" className="w-full h-full object-cover" />
          {/* Professional gradient overlay with green tint */}
       
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12 text-white">
          {/* Top Logo Section */}
          <div className={`${isVisible ? "animate-fadeInDown" : "opacity-0"}`}>
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-fit border border-white/20">
              <img src="/moe.webp" alt="MOA Logo" className="w-12 h-12 object-contain" />
              <div>
                <h2 className="text-lg font-bold text-white">Ministry of Agriculture</h2>
                <p className="text-xs text-green-100">Federal Democratic Republic of Ethiopia</p>
              </div>
            </div>
          </div>

          {/* Bottom Stats & Footer Section */}
          <div className={`${isVisible ? "animate-fadeInUp" : "opacity-0"}`}>
            {/* Stats Section */}
            <div className="max-w-4xl mb-8">
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  {
                    icon: <Users className="w-6 h-6" />,
                    number: "50K+",
                    label: "Farmers Empowered",
                    gradient: "from-green-400 to-emerald-500",
                  },
                  {
                    icon: <TrendingUp className="w-6 h-6" />,
                    number: "1M+",
                    label: "Data Insights",
                    gradient: "from-emerald-400 to-teal-500",
                  },
                  {
                    icon: <Shield className="w-6 h-6" />,
                    number: "99%",
                    label: "Data Security",
                    gradient: "from-teal-400 to-cyan-500",
                  },
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="flex justify-center mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {stat.icon}
                    </div>
                    <div
                      className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent 
                                  group-hover:scale-110 transition-transform duration-300`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-green-900/90 to-emerald-900/90 backdrop-blur-md text-gray-100 py-4 px-6 rounded-2xl border border-green-700/50 shadow-2xl">
              <div className="text-center text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <span>© 2025 Kukunet Digital</span>
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>In partnership with Ministry of Agriculture Ethiopia</span>
                </div>
                <div className="text-xs text-green-200 mt-1">
                  Transforming agriculture through data-driven innovation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - 40% Content - Full width on mobile */}
      <div className="w-full md:w-2/5 bg-white flex items-center justify-center p-6 md:p-10 overflow-y-auto">
      <div className={`w-full max-w-md ${isVisible ? "animate-scaleIn" : "opacity-0"}`}>
{/* Welcome Section */}
<div className="mb-10 text-center" style={{ fontFamily: "Times New Roman, serif" }}>
  {/* Logo Image */}
  <img
    src="/moe.webp"
    alt="Agriculture Logo"
    className="w-28 h-28 mx-auto mb-6 object-contain"
  />

  {/* Main Title */}
  <h1 className="text-3xl font-bold text-gray-900 mb-4">
    Agricultural Data Management
  </h1>

  {/* Subtitle "Portal" with lines */}
  <div className="flex items-center justify-center gap-4">
    <div className="flex-1 h-[2px] bg-gradient-to-r from-green-600 to-emerald-600"></div>
    <h2 className="text-2xl font-semibold text-gray-900">
      Portal
    </h2>
    <div className="flex-1 h-[2px] bg-gradient-to-l from-green-600 to-emerald-600"></div>
  </div>
</div>




          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              onClick={handleRegister}
              size="lg"
              className="h-12 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 
                       hover:scale-105 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                       border-0 text-white"
            >
              Get Started
            </Button>

            <Button
              onClick={handleLogin}
              size="lg"
              variant="outline"
              className="h-12 text-sm font-semibold border-2 border-green-600 text-green-700 
                       hover:bg-green-50 hover:border-green-700 hover:text-green-800
                       shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-transparent"
            >
              Sign In
            </Button>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            {[
              "Real-time agricultural data analytics",
              "Secure government-grade platform",
              "Mobile-friendly interface",
              
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 text-gray-700">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Support Info */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs font-medium text-center">
                Need assistance? Contact{" "}
                <a
                  href="mailto:support@moa.gov.et"
                  className="font-semibold underline decoration-green-400 hover:decoration-green-600 transition-colors"
                >
                  support@moa.gov.et
                </a>
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="md:hidden mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <div>© 2025 Kukunet Digital</div>
              <div>In partnership with Ministry of Agriculture Ethiopia</div>
              <div className="text-gray-400">Transforming agriculture through data-driven innovation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
