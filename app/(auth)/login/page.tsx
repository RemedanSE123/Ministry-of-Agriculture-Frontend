'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Basic validation
  if (!formData.email || !formData.password) {
    alert("Please fill in all fields!");
    return;
  }

  try {
    console.log('Sending login data...');

    // Send to backend
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
      alert('Login successful!');
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      alert(`Login failed: ${result.message}`);
    }

  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
};

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Header */}

            <div className="text-center mb-8">
            {/* Back Arrow for mobile */}
            <div className="lg:hidden mb-4">
                <Link 
                href="/" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition duration-200"
                >
             
                Back to Home
                </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </form>

      {/* Register Link */}
      <div className="text-center mt-6 pt-6 border-t border-gray-200">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Create account
          </Link>
        </p>
      </div>

     
    </div>
  );
}