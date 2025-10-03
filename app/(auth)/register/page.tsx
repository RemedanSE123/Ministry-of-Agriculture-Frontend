"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
// import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
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
      color = "bg-destructive"
    } else if (score <= 3) {
      label = "Fair"
      color = "bg-yellow-500"
    } else if (score <= 4) {
      label = "Good"
      color = "bg-blue-500"
    } else {
      label = "Strong"
      color = "bg-accent"
    }

    setPasswordStrength({ score, label, color, checks })
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, userImage: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords don't match. Please try again.",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
      })
      return
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("fullName", formData.fullName)
      formDataToSend.append("email", formData.email)
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
        toast({
          variant: "default",
          title: "Registration Successful!",
          description: "Please wait for admin approval before logging in.",
        })

        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.message || "Unable to create account. Please try again.",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const progressPercentage = (currentStep / 3) * 100

  return (
    <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 animate-scaleIn max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        

        <h1 className="text-3xl font-bold text-card-foreground mb-2">Create Account</h1>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={currentStep >= 1 ? "text-primary font-semibold" : ""}>Personal</span>
          <span className={currentStep >= 2 ? "text-primary font-semibold" : ""}>Position</span>
          <span className={currentStep >= 3 ? "text-primary font-semibold" : ""}>Security</span>
        </div>
      </div>

      {/* Multi-Step Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-input bg-muted text-muted-foreground">
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
                  className="h-12 rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userImage">Profile Image (Optional)</Label>
              <Input
                id="userImage"
                name="userImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="h-12 cursor-pointer"
              />
            </div>

            <Button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continue to Position
            </Button>
          </div>
        )}

        {/* Step 2: Position Information */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="space-y-2">
              <Label htmlFor="position">Your Position *</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}
              >
                <SelectTrigger className="h-12">
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
            </div>

            {formData.position === "Data Collector" && (
              <div className="space-y-4 p-6 bg-primary/5 rounded-xl border border-primary/20">
                <h3 className="font-semibold text-card-foreground flex items-center">
                  <span className="mr-2">📋</span>
                  KoboToolbox Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="koboUsername">Kobo Username</Label>
                  <Input
                    id="koboUsername"
                    name="koboUsername"
                    value={formData.koboUsername}
                    onChange={handleChange}
                    placeholder="Your Kobo username"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="koboToken">Kobo Account Token (Optional)</Label>
                  <Input
                    id="koboToken"
                    name="koboToken"
                    type="password"
                    value={formData.koboToken}
                    onChange={handleChange}
                    placeholder="Your Kobo token"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">Can be added later in profile settings</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="button" onClick={() => setCurrentStep(1)} variant="outline" className="flex-1 h-12">
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentStep(3)} className="flex-1 h-12">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
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
                  className="h-12 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {formData.password && (
                <div className="space-y-3 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.label && <span className="text-xs font-medium">{passwordStrength.label}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`flex items-center gap-1.5 ${passwordStrength.checks.length ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {passwordStrength.checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordStrength.checks.uppercase ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {passwordStrength.checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Uppercase letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordStrength.checks.lowercase ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {passwordStrength.checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Lowercase letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passwordStrength.checks.number ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {passwordStrength.checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
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
                  className="h-12 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-card-foreground flex items-start">
                <span className="mr-2 mt-0.5">ℹ️</span>
                <span>Your account will require admin approval before you can access the system.</span>
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="flex-1 h-12"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1 h-12 bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
      <div className="text-center mt-6 pt-6 border-t border-border">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
