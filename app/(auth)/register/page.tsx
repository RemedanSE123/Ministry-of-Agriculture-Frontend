'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    email: '',
    phone: '',
    userImage: null as File | null,
    
    // Step 2
    position: '',
    koboUsername: '',
    koboToken: '',
    
    // Step 3
    password: '',
    confirmPassword: ''
  });

  const positions = [
    'MOA Admin',
    'MOA Staff', 
    'KND Member',
    'Data Collector',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        userImage: e.target.files[0]
      });
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Frontend validation
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords don't match!");
    return;
  }
  if (formData.password.length < 6) {
    alert("Password must be at least 6 characters!");
    return;
  }

  try {
    // Create FormData instead of JSON for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('position', formData.position);
    formDataToSend.append('koboUsername', formData.koboUsername);
    formDataToSend.append('koboToken', formData.koboToken);
    formDataToSend.append('password', formData.password);
    
    // Append profile image if selected
    if (formData.userImage) {
      formDataToSend.append('profileImage', formData.userImage);
    }

    console.log('Sending registration data with file...');

    // Send to backend - NOTE: Don't set Content-Type header for FormData
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      body: formDataToSend, // FormData will set the correct headers automatically
    });

    const result = await response.json();

      // In the handleSubmit function, after successful registration:
    if (result.success) {
      alert('Registration successful! Please login with your credentials.');
      // Redirect to login page
      window.location.href = '/login';
    } else {
      alert(`Registration failed: ${result.message}`);
    }

  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please check your connection and try again.');
  }
};
  // Progress bar
  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Header with Progress */}
  
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
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Personal Info</span>
                <span>Position</span>
                <span>Security</span>
            </div>
            </div>
      {/* Multi-Step Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
            
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
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

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +251
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="912345678"
                />
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label htmlFor="userImage" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <input
                id="userImage"
                name="userImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Upload your profile picture</p>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              Continue to Position
            </button>
          </div>
        )}

        {/* Step 2: Position Information */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Position Information</h2>
            
            {/* Position Dropdown */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Your Position *
              </label>
              <select
                id="position"
                name="position"
                required
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your position</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Fields for Data Collector */}
            {formData.position === 'Data Collector' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800">Kobo Toolbox Information</h3>
                
                <div>
                  <label htmlFor="koboUsername" className="block text-sm font-medium text-blue-700 mb-1">
                    Kobo Username
                  </label>
                  <input
                    id="koboUsername"
                    name="koboUsername"
                    type="text"
                    value={formData.koboUsername}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Kobo username"
                  />
                </div>

                <div>
                  <label htmlFor="koboToken" className="block text-sm font-medium text-blue-700 mb-1">
                    Previous Kobo Account Token
                  </label>
                  <input
                    id="koboToken"
                    name="koboToken"
                    type="password"
                    value={formData.koboToken}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional: Your Kobo token"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    This is optional and can be added later in your profile settings.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                Continue to Security
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
            
            {/* Password */}
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
                placeholder="At least 6 characters"
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                minLength={6}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Login Link */}
      <div className="text-center mt-6 pt-6 border-t border-gray-200">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}