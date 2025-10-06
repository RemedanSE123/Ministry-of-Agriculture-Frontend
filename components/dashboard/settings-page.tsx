"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Save, 
  Upload, 
  X,
  Shield,
  Check,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserData {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  profile_image: string | null;
  role: string;
  kobo_username?: string;
  kobo_token?: string;
}

export default function SettingsPage() {
  const { user: currentUser, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changesMade, setChangesMade] = useState(false);

  const positions = ["MOA Admin", "MOA Staff", "KND Member", "Data Collector", "Other"];

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setUserData({
        id: Number(currentUser.id),
        full_name: currentUser.full_name,
        email: currentUser.email,
       
        position: currentUser.position,
        profile_image: currentUser.profile_image,
        role: currentUser.role, 
        phone: "", // phone property not present on currentUser, set to empty string or handle accordingly
        // kobo_username: currentUser.kobo_username,
        // kobo_token: currentUser.kobo_token,
      });
      setLoading(false);
    }
  }, [currentUser]);

  // Handle input changes
  const handleInputChange = (field: keyof UserData, value: string) => {
    if (userData) {
      setUserData(prev => prev ? { ...prev, [field]: value } : null);
      setChangesMade(true);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please select an image file (JPEG, PNG, etc.)",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setChangesMade(true);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setChangesMade(true);
  };

  // Get profile image URL for display
  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (userData?.profile_image) {
      if (userData.profile_image.startsWith('http')) {
        return userData.profile_image;
      }
      return `http://localhost:5000/${userData.profile_image}`;
    }
    return "/placeholder.svg?height=100&width=100";
  };

  // Get user initials for avatar fallback
  const getUserInitials = (fullName: string) => {
    const names = fullName.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase() 
      : names[0][0].toUpperCase();
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!userData) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("full_name", userData.full_name);
      formData.append("email", userData.email);
      formData.append("phone", userData.phone);
      formData.append("position", userData.position);
      
      if (userData.kobo_username) {
        formData.append("kobo_username", userData.kobo_username);
      }
      
      if (userData.kobo_token) {
        formData.append("kobo_token", userData.kobo_token);
      }

      if (selectedFile) {
        formData.append("profile_image", selectedFile);
      }

      const response = await fetch(`http://localhost:5000/api/auth/users/${userData.id}/profile`, {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update auth context with new user data
        login(result.user);
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        
        setChangesMade(false);
        setSelectedFile(null);
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.message || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !userData) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and account settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <Badge variant="outline" className="text-sm capitalize">
            {userData.role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Image */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Update your profile image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage 
                    src={getProfileImageUrl()} 
                    alt={userData.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getUserInitials(userData.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <p className="font-semibold text-lg">{userData.full_name}</p>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                  <Badge variant="secondary" className="mt-2 capitalize">
                    {userData.position}
                  </Badge>
                </div>

                <div className="flex gap-2 w-full">
                  <Label htmlFor="profile-image" className="flex-1">
                    <div className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload</span>
                    </div>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </Label>
                  
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="flex-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG up to 5MB. Recommended: 500x500 pixels.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User ID</span>
                <Badge variant="outline">{userData.id}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Role</span>
                <Badge variant="secondary" className="capitalize">
                  {userData.role}
                </Badge>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(userData.created_at).toLocaleDateString()}
                </span>
              </div> */}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="full_name"
                    value={userData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +251
                    </span>
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="912345678"
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Position *
                  </Label>
                  <Select
                    value={userData.position}
                    onValueChange={(value) => handleInputChange('position', value)}
                  >
                    <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>

          {/* KoboToolbox Settings */}
          {userData.position === "Data Collector" && (
            <Card>
              <CardHeader>
                <CardTitle>KoboToolbox Settings</CardTitle>
                <CardDescription>
                  Configure your KoboToolbox integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kobo_username">Kobo Username</Label>
                  <Input
                    id="kobo_username"
                    value={userData.kobo_username || ''}
                    onChange={(e) => handleInputChange('kobo_username', e.target.value)}
                    placeholder="Your Kobo username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kobo_token">Kobo Account Token (Optional)</Label>
                  <Input
                    id="kobo_token"
                    type="password"
                    value={userData.kobo_token || ''}
                    onChange={(e) => handleInputChange('kobo_token', e.target.value)}
                    placeholder="Your Kobo token"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your token is stored securely and used for API authentication.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {changesMade && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>You have unsaved changes</span>
                </div>
              )}
              {!changesMade && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <Check className="h-4 w-4" />
                  <span>All changes saved</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleSaveProfile}
              disabled={saving || !changesMade}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}