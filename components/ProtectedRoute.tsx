"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ 
  children, 
  requireSuperAdmin = false 
}: { 
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('🚫 Unauthorized access attempt, redirecting to login...');
        router.push('/login');
      } else if (requireSuperAdmin && user?.role !== 'super_admin') {
        console.log('🚫 Insufficient permissions, redirecting to dashboard...');
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, requireSuperAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requireSuperAdmin && user?.role !== 'super_admin')) {
    return null;
  }

  return <>{children}</>;
}