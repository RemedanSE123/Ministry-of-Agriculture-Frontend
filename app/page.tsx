// app/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { useRouter } from "next/navigation"

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
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Left Section - 60% Image & Content - Hidden on mobile */}
      <div className="hidden md:block w-full md:w-3/5 relative h-full">
        {/* Image Background */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/6.png" // You can change this to any image path
            alt="Ministry of Agriculture"
            className="w-full h-full object-cover"
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 text-white">
          {/* Stats Section - Enhanced Design */}
          <div className={`max-w-4xl ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}>
            <div className="grid grid-cols-3 gap-8 mb-12">
              {[
                { number: "50K+", label: "Farmers Empowered", color: "from-emerald-400 to-green-500" },
                { number: "1M+", label: "Data Insights", color: "from-amber-400 to-orange-500" },
                { number: "89%", label: "Accuracy Rate", color: "from-blue-400 to-cyan-500" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent 
                                group-hover:scale-110 transition-transform duration-300`}>
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer - Enhanced Design */}
          <div className="bg-gradient-to-r from-gray-900/90 to-emerald-900/90 backdrop-blur-sm text-gray-200 py-4 px-6 rounded-2xl border border-gray-700/50 shadow-2xl">
            <div className="text-center text-sm">
              <div className="flex items-center justify-center space-x-2">
                <span>© 2025 Kukunet Digital </span>
                <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                <span>In partnership with Ministry of Agriculture Ethiopia</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Transforming agriculture through data-driven innovation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - 40% Dynamic Content - Full width on mobile */}
      <div className="w-full md:w-2/5 bg-gradient-to-br from-white via-gray-50 to-emerald-50/30 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className={`w-full max-w-md ${isVisible ? "animate-scaleIn" : "opacity-0"}`}>
          {/* Welcome Section */}
          <div className="text-center mb-10">
            {/* Logo with elegant frame */}
            <div className="text-center mb-8">
              <img 
                src="/moe.webp" 
                alt="Ministry of Agriculture Logo" 
                className="w-20 h-20 mx-auto mb-4 object-contain"
              />

              {/* Title Section */}
              <div className="space-y-3">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Ministry of Agriculture
                </h1>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    Advanced Agricultural Data Management and Analytics Platform
                  </p>
                  <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-green-500 mx-auto rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Enhanced Design */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Button 
              onClick={handleRegister}
              size="lg" 
              className="h-12 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 
                       hover:scale-105 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 
                       border-0 text-white"
            >
              Get Started
            </Button>

            <Button 
              onClick={handleLogin}
              size="lg" 
              variant="outline"
              className="h-12 text-sm font-semibold border-2 border-gray-300 text-gray-700 
                       hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 
                       shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Sign In
            </Button>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 text-muted-foreground">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Real-time data analytics</span>
            </div>
            
            <div className="flex items-center space-x-3 text-muted-foreground">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Secure government platform</span>
            </div>
            
            <div className="flex items-center space-x-3 text-muted-foreground">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Mobile-friendly interface</span>
            </div>
          </div>

          {/* Support Info - Enhanced */}
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
            <div className="flex items-center justify-center space-x-2 text-amber-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-medium text-center">
                Need assistance? Contact{" "}
                <a href="mailto:support@moa.gov.et" className="font-semibold underline decoration-amber-400 hover:decoration-amber-600 transition-colors">
                  support@moa.gov.et
                </a>
              </p>
            </div>
          </div>

          {/* Mobile Footer - Only visible on mobile */}
          <div className="md:hidden mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <div className="mb-2">
                © 2025 Kukunet Digital
              </div>
              <div>
                In partnership with Ministry of Agriculture Ethiopia
              </div>
              <div className="text-gray-400 mt-1">
                Transforming agriculture through data-driven innovation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}