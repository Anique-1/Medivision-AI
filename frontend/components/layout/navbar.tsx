"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for token in localStorage on component mount
    const token = localStorage.getItem("access_token")
    setIsLoggedIn(!!token) // Set isLoggedIn to true if token exists
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token") // Remove token
    setIsLoggedIn(false) // Update state
    router.push("/login") // Redirect to login page
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:inline">MediVision AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground/70 hover:text-foreground transition">
              Home
            </Link>
            <Link href="/models" className="text-foreground/70 hover:text-foreground transition">
              Models
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/dashboard" className="text-foreground/70 hover:text-foreground transition">
                  Dashboard
                </Link>
                <Link href="/medicines" className="text-foreground/70 hover:text-foreground transition">
                  Medicines
                </Link>
                <Link href="/chat" className="text-foreground/70 hover:text-foreground transition">
                  Chat
                </Link>
                <Link href="/profile" className="text-foreground/70 hover:text-foreground transition">
                  Profile
                </Link>
              </>
            )}
            <Link href="/about" className="text-foreground/70 hover:text-foreground transition">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/" className="block text-foreground/70 hover:text-foreground">
              Home
            </Link>
            <Link href="/models" className="block text-foreground/70 hover:text-foreground">
              Models
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/dashboard" className="block text-foreground/70 hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/medicines" className="block text-foreground/70 hover:text-foreground">
                  Medicines
                </Link>
                <Link href="/chat" className="block text-foreground/70 hover:text-foreground">
                  Chat
                </Link>
                <Link href="/profile" className="block text-foreground/70 hover:text-foreground">
                  Profile
                </Link>
              </>
            )}
            <Link href="/about" className="block text-foreground/70 hover:text-foreground">
              About
            </Link>
            <div className="flex gap-2 pt-2">
              {isLoggedIn ? (
                <Button variant="outline" onClick={handleLogout} className="flex-1 bg-transparent">
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
