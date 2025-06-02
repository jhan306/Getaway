"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Globe, Eye, EyeOff, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const { signUp, signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let result
      if (isSignUp) {
        if (!fullName.trim()) {
          setError("Full name is required")
          setLoading(false)
          return
        }
        result = await signUp(email, password, fullName)

        if (result.needsConfirmation) {
          setNeedsConfirmation(true)
          setLoading(false)
          return
        }
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    setEmail("")
    setPassword("")
    setFullName("")
    setNeedsConfirmation(false)
  }

  // Show confirmation screen
  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Getaway</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-8 w-8" />
              <span className="text-xl font-semibold">Check your email!</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Confirm your account</h1>

            <p className="text-gray-600">
              We've sent a confirmation email to <strong>{email}</strong>. Click the link in the email to activate your
              account.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">What's next?</h2>
            <ol className="text-left text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">
                  1
                </span>
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">
                  2
                </span>
                <span>Click the confirmation link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">
                  3
                </span>
                <span>Start planning your trips!</span>
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/resend-confirmation">
                <Mail className="h-4 w-4 mr-2" />
                Resend confirmation email
              </Link>
            </Button>

            <button onClick={toggleMode} className="text-blue-600 hover:text-blue-500 text-sm">
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Getaway</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{isSignUp ? "Create your account" : "Welcome back"}</h2>
          <p className="mt-2 text-gray-600">
            {isSignUp ? "Start planning your dream trips today" : "Sign in to continue your travel planning"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <Label htmlFor="fullName" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {isSignUp && <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters long</p>}
            </div>

            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </div>
              ) : isSignUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">Join thousands of travelers who use Getaway to:</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Plan detailed itineraries</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Discover amazing destinations</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Share trips with the community</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
