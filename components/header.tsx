"use client"

import Link from "next/link"
import { Globe } from "lucide-react"
import UserMenu from "@/components/auth/user-menu"

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          <span className="text-xl font-bold">Getaway</span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/map" className="text-sm font-medium hover:underline underline-offset-4">
              Explore Map
            </Link>
            <Link href="/community" className="text-sm font-medium hover:underline underline-offset-4">
              Community
            </Link>
          </nav>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
