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
    redirectUrl: "",
  })
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null)

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
      redirectUrl,
    })
    setShowPopup(true)

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
        localStorage.setItem("user", JSON.stringify(result.user))
        localStorage.setItem("isAuthenticated", "true")

        showCustomPopup(
          "success",
          "Login Successful!",
          `Welcome back, ${result.user.full_name}! Redirecting to your dashboard...`,
          "/dashboard",
        )
      } else {
        let popupType = "error"
        let popupTitle = "Login Failed"
        let popupMessage = result.message || "Invalid credentials. Please try again."
        const redirectUrl = ""

        if (result.message?.includes("Only admin") || result.message?.includes("Access denied")) {
          popupTitle = "Access Restricted"
          popupMessage = "Only administrator accounts can access this system. Please contact your system administrator."
        } else if (result.message?.includes("not found") || result.message?.includes("not exist")) {
          popupTitle = "Account Not Found"
          popupMessage = "This email is not registered. Please contact administrator for access."
        } else if (result.message?.includes("pending") || result.message?.includes("approval")) {
          popupType = "pending"
          popupTitle = "Pending Approval"
          popupMessage = "Your account is pending admin approval. Please wait for activation."
        }

        showCustomPopup(popupType, popupTitle, popupMessage, redirectUrl)
      }
    } catch (error) {
      console.error("Login error:", error)
      showCustomPopup(
        "error",
        "Connection Error",
        "Unable to connect to server. Please check your internet connection and try again.",
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
        return <Check className="w-14 h-14 text-green-600" />
      case "pending":
        return <AlertCircle className="w-14 h-14 text-amber-600" />
      case "error":
        return <X className="w-14 h-14 text-red-600" />
      default:
        return <AlertCircle className="w-14 h-14 text-gray-600" />
    }
  }

  const getPopupBackground = () => {
    switch (popupData.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "pending":
        return "bg-amber-50 border-amber-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getButtonColor = () => {
    switch (popupData.type) {
      case "success":
        return "bg-green-600 hover:bg-green-700"
      case "pending":
        return "bg-amber-600 hover:bg-amber-700"
      case "error":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md mx-auto animate-scaleIn px-3 sm:px-0 relative z-10">
        {showPopup && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div
              className={`bg-white rounded-2xl p-6 max-w-sm w-full text-center animate-scaleIn border-2 ${getPopupBackground()} shadow-2xl`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {getPopupIcon()}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{popupData.title}</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{popupData.message}</p>

              {popupData.type === "success" && popupData.redirectUrl && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                  <div className="bg-green-600 h-1.5 rounded-full animate-pulse transition-all duration-1000"></div>
                </div>
              )}

              <div className="flex gap-2">
                {popupData.type === "error" && popupData.redirectUrl === "register" ? (
                  <>
                    <Button
                      onClick={() => setShowPopup(false)}
                      variant="outline"
                      className="flex-1 h-10 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={handlePopupAction}
                      className={`flex-1 h-10 text-sm ${getButtonColor()} text-white`}
                    >
                      Register Now
                    </Button>
                  </>
                ) : popupData.type === "pending" ? (
                  <Button
                    onClick={() => setShowPopup(false)}
                    className={`w-full h-10 text-sm ${getButtonColor()} text-white`}
                  >
                    Understood
                  </Button>
                ) : popupData.redirectUrl ? (
                  <Button onClick={handlePopupAction} className={`w-full h-10 text-sm ${getButtonColor()} text-white`}>
                    {popupData.type === "success" ? "Going to Dashboard..." : "Continue"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowPopup(false)}
                    className={`w-full h-10 text-sm ${getButtonColor()} text-white`}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700/50">
          <div className="text-center mb-5">
            <Button
              variant="ghost"
              onClick={() => {
                if (onBack) {
                  onBack()
                } else {
                  router.push("/")
                }
              }}
              className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 mb-4 -ml-2 rounded-lg px-3 py-2 border border-transparent hover:border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Home
            </Button>

            <div className="mb-4">
              <img src="/moe.webp" alt="Ministry of Agriculture Logo" className="w-16 h-16 mx-auto object-contain" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-sm text-gray-300">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-fadeInUp">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
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
                className="h-11 text-base bg-slate-900/50 text-white placeholder:text-gray-500 border-slate-600 focus:border-green-500 focus:ring-green-500 rounded-lg"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
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
                  className="h-11 text-base pr-10 bg-slate-900/50 text-white placeholder:text-gray-500 border-slate-600 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-slate-600 w-4 h-4"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-300 font-normal cursor-pointer select-none">
                  Remember me
                </Label>
              </div>

              <Button
                type="button"
                onClick={handleForgotPassword}
                variant="link"
                className="text-sm text-green-400 hover:text-green-300 hover:underline p-0 h-auto font-medium"
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center mt-5 pt-5 border-t border-slate-700">
            <p className="text-gray-300 text-sm">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="text-green-400 text-sm font-semibold hover:text-green-300 hover:underline p-0 h-auto transition-colors"
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
    </div>
  )
}
