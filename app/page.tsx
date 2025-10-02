"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: KuKuNet Logo */}
            <div className={`flex items-center space-x-3 ${isVisible ? "animate-slideInLeft" : "opacity-0"}`}>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">KN</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">KuKuNet</h2>
                <p className="text-xs text-muted-foreground">Data Solutions</p>
              </div>
            </div>

            {/* Center: Collaboration Badge */}
            <div
              className={`hidden md:flex items-center space-x-2 px-4 py-2 bg-muted/50 rounded-full border border-border ${isVisible ? "animate-scaleIn delay-200" : "opacity-0"}`}
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">In Collaboration With</span>
            </div>

            {/* Right: MOA Logo */}
            <div className={`flex items-center space-x-3 ${isVisible ? "animate-slideInRight" : "opacity-0"}`}>
              <div>
                <h2 className="text-lg font-bold text-foreground text-right">Ministry of Agriculture</h2>
                <p className="text-xs text-muted-foreground text-right">Federal Democratic Republic of Ethiopia</p>
              </div>
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-secondary-foreground font-bold text-lg">MOA</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float delay-300"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}
            <h1
              className={`text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
            >
              <span className="text-balance">Agricultural Data</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Management Portal
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed ${isVisible ? "animate-fadeInUp delay-200" : "opacity-0"}`}
            >
              Empowering Ethiopia's agricultural sector through innovative data collection, analysis, and management
              solutions
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isVisible ? "animate-fadeInUp delay-300" : "opacity-0"}`}
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-2">🌾</span>
                  Register Now
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-transparent"
                >
                  <span className="mr-2">🔐</span>
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust Badge */}
            <div
              className={`mt-12 inline-flex items-center space-x-2 px-6 py-3 bg-card border border-border rounded-full shadow-md ${isVisible ? "animate-scaleIn delay-500" : "opacity-0"}`}
            >
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-foreground">Secure & Government Approved</span>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 border-t border-border">
       
          <div className="text-center text-sm opacity-70 pt-8 border-t border-secondary-foreground/20">
            © 2025 Ministry of Agriculture & KuKuNet. All rights reserved.
          </div>
        
      </footer>
    </div>
  )
}
