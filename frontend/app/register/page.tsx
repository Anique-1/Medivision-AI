"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Eye, EyeOff, Lock, User, Mail, Sparkles, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const bubbleRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  // Mouse Trail
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Bubbles
  useEffect(() => {
    const container = bubbleRef.current
    if (!container) return

    const createBubble = () => {
      const bubble = document.createElement("div")
      const size = Math.random() * 120 + 40
      const duration = Math.random() * 25 + 20
      const delay = Math.random() * 10
      const depth = Math.random() * 0.9 + 0.1

      bubble.className = "bubble-effect absolute rounded-full pointer-events-none"
      bubble.style.width = `${size}px`
      bubble.style.height = `${size}px`
      bubble.style.left = `${Math.random() * 100}%`
      bubble.style.bottom = `-200px`
      bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(251, 146, 60, ${depth * 0.8}), rgba(245, 158, 11, ${depth * 0.4}), transparent)`
      bubble.style.filter = `blur(${Math.max(size / 30, 2)}px) saturate(1.2)`
      bubble.style.animation = `float3d ${duration}s ease-in-out ${delay}s infinite alternate`
      container.appendChild(bubble)
      setTimeout(() => bubble.remove(), (duration + delay) * 1000)
    }

    const interval = setInterval(createBubble, 400)
    return () => clearInterval(interval)
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value
    setPassword(pwd)
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    setPasswordStrength(strength)
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 2) return "bg-orange-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 2) return "Fair"
    if (passwordStrength <= 3) return "Good"
    return "Strong"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" })
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      toast({ title: "Error", description: "You must agree to the Terms & Conditions.", variant: "destructive" })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Registration failed")
      }

      toast({ title: "Success!", description: "Account created! Redirecting to login..." })
      setTimeout(() => router.push("/login"), 1500)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-violet-950 dark:to-teal-950">
        {/* Mouse Trail */}
        <div ref={mouseRef} className="fixed w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 opacity-20 blur-3xl pointer-events-none -z-10 transition-all duration-500" />

        {/* Bubbles */}
        <div ref={bubbleRef} className="fixed inset-0 -z-10" />

        {/* Wave Background */}
        <div className="absolute inset-0 -z-10">
          <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="url(#wave-gradient)"
              fillOpacity="0.08"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"
              animate={{
                d: [
                  "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z",
                  "M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,149C672,170,768,181,864,170C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L0,320Z",
                  "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z",
                ],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <section className="relative py-32">
          <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-gradient-to-t from-orange-100/30 via-amber-50/20 to-teal-50/10" />

          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-enhanced rounded-3xl p-10 shadow-3xl border border-white/20 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="text-center mb-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-white font-medium shadow-xl backdrop-blur-sm border border-white/20 mb-6"
                >
                  <Sparkles className="w-5 h-5" />
                  Join MediVision AI
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
                  Create Account
                </h1>
                <p className="mt-3 text-foreground/70">Your 24/7 Health Oracle awaits</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-orange-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      className="pl-12 pr-4 py-6 glass-input bg-white/5 border-white/20 text-foreground placeholder-foreground/40"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-orange-400 w-5 h-5" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-12 pr-4 py-6 glass-input bg-white/5 border-white/20 text-foreground placeholder-foreground/40"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-orange-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="johndoe123"
                      className="pl-12 pr-4 py-6 glass-input bg-white/5 border-white/20 text-foreground placeholder-foreground/40"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-orange-400 w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create strong password"
                      className="pl-12 pr-12 py-6 glass-input bg-white/5 border-white/20 text-foreground placeholder-foreground/40"
                      onChange={handlePasswordChange}
                      required
                      value={password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-foreground/40 hover:text-orange-400 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength Indicator */}
                  <div className="mt-3">
                    <div className="flex gap-1 mb-1">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: i < passwordStrength ? 1 : 0.8 }}
                          className={cn("h-2 flex-1 rounded-full transition-all", i < passwordStrength ? getStrengthColor() : "bg-white/10")}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-foreground/60 flex items-center gap-1">
                      {passwordStrength > 0 && <CheckCircle2 className={cn("w-3 h-3", getStrengthColor().replace("bg-", "text-"))} />}
                      {getStrengthText()} password
                    </p>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-orange-400 w-5 h-5" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      className={cn("pl-12 pr-12 py-6 glass-input bg-white/5 border-white/20 text-foreground placeholder-foreground/40", password && confirmPassword && password !== confirmPassword && "border-red-500/50")}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-3.5 text-foreground/40 hover:text-orange-400 transition"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-center gap-3 text-sm text-foreground/70 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-white/20 text-orange-500 focus:ring-orange-500"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span>
                    I agree to the <Link href="/terms" className="text-orange-500 hover:text-orange-400 underline">Terms & Conditions</Link>
                  </span>
                </label>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full py-7 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-2xl transform hover:scale-105 transition backdrop-blur-sm border border-white/20"
                  disabled={isLoading || !agreedToTerms || password !== confirmPassword}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-foreground/60">
                  Already have an account?{" "}
                  <Link href="/login" className="text-orange-500 font-medium hover:text-orange-400 transition underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* CSS */}
      <style jsx>{`
        @keyframes float3d {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-120vh) translateX(150px) rotate(720deg) scale(0.8); opacity: 0; }
        }
        .bubble-effect { animation: float3d 25s ease-in-out infinite alternate; }
        .glass-enhanced {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .glass-input::placeholder { color: rgba(255, 255, 255, 0.5); }
        .dark .glass-enhanced,
        .dark .glass-input {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </>
  )
}
