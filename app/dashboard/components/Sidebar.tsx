'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  role: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'users', label: 'User Management', icon: '👥', path: '/dashboard/users', adminOnly: true },
  { id: 'reports', label: 'Reports', icon: '📈', path: '/dashboard/reports' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/dashboard/settings' },
];

export default function DashboardSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-gradient-to-b from-blue-800 to-purple-800 text-white">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-blue-700">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-blue-200 text-sm mt-1">Control Center</p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          if (item.adminOnly && user?.role === 'user') return null;
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-white text-blue-800 shadow-lg transform scale-105'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-blue-700">
        <div className="bg-blue-700 rounded-lg p-3">
          <p className="text-sm text-blue-200">Need help?</p>
          <p className="text-xs text-blue-300">Contact system administrator</p>
        </div>
      </div>
    </div>
  );
}