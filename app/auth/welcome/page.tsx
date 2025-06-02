"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Globe, CheckCircle, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function WelcomePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Globe className="h-12 w-12 text-blue-600" />
            <span className="text-4xl font-bold text-gray-900">Getaway</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <CheckCircle className="h-8 w-8" />
            <span className="text-2xl font-semibold">Welcome to Getaway!</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Your account has been created successfully</h1>

          {user && (
            <p className="text-xl text-gray-600">
              Welcome, {user.user_metadata?.full_name || user.email?.split("@")[0]}! 🎉
            </p>
          )}
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What you can do now:</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Explore Destinations</h3>
              <p className="text-sm text-gray-600">Discover amazing places around the world with our interactive map</p>
            </div>

            <div className="text-center space-y-3">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Plan Your Trips</h3>
              <p className="text-sm text-gray-600">Create detailed itineraries with our drag-and-drop planner</p>
            </div>

            <div className="text-center space-y-3">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Join the Community</h3>
              <p className="text-sm text-gray-600">Share your trips and discover plans from other travelers</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <p className="text-lg text-gray-600">Ready to start your travel planning journey?</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <Link href="/map">
                <MapPin className="h-5 w-5 mr-2" />
                Explore the Map
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="px-8">
              <Link href="/itinerary">
                <Calendar className="h-5 w-5 mr-2" />
                Plan Your First Trip
              </Link>
            </Button>
          </div>

          <div className="pt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm">
              Take me to the homepage instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
