// app/register/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Loader2, Check, X, ArrowLeft, Upload, User } from "lucide-react"
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

  // Validation functions
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

    // Make profile image required
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
      color = "bg-blue-500"
    } else {
      label = "Strong"
      color = "bg-emerald-500"
    }

    setPasswordStrength({ score, label, color, checks })
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please select an image file.",
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
        })
        return
      }

      setFormData((prev) => ({ ...prev, userImage: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Clear image error if any
      if (errors.userImage) {
        setErrors(prev => ({ ...prev, userImage: "" }))
      }
    }
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
    setCurrentStep(prev => prev - 1)
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
        // Show specific error messages from server
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
    <div className="w-full max-w-md mx-auto animate-scaleIn px-4 sm:px-0">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-scaleIn border-2 border-emerald-200 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful!</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Your account has been created successfully. Please wait for admin approval before logging in.
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="bg-emerald-500 h-2 rounded-full animate-pulse transition-all duration-3000"></div>
            </div>
            <p className="text-xs text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-300 mb-4 -ml-4 rounded-lg px-3 py-2 border border-transparent hover:border-emerald-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 px-2">
          <span className={currentStep >= 1 ? "text-emerald-600 font-semibold" : ""}>Personal</span>
          <span className={currentStep >= 2 ? "text-emerald-600 font-semibold" : ""}>Profile</span>
          <span className={currentStep >= 3 ? "text-emerald-600 font-semibold" : ""}>Security</span>
        </div>
      </div>

      {/* Multi-Step Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeInUp">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <Input
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`h-11 ${errors.fullName ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
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
                className={`h-11 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number *
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
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
                  className={`h-11 rounded-l-none ${errors.phone ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={handleNextStep}
              className="w-full h-11 text-base font-medium bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue to Profile
            </Button>
          </div>
        )}

        {/* Step 2: Profile Information */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeInUp">
            {/* Profile Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Profile Image *
              </Label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
                errors.userImage ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-emerald-400"
              }`}>
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-emerald-500">
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <Label htmlFor="userImage" className="cursor-pointer">
                        <span className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
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
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.userImage && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.userImage}
                </p>
              )}
            </div>

            {/* Position Selection */}
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                Your Position *
              </Label>
              <Select
                value={formData.position}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, position: value }))
                  if (errors.position) {
                    setErrors(prev => ({ ...prev, position: "" }))
                  }
                }}
              >
                <SelectTrigger className={`h-11 w-full ${errors.position ? "border-red-500 focus:border-red-500" : ""}`}>
                  <SelectValue placeholder="Select your position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.position}
                </p>
              )}
            </div>

            {/* KoboToolbox Information */}
            {formData.position === "Data Collector" && (
              <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-gray-900 flex items-center text-sm">
                  <span className="mr-2">📋</span>
                  KoboToolbox Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="koboUsername" className="text-sm text-gray-700">Kobo Username</Label>
                  <Input
                    id="koboUsername"
                    name="koboUsername"
                    value={formData.koboUsername}
                    onChange={handleChange}
                    placeholder="Your Kobo username"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="koboToken" className="text-sm text-gray-700">Kobo Account Token (Optional)</Label>
                  <Input
                    id="koboToken"
                    name="koboToken"
                    type="password"
                    value={formData.koboToken}
                    onChange={handleChange}
                    placeholder="Your Kobo token"
                    className="h-10"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                type="button" 
                onClick={handlePreviousStep} 
                variant="outline" 
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={handleNextStep} 
                className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to Security
              </Button>
            </div>
          </div>
        )}


        {/* Step 3: Security */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeInUp">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                  className={`h-11 pr-10 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.password}
                </p>
              )}

              {formData.password && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.label && (
                      <span className={`text-xs font-medium ${
                        passwordStrength.score <= 2 ? "text-red-500" :
                        passwordStrength.score <= 3 ? "text-amber-500" :
                        passwordStrength.score <= 4 ? "text-blue-500" : "text-emerald-500"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div
                      className={`flex items-center gap-1.5 ${passwordStrength.checks.length ? "text-emerald-500" : "text-gray-400"}`}
                    >
                      {passwordStrength.checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordStrength.checks.uppercase ? "text-emerald-500" : "text-gray-400"}`}
                    >
                      {passwordStrength.checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Uppercase letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordStrength.checks.lowercase ? "text-emerald-500" : "text-gray-400"}`}
                    >
                      {passwordStrength.checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Lowercase letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordStrength.checks.number ? "text-emerald-500" : "text-gray-400"}`}
                    >
                      {passwordStrength.checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
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
                  className={`h-11 pr-10 transition-colors ${
                    errors.confirmPassword ? "border-red-500 focus:border-red-500" : 
                    formData.confirmPassword && formData.password === formData.confirmPassword ? 
                    "border-emerald-500 focus:border-emerald-500" : ""
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-emerald-500 flex items-center gap-1 animate-fadeIn">
                  <Check className="h-3 w-3" />
                  Passwords match perfectly!
                </p>
              )}
            </div>

            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800 flex items-start">
                <span className="mr-2 mt-0.5">ℹ️</span>
                <span>Your account will require admin approval before you can access the system.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handlePreviousStep}
                variant="outline"
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Login Link */}

        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Button 
              variant="link" 
              className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline p-0 h-auto transition-colors"
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
)
}