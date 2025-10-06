"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Check, ArrowLeft } from "lucide-react";

export default function LogoutPage() {
  const { logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Auto-logout after 2 seconds
    const timer = setTimeout(() => {
      handleLogout();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Logging out...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <LogOut className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Logging Out</CardTitle>
          <CardDescription>
            You are being logged out of the system...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full animate-pulse transition-all duration-2000"></div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Redirecting to login page
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" />
              Log Out Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}