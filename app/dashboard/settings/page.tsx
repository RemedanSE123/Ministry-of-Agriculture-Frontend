"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"

interface User {
  id: number
  full_name: string
  email: string
  phone: string
  position: string
  profile_image: string | null
  role: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData({
        fullName: parsedUser.full_name,
        email: parsedUser.email,
        phone: parsedUser.phone,
        position: parsedUser.position,
      })
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = () => {
    // Here you would typically make an API call to update the user
    alert("Profile updated successfully!")
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="animate-fadeInUp">
        <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="animate-fadeInUp delay-100">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Information</CardTitle>
          <CardDescription>Update your personal information and profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage
                src={user.profile_image ? `http://localhost:5000/${user.profile_image}` : undefined}
                alt={user.full_name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-12"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-12"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-12"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={!isEditing}
                className="h-12"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="px-8">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} className="px-8">
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="px-8">
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="animate-fadeInUp delay-200">
        <CardHeader>
          <CardTitle className="text-2xl">Security</CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start h-12 bg-transparent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="animate-fadeInUp delay-300">
        <CardHeader>
          <CardTitle className="text-2xl">Account Information</CardTitle>
          <CardDescription>View your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Account Role</span>
           <span className="font-semibold text-foreground">
  {user.role?.replace("_", " ").toUpperCase() ?? "N/A"}
</span>

          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Account Status</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Active</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-sm text-foreground">#{user.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
