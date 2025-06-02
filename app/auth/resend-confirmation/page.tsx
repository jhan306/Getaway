"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Globe, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
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
              <span className="text-xl font-semibold">Email Sent!</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>

            <p className="text-gray-600">
              We've sent a new confirmation email to <strong>{email}</strong>. Click the link in the email to verify
              your account.
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
            <Button
              onClick={() => {
                setSent(false)
                setEmail("")
              }}
              variant="outline"
              className="w-full"
            >
              Send to a different email
            </Button>

            <Link href="/" className="block text-blue-600 hover:text-blue-500 text-sm">
              Back to homepage
            </Link>
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

          <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
            <Mail className="h-8 w-8" />
            <span className="text-xl font-semibold">Resend Confirmation</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Resend confirmation email</h1>

          <p className="mt-2 text-gray-600">Enter your email address and we'll send you a new confirmation link</p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleResend}>
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

            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send confirmation email
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
