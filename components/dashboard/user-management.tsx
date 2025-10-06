"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, UserCog, Shield, Mail, Phone, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  profile_image: string | null;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Check if current user is super_admin
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Fetch all users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setUsers(result.users);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to fetch users",
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      setUpdating(userId);
      
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, role: newRole as 'user' | 'admin' | 'super_admin' } : user
          )
        );
        
        toast({
          title: "Role Updated",
          description: `User role changed to ${newRole}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.message || "Failed to update user role",
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to update user role",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Get user initials for avatar fallback
  const getUserInitials = (fullName: string) => {
    const names = fullName.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase() 
      : names[0][0].toUpperCase();
  };

  // Get profile image URL
  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) return "/placeholder.svg?height=64&width=64";
    
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    return `http://localhost:5000/${profileImage}`;
  };

  // Get role badge color
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="destructive" className="text-xs">Super Admin</Badge>;
      case 'admin':
        return <Badge variant="default" className="bg-blue-600 text-xs">Admin</Badge>;
      case 'user':
        return <Badge variant="secondary" className="text-xs">User</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading users...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user roles and permissions across the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UserCog className="h-8 w-8 text-primary" />
          <Badge variant="outline" className="text-sm">
            {users.length} {users.length === 1 ? 'User' : 'Users'}
          </Badge>
        </div>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Your Permissions
          </CardTitle>
          <CardDescription>
            You are currently logged in as {currentUser?.full_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={getProfileImageUrl(currentUser?.profile_image || null)} 
                alt={currentUser?.full_name} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials(currentUser?.full_name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{currentUser?.full_name}</p>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
            </div>
            {getRoleBadge(currentUser?.role || 'user')}
          </div>
          {!isSuperAdmin && (
            <p className="text-sm text-amber-600 mt-3">
              ⚠️ Only Super Admins can modify user roles. Contact a Super Admin for role changes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user roles and access permissions. Only Super Admins can modify roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={getProfileImageUrl(user.profile_image)} 
                        alt={user.full_name} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{user.full_name}</p>
                        {user.id === Number(currentUser?.id) && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {user.position}
                        </Badge>
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  </div>

                  {/* Role Selector - Only show for Super Admin and not for current user */}
                  <div className="flex items-center gap-3">
                    {isSuperAdmin && user.id !== Number(currentUser?.id) ? (
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-32">
                          {updating === user.id ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="w-32 text-sm text-muted-foreground text-center">
                        {user.id === Number(currentUser?.id) ? "Current User" : "Read Only"}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Super Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Full system access. Can manage all users, change roles, and access all features.
              </p>
            </div>
            
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-blue-600">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Can login and access dashboard. Can manage data but cannot modify user roles.
              </p>
            </div>
            
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">User</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Cannot login to the system. Account exists but has no dashboard access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}