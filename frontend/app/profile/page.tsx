"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Trash2, Edit2, Save, User, Mail, Calendar, Activity, Zap, Shield, AlertTriangle } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";

interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileStats {
  username: string;
  email: string;
  full_name: string | null;
  member_since: string;
  total_medicines: number;
  total_reminders: number;
  acknowledged_reminders: number;
  adherence_rate: number;
  total_chats: number;
}

export default function ProfilePage() {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Edit form
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  /* ---------- Mouse Trail ---------- */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  /* ---------- 3D Bubbles ---------- */
  useEffect(() => {
    const container = bubbleRef.current;
    if (!container) return;

    const create = () => {
      const b = document.createElement("div");
      const size = Math.random() * 120 + 40;
      const dur = Math.random() * 25 + 20;
      const delay = Math.random() * 10;
      const depth = Math.random() * 0.9 + 0.1;

      b.className = "bubble-effect absolute rounded-full pointer-events-none";
      b.style.width = b.style.height = `${size}px`;
      b.style.left = `${Math.random() * 100}%`;
      b.style.bottom = `-200px`;
      b.style.background = `radial-gradient(circle at 30% 30%,
        rgba(251,146,60,${depth * 0.8}) ${depth * 100}%,
        rgba(245,158,11,${depth * 0.4}) ${depth * 50}%,
        transparent 100%)`;
      b.style.filter = `blur(${Math.max(size / 30, 2)}px) saturate(1.2)`;
      b.style.transform = `translateZ(0) scale(${depth})`;
      b.style.animation = `float3d ${dur}s ease-in-out ${delay}s infinite alternate`;
      b.style.boxShadow = `0 0 ${size / 4}px rgba(251,146,60,${depth * 0.3})`;

      container.appendChild(b);
      setTimeout(() => b.remove(), (dur + delay) * 1000);
    };

    const iv = setInterval(create, 400);
    return () => clearInterval(iv);
  }, []);

  /* ---------- Fetch Data ---------- */
  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const [profile, stats] = await Promise.all([
        fetchWithAuth("/profile/me") as Promise<UserProfile>,
        fetchWithAuth("/profile/stats") as Promise<ProfileStats>,
      ]);

      setUserProfile(profile);
      setEditFullName(profile.full_name || "");
      setEditEmail(profile.email);
      setProfileStats(stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [toast]);

  /* ---------- CRUD Handlers ---------- */
  const handleUpdateProfile = async () => {
    try {
      const response = await (fetchWithAuth("/profile/me", {
        method: "PUT",
        body: JSON.stringify({ full_name: editFullName, email: editEmail }),
      }) as Promise<UserProfile>);
      setUserProfile(response);
      toast({ title: "Success!", description: "Profile updated.", variant: "default" });
      setIsEditing(false);
      fetchProfileData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Update failed.", variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password too short.", variant: "destructive" });
      return;
    }

    try {
      await fetchWithAuth("/profile/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      toast({ title: "Success!", description: "Password changed.", variant: "default" });
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to change password.", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    try {
      await fetchWithAuth("/profile/me", { method: "DELETE" });
      toast({ title: "Deleted", description: "Account removed.", variant: "default" });
      localStorage.removeItem("access_token");
      router.push("/login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete.", variant: "destructive" });
    }
  };

  /* ---------- Loading / Error ---------- */
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
          />
        </main>
        <Footer />
      </>
    );
  }

  if (!userProfile || !profileStats) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-xl">Failed to load profile.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const stats = [
    { label: "Medicines", value: profileStats.total_medicines, icon: <Activity className="w-6 h-6" /> },
    { label: "Reminders", value: profileStats.total_reminders, icon: <Zap className="w-6 h-6" /> },
    { label: "Adherence", value: `${profileStats.adherence_rate}%`, icon: <Shield className="w-6 h-6" /> },
    { label: "AI Chats", value: profileStats.total_chats, icon: <Mail className="w-6 h-6" /> },
  ];

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-violet-950 dark:to-teal-950">
        {/* Mouse Trail */}
        <div
          ref={mouseRef}
          className="fixed w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 opacity-20 blur-3xl pointer-events-none -z-10 transition-all duration-500"
        />

        {/* Bubbles */}
        <div ref={bubbleRef} className="fixed inset-0 -z-10" />

        {/* Animated Wave */}
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

        <section className="relative py-20">
          <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-gradient-to-t from-orange-100/30 via-amber-50/20 to-teal-50/10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
                  Your Profile
                </span>
              </h1>
              <p className="mt-4 text-xl text-foreground/70">Manage your account and health journey</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-enhanced p-10 rounded-3xl border border-white/20 backdrop-blur-xl mb-12 shadow-3xl"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                    {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold">{userProfile.full_name || userProfile.username}</h2>
                    <p className="text-lg text-orange-600">@{userProfile.username}</p>
                    <p className="text-sm text-foreground/60 mt-1 flex items-center gap-2 justify-center md:justify-start">
                      <Calendar className="w-4 h-4" />
                      Member since {new Date(profileStats.member_since).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "px-8 py-6 text-lg glass-button",
                    isEditing && "bg-red-500/20 text-red-400"
                  )}
                >
                  <Edit2 className="w-5 h-5 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((s, i) => (
                <StatCard
                  key={i}
                  label={s.label}
                  value={s.value}
                  Icon={() => s.icon} // StatCard expects an Icon component, not a ReactNode
                  index={i}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-enhanced p-8 rounded-3xl border border-white/20 backdrop-blur-xl"
                >
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-orange-500" />
                    Profile Information
                  </h3>

                  {isEditing ? (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="glass-input bg-white/5 border-white/20 h-14 text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="glass-input bg-white/5 border-white/20 h-14 text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <Input
                          value={userProfile.username}
                          disabled
                          className="glass-input bg-white/5 border-white/20 h-14 text-lg opacity-60"
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <Button
                          className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                          onClick={handleUpdateProfile}
                        >
                          <Save className="w-5 h-5 mr-2" /> Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-14 glass-button"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { label: "Full Name", value: userProfile.full_name || "Not set" },
                        { label: "Email", value: userProfile.email },
                        { label: "Username", value: userProfile.username },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                          <span className="text-foreground/60">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Security */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-enhanced p-8 rounded-3xl border border-white/20 backdrop-blur-xl"
                >
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-amber-500" />
                    Security
                  </h3>

                  {isChangingPassword ? (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-12 glass-input bg-white/5 border-white/20 h-14"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-12 glass-input bg-white/5 border-white/20 h-14"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-12 glass-input bg-white/5 border-white/20 h-14"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <Button
                          className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                          onClick={handleChangePassword}
                        >
                          <Save className="w-5 h-5 mr-2" /> Update Password
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-14 glass-button"
                          onClick={() => setIsChangingPassword(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-14 glass-button text-lg"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      <Lock className="w-5 h-5 mr-2" /> Change Password
                    </Button>
                  )}
                </motion.div>
              </div>

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="glass-enhanced p-8 rounded-3xl border border-red-500/30 bg-red-500/5 backdrop-blur-xl">
                  <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6" />
                    Danger Zone
                  </h3>
                  <p className="text-foreground/70 mb-6">
                    Permanently delete your account and all data. This action is irreversible.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full h-14 text-lg bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="w-5 h-5 mr-2" /> Delete Account
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Shared CSS */}
      <style jsx>{`
        .bubble-effect { animation: float3d 25s ease-in-out infinite alternate; }
        @keyframes float3d {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-120vh) translateX(150px) rotate(720deg) scale(0.8); opacity: 0; }
        }
        .glass-enhanced {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
        }
        .glass-enhanced::before {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          filter: blur(10px);
          opacity: 0.5;
          z-index: -1;
          border-radius: inherit;
        }
        .glass-input {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }
        .glass-input::placeholder { color: rgba(255,255,255,0.5); }
        .glass-button {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        .glass-button:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .dark .glass-enhanced,
        .dark .glass-button,
        .dark .glass-input {
          background: rgba(15,23,42,0.6);
          border-color: rgba(255,255,255,0.05);
        }
      `}</style>
    </>
  );
}
