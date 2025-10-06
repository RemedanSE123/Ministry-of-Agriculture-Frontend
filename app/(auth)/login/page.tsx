// app/login/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2, ArrowLeft, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface LoginPageProps {
  onBack?: () => void
  onSwitchToRegister?: () => void
}

export default function LoginPage({ onBack, onSwitchToRegister }: LoginPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({
    type: "success",
    title: "",
    message: "",
    redirectUrl: ""
  })
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [redirectTimer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const showCustomPopup = (type: string, title: string, message: string, redirectUrl = "") => {
    setPopupData({
      type,
      title,
      message,
      redirectUrl
    })
    setShowPopup(true)

    // Auto-redirect for success after 1 second
    if (type === "success" && redirectUrl) {
      const timer = setTimeout(() => {
        setShowPopup(false)
        router.push(redirectUrl)
      }, 1000)
      setRedirectTimer(timer)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all fields.",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("isAuthenticated", "true");
        
        showCustomPopup(
          "success",
          "Login Successful!",
          `Welcome back, ${result.user.full_name}! Redirecting to your dashboard...`,
          "/dashboard"
        );
      } else {
        let popupType = "error";
        let popupTitle = "Login Failed";
        let popupMessage = result.message || "Invalid credentials. Please try again.";
        let redirectUrl = "";

        if (result.message?.includes("Only admin") || result.message?.includes("Access denied")) {
          popupTitle = "Access Restricted";
          popupMessage = "Only administrator accounts can access this system. Please contact your system administrator.";
        } else if (result.message?.includes("not found") || result.message?.includes("not exist")) {
          popupTitle = "Account Not Found";
          popupMessage = "This email is not registered. Please contact administrator for access.";
        } else if (result.message?.includes("pending") || result.message?.includes("approval")) {
          popupType = "pending";
          popupTitle = "Pending Approval";
          popupMessage = "Your account is pending admin approval. Please wait for activation.";
        }

        showCustomPopup(popupType, popupTitle, popupMessage, redirectUrl);
      }
    } catch (error) {
      console.error("Login error:", error)
      showCustomPopup(
        "error",
        "Connection Error",
        "Unable to connect to server. Please check your internet connection and try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handlePopupAction = () => {
    setShowPopup(false)
    if (redirectTimer) {
      clearTimeout(redirectTimer)
    }
    if (popupData.redirectUrl === "register" && onSwitchToRegister) {
      onSwitchToRegister()
    } else if (popupData.redirectUrl) {
      router.push(popupData.redirectUrl)
    }
  }

  const handleForgotPassword = () => {
    toast({
      title: "Forgot Password",
      description: "Please contact system administrator to reset your password.",
      duration: 5000,
    })
  }

  const getPopupIcon = () => {
    switch (popupData.type) {
      case "success":
        return <Check className="w-12 h-12 text-blue-600" />
      case "pending":
        return <AlertCircle className="w-12 h-12 text-amber-600" />
      case "error":
        return <X className="w-12 h-12 text-red-600" />
      default:
        return <AlertCircle className="w-12 h-12 text-gray-600" />
    }
  }

  const getPopupBackground = () => {
    switch (popupData.type) {
      case "success":
        return "bg-blue-100 border-blue-200"
      case "pending":
        return "bg-amber-100 border-amber-200"
      case "error":
        return "bg-red-100 border-red-200"
      default:
        return "bg-gray-100 border-gray-200"
    }
  }

  const getButtonColor = () => {
    switch (popupData.type) {
      case "success":
        return "bg-blue-600 hover:bg-blue-700"
      case "pending":
        return "bg-amber-600 hover:bg-amber-700"
      case "error":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto animate-scaleIn px-4 sm:px-0">
        {/* Custom Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className={`bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-scaleIn border-2 ${getPopupBackground()} shadow-2xl`}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                {getPopupIcon()}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{popupData.title}</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {popupData.message}
              </p>
              
              {/* Show loading bar only for success with redirect */}
              {popupData.type === "success" && popupData.redirectUrl && (
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse transition-all duration-1000"></div>
                </div>
              )}
              
              <div className="flex gap-3">
                {popupData.type === "error" && popupData.redirectUrl === "register" ? (
                  <>
                    <Button
                      onClick={() => setShowPopup(false)}
                      variant="outline"
                      className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={handlePopupAction}
                      className={`flex-1 h-11 ${getButtonColor()} text-white`}
                    >
                      Register Now
                    </Button>
                  </>
                ) : popupData.type === "pending" ? (
                  <Button
                    onClick={() => setShowPopup(false)}
                    className={`w-full h-11 ${getButtonColor()} text-white`}
                  >
                    Understood
                  </Button>
                ) : popupData.redirectUrl ? (
                  <Button
                    onClick={handlePopupAction}
                    className={`w-full h-11 ${getButtonColor()} text-white`}
                  >
                    {popupData.type === "success" ? "Going to Dashboard..." : "Continue"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowPopup(false)}
                    className={`w-full h-11 ${getButtonColor()} text-white`}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 mb-4 -ml-4 rounded-lg px-3 py-2 border border-transparent hover:border-blue-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}

          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Welcome Back</h1>
          <p className="text-blue-100">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeInUp">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-white">
              Email Address *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="h-12 text-gray-900 placeholder:text-gray-500 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-medium text-white">
              Password *
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="h-12 pr-10 text-gray-900 placeholder:text-gray-500 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))}
                disabled={isLoading}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm text-white font-normal cursor-pointer select-none"
              >
                Remember me
              </Label>
            </div>

            <Button 
              type="button"
              onClick={handleForgotPassword}
              variant="link" 
              className="text-sm text-blue-300 hover:text-white hover:underline p-0 h-auto font-medium"
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-8 pt-8 border-t border-blue-700">
          <p className="text-blue-200 text-sm">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              className="text-white font-semibold hover:text-blue-100 hover:underline p-0 h-auto transition-colors"
              onClick={() => {
                if (onSwitchToRegister) {
                  onSwitchToRegister()
                } else if (onBack) {
                  onBack()
                } else {
                  router.push("/register")
                }
              }}
            >
              Register Now
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}