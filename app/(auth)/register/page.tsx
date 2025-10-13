"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Loader2, Check, X, ArrowLeft, Upload, User, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface RegisterPageProps {
  onBack?: () => void
  onSwitchToLogin?: () => void
}

export default function RegisterPage({ onBack, onSwitchToLogin }: RegisterPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    userImage: null as File | null,
    position: "",
    koboUsername: "",
    koboToken: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  })

  const positions = ["MOA Admin", "MOA Staff", "KND Member", "Data Collector", "Other"]

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^9\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 9-digit phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.position) {
      newErrors.position = "Please select your position"
    }

    if (!formData.userImage) {
      newErrors.userImage = "Profile image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    const password = formData.password
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const score = Object.values(checks).filter(Boolean).length
    let label = ""
    let color = ""

    if (score === 0) {
      label = ""
      color = ""
    } else if (score <= 2) {
      label = "Weak"
      color = "bg-red-500"
    } else if (score <= 3) {
      label = "Fair"
      color = "bg-amber-500"
    } else if (score <= 4) {
      label = "Good"
      color = "bg-green-500"
    } else {
      label = "Strong"
      color = "bg-emerald-600"
    }

    setPasswordStrength({ score, label, color, checks })
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please select an image file.",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
        })
        return
      }

      setFormData((prev) => ({ ...prev, userImage: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      if (errors.userImage) {
        setErrors((prev) => ({ ...prev, userImage: "" }))
      }
    }
  }

  const triggerFileInput = () => {
    document.getElementById("userImage")?.click()
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, userImage: null }))
    setImagePreview(null)
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep3()) {
      return
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("fullName", formData.fullName.trim())
      formDataToSend.append("email", formData.email.trim())
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("position", formData.position)
      formDataToSend.append("koboUsername", formData.koboUsername)
      formDataToSend.append("koboToken", formData.koboToken)
      formDataToSend.append("password", formData.password)

      if (formData.userImage) {
        formDataToSend.append("profileImage", formData.userImage)
      }

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: formDataToSend,
      })

      const result = await response.json()

      if (result.success) {
        setShowSuccessPopup(true)

        setTimeout(() => {
          setShowSuccessPopup(false)
          if (onSwitchToLogin) {
            onSwitchToLogin()
          } else if (onBack) {
            onBack()
          } else {
            router.push("/login")
          }
        }, 3000)
      } else {
        let errorMessage = "Unable to create account. Please try again."

        if (result.message?.includes("already exists") || result.message?.includes("already registered")) {
          errorMessage = "This email is already registered. Please use a different email or try logging in."
        } else if (result.message?.includes("email")) {
          errorMessage = "This email address is already in use. Please use a different email."
        } else if (result.message) {
          errorMessage = result.message
        }

        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMessage,
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to server. Please check your internet connection and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const progressPercentage = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md mx-auto animate-scaleIn px-3 sm:px-0 relative z-10">
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center animate-scaleIn border-2 border-green-200 shadow-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Your account has been created successfully. Please wait for admin approval before logging in.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div className="bg-green-600 h-1.5 rounded-full animate-pulse transition-all duration-3000"></div>
              </div>
              <p className="text-xs text-gray-500">Redirecting to login page...</p>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-slate-700/50">
          <div className="text-center mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (onBack) {
                  onBack()
                } else {
                  router.push("/")
                }
              }}
              className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 mb-3 -ml-2 rounded-lg px-3 py-2 border border-transparent hover:border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Home
            </Button>

            <div className="mb-3">
              <img src="/moe.webp" alt="Ministry of Agriculture Logo" className="w-14 h-14 mx-auto object-contain" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Create Account
            </h1>

            <div className="w-full bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-medium text-gray-400 px-1">
              <span className={currentStep >= 1 ? "text-green-400 font-semibold" : ""}>Personal</span>
              <span className={currentStep >= 2 ? "text-green-400 font-semibold" : ""}>Profile</span>
              <span className={currentStep >= 3 ? "text-green-400 font-semibold" : ""}>Security</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-3 animate-fadeInUp">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-300">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`h-10 text-sm pl-10 bg-slate-900/50 text-white placeholder:text-gray-500 ${errors.fullName ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-green-500"} rounded-lg`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`h-10 text-sm pl-10 bg-slate-900/50 text-white placeholder:text-gray-500 ${errors.email ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-green-500"} rounded-lg`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-300">
                    Phone Number *
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-600 bg-slate-900/50 text-gray-300 text-sm font-medium">
                      +251
                    </span>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="912345678"
                      className={`h-10 text-sm bg-slate-900/50 text-white placeholder:text-gray-500 rounded-l-none ${errors.phone ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-green-500"}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-lg mt-4"
                >
                  Continue to Profile
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 animate-fadeInUp">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-300">Profile Image *</Label>
                  <div
                    onClick={!imagePreview ? triggerFileInput : undefined}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
                      errors.userImage
                        ? "border-red-500 bg-red-950/20"
                        : "border-slate-600 hover:border-green-500 bg-slate-900/30"
                    } ${!imagePreview ? "cursor-pointer" : ""}`}
                  >
                    {imagePreview ? (
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-green-500">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeImage}
                          className="text-xs text-red-400 border-red-500 hover:bg-red-950/30 hover:text-red-300 transition-colors bg-transparent h-7"
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto bg-green-950/30 rounded-full flex items-center justify-center">
                          <Upload className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors">
                            Click to upload
                          </span>
                          <Input
                            id="userImage"
                            name="userImage"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.userImage && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.userImage}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="position" className="text-sm font-medium text-gray-300">
                    Your Position *
                  </Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, position: value }))
                      if (errors.position) {
                        setErrors((prev) => ({ ...prev, position: "" }))
                      }
                    }}
                  >
                    <SelectTrigger
                      className={`h-10 text-sm w-full bg-slate-900/50 text-white ${errors.position ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-green-500"} rounded-lg`}
                    >
                      <SelectValue placeholder="Select your position" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {positions.map((position) => (
                        <SelectItem
                          key={position}
                          value={position}
                          className="text-sm text-white focus:bg-slate-700 focus:text-white"
                        >
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.position}
                    </p>
                  )}
                </div>

                {formData.position === "Data Collector" && (
                  <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="font-semibold text-white flex items-center text-sm">
                      <span className="mr-1.5">📋</span>
                      KoboToolbox Information
                    </h3>

                    <div className="space-y-1.5">
                      <Label htmlFor="koboUsername" className="text-xs font-medium text-gray-300">
                        Kobo Username
                      </Label>
                      <Input
                        id="koboUsername"
                        name="koboUsername"
                        value={formData.koboUsername}
                        onChange={handleChange}
                        placeholder="Your Kobo username"
                        className="h-9 text-sm bg-slate-900/50 text-white placeholder:text-gray-500 border-slate-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="koboToken" className="text-xs font-medium text-gray-300">
                        Kobo Account Token (Optional)
                      </Label>
                      <Input
                        id="koboToken"
                        name="koboToken"
                        type="password"
                        value={formData.koboToken}
                        onChange={handleChange}
                        placeholder="Your Kobo token"
                        className="h-9 text-sm bg-slate-900/50 text-white placeholder:text-gray-500 border-slate-600 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="flex-1 h-10 text-sm border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors rounded-lg bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 h-10 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-lg"
                  >
                    Continue to Security
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3 animate-fadeInUp">
                <div className="space-y-1.5">
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
                      placeholder="At least 6 characters"
                      minLength={6}
                      className={`h-10 text-sm pr-10 bg-slate-900/50 text-white placeholder:text-gray-500 ${errors.password ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-green-500"} rounded-lg`}
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
                  {errors.password && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}

                  {formData.password && (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        {passwordStrength.label && (
                          <span
                            className={`text-xs font-semibold ${
                              passwordStrength.score <= 2
                                ? "text-red-400"
                                : passwordStrength.score <= 3
                                  ? "text-amber-400"
                                  : passwordStrength.score <= 4
                                    ? "text-green-400"
                                    : "text-emerald-400"
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div
                          className={`flex items-center gap-1 ${passwordStrength.checks.length ? "text-green-400" : "text-gray-500"}`}
                        >
                          {passwordStrength.checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>8+ characters</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? "text-green-400" : "text-gray-500"}`}
                        >
                          {passwordStrength.checks.uppercase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>Uppercase</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? "text-green-400" : "text-gray-500"}`}
                        >
                          {passwordStrength.checks.lowercase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>Lowercase</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${passwordStrength.checks.number ? "text-green-400" : "text-gray-500"}`}
                        >
                          {passwordStrength.checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>Number</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      minLength={6}
                      className={`h-10 text-sm pr-10 bg-slate-900/50 text-white placeholder:text-gray-500 transition-colors ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? "border-green-500 focus:border-green-500"
                            : "border-slate-600 focus:border-green-500"
                      } rounded-lg`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-xs text-green-400 flex items-center gap-1 animate-fadeIn">
                      <Check className="h-3 w-3" />
                      Passwords match!
                    </p>
                  )}
                </div>

                <div className="p-2.5 bg-amber-950/30 rounded-lg border border-amber-700/50">
                  <p className="text-xs text-amber-300 flex items-start">
                    <span className="mr-1.5 mt-0.5">ℹ️</span>
                    <span>Your account will require admin approval before you can access the system.</span>
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="flex-1 h-10 text-sm border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors rounded-lg bg-transparent"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-10 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <Button
                variant="link"
                className="text-green-400 text-sm font-semibold hover:text-green-300 hover:underline p-0 h-auto transition-colors"
                onClick={() => {
                  if (onSwitchToLogin) {
                    onSwitchToLogin()
                  } else if (onBack) {
                    onBack()
                  } else {
                    router.push("/login")
                  }
                }}
              >
                Sign in
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
