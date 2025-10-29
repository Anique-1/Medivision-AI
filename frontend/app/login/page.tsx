"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/navbar";
import { Eye, EyeOff, Lock, User, Sparkles, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);

  // Mouse Trail Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Enhanced Bubbles
  useEffect(() => {
    const container = bubbleRef.current;
    if (!container) return;

    const createBubble = () => {
      const bubble = document.createElement("div");
      const size = Math.random() * 120 + 40;
      const duration = Math.random() * 25 + 20;
      const delay = Math.random() * 10;
      const depth = Math.random() * 0.9 + 0.1;

      bubble.className = "bubble-effect absolute rounded-full pointer-events-none";
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.bottom = `-200px`;
      bubble.style.background = `radial-gradient(circle at 30% 30%, 
        rgba(251, 146, 60, ${depth * 0.8}) ${depth * 100}%, 
        rgba(245, 158, 11, ${depth * 0.4}) ${depth * 50}%, 
        transparent 100%)`;
      bubble.style.filter = `blur(${Math.max(size / 30, 2)}px) saturate(1.2)`;
      bubble.style.transform = `translateZ(0) scale(${depth})`;
      bubble.style.animation = `float3d ${duration}s ease-in-out ${delay}s infinite alternate`;
      bubble.style.boxShadow = `0 0 ${size / 4}px rgba(251, 146, 60, ${depth * 0.3})`;

      container.appendChild(bubble);
      setTimeout(() => bubble.remove(), (duration + delay) * 1000);
    };

    const interval = setInterval(createBubble, 400);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      toast({
        title: "Success!",
        description: "Logged in successfully.",
        variant: "default",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-violet-950 dark:to-teal-950">
        {/* Enhanced Mouse Trail */}
        <div
          ref={mouseRef}
          className="fixed w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 opacity-20 blur-3xl pointer-events-none -z-10 transition-all duration-500"
        />

        {/* Enhanced Bubbles Container */}
        <div ref={bubbleRef} className="fixed inset-0 -z-10" />

        {/* Animated Wave Background */}
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

        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden">
          <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-gradient-to-t from-orange-100/30 via-amber-50/20 to-teal-50/10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-white font-medium shadow-xl backdrop-blur-sm border border-white/20"
              >
                <Sparkles className="w-5 h-5" />
                Secure Health AI Login
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                <motion.span
                  className="block bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent"
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  MediVision AI
                </motion.span>
                <motion.span
                  className="block mt-4 text-foreground text-3xl md:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Sign In Securely
                </motion.span>
              </h1>

              <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto">
                Access your personalized health oracle with military-grade encryption.
              </p>
            </motion.div>

            {/* Enhanced Login Form */}
            <motion.div
              className="mt-20 max-w-md mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="glass-enhanced rounded-3xl p-12 shadow-3xl border border-white/20 backdrop-blur-xl relative overflow-hidden">
                {/* Security Badge */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-orange-600">Secure Login</h3>
                      <p className="text-sm text-foreground/60">End-to-end encrypted</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-300"
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
                    <div className="relative glass-mini p-0">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/40 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Enter your username"
                        className="glass-input pl-12 pr-4 py-4 text-lg"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                    <div className="relative glass-mini p-0">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/40 w-5 h-5" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="glass-input pl-12 pr-12 py-4 text-lg"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-sm text-foreground/70">
                      <input type="checkbox" className="rounded border-foreground/30 w-4 h-4" />
                      Remember me
                    </label>
                    <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-2xl transform hover:scale-105 transition-all backdrop-blur-sm border border-white/20" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Zap className="w-5 h-5 mr-2 animate-pulse" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <p className="text-foreground/70 text-sm">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                      Create one here
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <style jsx>{`
        .bubble-effect {
          animation: float3d 25s ease-in-out infinite alternate;
        }
        
        @keyframes float3d {
          0% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1); 
            opacity: 0; 
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { 
            transform: translateY(-120vh) translateX(150px) rotate(720deg) scale(0.8); 
            opacity: 0; 
          }
        }
        
        .glass-enhanced {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        
        .glass-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          filter: blur(10px);
          opacity: 0.5;
          z-index: -1;
          border-radius: inherit;
        }
        
        .glass-mini {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
        }
        
        .glass-input {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          transition: all 0.3s ease;
        }
        
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(251, 146, 60, 0.5);
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.1);
        }
        
        .dark .glass-enhanced,
        .dark .glass-mini,
        .dark .glass-input {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        .dark .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}