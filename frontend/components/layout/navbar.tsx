"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, User, LogOut, Brain, Stethoscope, Pill, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const name = localStorage.getItem("user_name") || "User";
    setIsLoggedIn(!!token);
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/models", label: "AI Models" },
    ...(isLoggedIn
      ? [
          { href: "/dashboard", label: "Dashboard", icon: <Brain className="w-4 h-4" /> },
          { href: "/medicines", label: "Medicines", icon: <Pill className="w-4 h-4" /> },
          { href: "/chat", label: "AI Doctor", icon: <MessageCircle className="w-4 h-4" /> },
          { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
        ]
      : []),
    
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-nav backdrop-blur-2xl border-b border-white/10"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          WebkitBackdropFilter: "blur(32px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">

            {/* Logo - Animated Gradient */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative w-11 h-11 rounded-2xl p-0.5"
              >
                <Image
                  src="/favicon_1.png"
                  alt="MediVision AI Logo"
                  width={44}
                  height={44}
                  className="rounded-2xl"
                />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:block font-bold text-xl bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent"
              >
                MediVision AI
              </motion.span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "group relative px-4 py-2 rounded-xl text-foreground/70 hover:text-foreground transition-all duration-300 flex items-center gap-2",
                      "hover:bg-white/10 backdrop-blur-sm"
                    )}
                  >
                    {link.icon && <span className="text-orange-500">{link.icon}</span>}
                    <span className="font-medium">{link.label}</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-3">
              {isLoggedIn ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card backdrop-blur-xl">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm">
                      {userName[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground/80 hidden xl:block">
                      {userName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <>
                  <Button variant="ghost" asChild className="glass-btn">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl glass-card backdrop-blur-xl hover:bg-white/20 transition"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-80 bg-background/95 backdrop-blur-2xl shadow-2xl z-50 lg:hidden border-l border-white/10"
            >
              <div className="p-6 space-y-6">
                {/* User Section */}
                {isLoggedIn && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-teal-400 flex items-center justify-center text-white font-bold">
                      {userName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{userName}</p>
                      <p className="text-sm text-foreground/60">Premium User</p>
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                <nav className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-xl glass-card hover:bg-white/10 transition-all group"
                    >
                      {link.icon && <span className="text-orange-500 group-hover:scale-110 transition">{link.icon}</span>}
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* Auth Actions */}
                <div className="pt-6 space-y-3">
                  {isLoggedIn ? (
                    <Button
                      onClick={handleLogout}
                      className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full glass-btn">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-amber-500">
                        <Link href="/register">Register Now</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CSS */}
      <style jsx>{`
        .glass-nav {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .dark .glass-nav {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.2));
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .dark .glass-card {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .glass-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .dark .glass-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}
