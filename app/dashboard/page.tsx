'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  profile_image: string | null;
  role: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeUsers: 0
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      
      // Fetch dashboard stats (we'll implement this later)
      fetchDashboardStats();
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchDashboardStats = async () => {
    // We'll implement this when we have the API
    setStats({
      totalUsers: 150,
      pendingApprovals: 23,
      activeUsers: 127
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your ministry today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => router.push('/dashboard/users')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition duration-200 text-left"
          >
            <span className="text-2xl mb-2 block">👥</span>
            <p className="font-medium text-blue-800">Manage Users</p>
            <p className="text-sm text-blue-600">Approve and manage user access</p>
          </button>

          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition duration-200 text-left">
            <span className="text-2xl mb-2 block">📊</span>
            <p className="font-medium text-green-800">View Reports</p>
            <p className="text-sm text-green-600">Analytics and insights</p>
          </button>

          <button 
            onClick={() => router.push('/dashboard/settings')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition duration-200 text-left"
          >
            <span className="text-2xl mb-2 block">⚙️</span>
            <p className="font-medium text-purple-800">Settings</p>
            <p className="text-sm text-purple-600">Account and system settings</p>
          </button>

          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition duration-200 text-left">
            <span className="text-2xl mb-2 block">📋</span>
            <p className="font-medium text-orange-800">Activities</p>
            <p className="text-sm text-orange-600">Recent system activities</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-gray-700">New user registration: John Doe</p>
            <span className="text-sm text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-gray-700">System backup completed</p>
            <span className="text-sm text-gray-500 ml-auto">5 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}