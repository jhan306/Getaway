"use client"

import Link from "next/link"
import { Globe, AlertCircle, RefreshCw, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Getaway</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
            <AlertCircle className="h-8 w-8" />
            <span className="text-xl font-semibold">Authentication Error</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>

          <p className="text-gray-600">We couldn't verify your email confirmation link. This might happen if:</p>
        </div>

        {/* Error Reasons */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 text-left">
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>The confirmation link has expired</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>The link has already been used</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>The link was corrupted or incomplete</span>
            </li>
          </ul>
        </div>

        {/* Solutions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">What you can do:</h2>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try signing in again
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/resend-confirmation">
                <Mail className="h-4 w-4 mr-2" />
                Resend confirmation email
              </Link>
            </Button>
          </div>

          <div className="pt-4 text-sm text-gray-500">
            <p>Still having trouble? Contact our support team for help.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
