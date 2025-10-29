"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Pill,
  Bell,
  TrendingUp,
  Plus,
  MessageSquare,
  Upload,
  User,
  Sparkles,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";

/* --------------------------------------------------------------- */
/*   Types                                                         */
/* --------------------------------------------------------------- */
interface UserProfile {
  username: string;
  email: string;
}

interface DashboardStats {
  total_medicines: number;
  active_medicines: number;
  today_reminders: number;
  upcoming_reminders: number;
  recent_medicines: {
    id: number;
    name: string;
    dosage: string;
    status: string;
    created_at: string;
  }[];
}

interface Reminder {
  id: number;
  medicine_id: number;
  medicine_name: string;
  dosage: string;
  reminder_time: string;
  status: string;
}

/* --------------------------------------------------------------- */
/*   Dashboard Page                                                */
/* --------------------------------------------------------------- */
export default function DashboardPage() {
  /* ---------- UI helpers (same as home) ---------- */
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  /* ---------- Data state ---------- */
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  /* ---------- Mouse trail (home-page) ---------- */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  /* ---------- 3-D bubbles (home-page) ---------- */
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

  /* ---------- FETCH DATA (FIXED) ---------- */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Parallel calls – they all need the same auth token
        const [stats, today, upcoming, profile] = await Promise.all([
          fetchWithAuth("/dashboard/stats") as Promise<DashboardStats>,
          fetchWithAuth("/dashboard/reminders/today") as Promise<Reminder[]>,
          fetchWithAuth("/dashboard/reminders/upcoming") as Promise<Reminder[]>,
          fetchWithAuth("/profile") as Promise<UserProfile>,
        ]);

        setDashboardStats(stats);
        setTodayReminders(today);
        setUpcomingReminders(upcoming);
        setUserProfile(profile);
        setLoadError(null);
      } catch (err: any) {
        // ---- Auth failure → redirect ----
        if (err.status === 401) {
          router.replace("/login");
          return;
        }

        // ---- Other errors → show toast & UI ----
        const msg = err.message || "Failed to load dashboard data.";
        toast({ title: "Error", description: msg, variant: "destructive" });
        setLoadError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [toast, router]);

  /* ---------- Loading UI ---------- */
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-xl text-foreground/80">Loading your health dashboard…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------- Error UI ---------- */
  if (loadError || !dashboardStats) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-foreground/70 mb-6">{loadError || "Data could not be loaded."}</p>
            <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600">
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------- Stats cards data ---------- */
  const stats = [
    { label: "Total Medicines", value: dashboardStats.total_medicines, Icon: Pill },
    { label: "Active Medicines", value: dashboardStats.active_medicines, Icon: Activity },
    { label: "Today's Reminders", value: dashboardStats.today_reminders, Icon: Bell },
    { label: "Upcoming Reminders", value: dashboardStats.upcoming_reminders, Icon: TrendingUp },
  ];

  /* ---------- MAIN RENDER ---------- */
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-violet-950 dark:to-teal-950">
        {/* Mouse trail */}
        <div
          ref={mouseRef}
          className="fixed w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 opacity-20 blur-3xl pointer-events-none -z-10 transition-all duration-500"
        />

        {/* Bubbles */}
        <div ref={bubbleRef} className="fixed inset-0 -z-10" />

        {/* Wave background */}
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
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
                  Welcome back,
                </span>{" "}
                <span className="text-foreground">{userProfile?.username ?? "User"}!</span>
              </h1>
              <p className="mt-4 text-xl text-foreground/70">Your health overview at a glance</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((s, i) => (
                <StatCard
                  key={i}
                  label={s.label}
                  value={s.value}
                  Icon={s.Icon}
                  index={i}
                />
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reminders */}
              <div className="lg:col-span-2 space-y-8">
                <ReminderSection title="Today's Reminders" reminders={todayReminders} icon={<Clock className="w-5 h-5" />} />
                <ReminderSection
                  title="Upcoming Reminders"
                  reminders={upcomingReminders}
                  icon={<TrendingUp className="w-5 h-5" />}
                  showDate
                />
              </div>

              {/* Quick Actions + Recent */}
              <div className="space-y-8">
                <Card className="glass-enhanced p-6 border border-white/10 backdrop-blur-xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Quick Actions
                  </h3>
                  <div className="grid gap-3">
                    {[
                      { label: "Add Medicine", Icon: Plus, href: "/medicines" },
                      { label: "Chat with AI", Icon: MessageSquare, href: "/chat" },
                      { label: "Analyze Image", Icon: Upload, href: "/models" },
                      { label: "View Profile", Icon: User, href: "/profile" },
                    ].map((a, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        className="justify-start h-11 glass-button bg-white/5 hover:bg-white/10"
                        onClick={() => router.push(a.href)}
                      >
                        <a.Icon className="w-5 h-5 mr-2" />
                        {a.label}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="glass-enhanced p-6 border border-white/10 backdrop-blur-xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2 text-sm text-foreground/70">
                    {dashboardStats.recent_medicines.length > 0 ? (
                      dashboardStats.recent_medicines.map((m, i) => (
                        <p key={i}>
                          Added <strong>{m.name}</strong> ({m.dosage}) on{" "}
                          {new Date(m.created_at).toLocaleDateString()}
                        </p>
                      ))
                    ) : (
                      <p>No recent activity.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ---------- Shared CSS (same as home) ---------- */}
      <style jsx>{`
        .bubble-effect {
          animation: float3d 25s ease-in-out infinite alternate;
        }
        @keyframes float3d {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.4;
          }
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
          content: "";
          position: absolute;
          inset: 0;
          background: inherit;
          filter: blur(10px);
          opacity: 0.5;
          z-index: -1;
          border-radius: inherit;
        }
        .glass-button {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .dark .glass-enhanced,
        .dark .glass-button {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </>
  );
}

/* ---------- Re-usable Reminder Card ---------- */
function ReminderSection({
  title,
  reminders,
  icon,
  showDate = false,
}: {
  title: string;
  reminders: Reminder[];
  icon: React.ReactNode;
  showDate?: boolean;
}) {
  const [ref, inView] = useInView({ triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
    >
      <Card className="glass-enhanced p-6 border border-white/10 backdrop-blur-xl">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
          {icon} {title}
        </h2>
        <div className="space-y-3">
          {reminders.length > 0 ? (
            reminders.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-semibold text-primary">
                      {showDate
                        ? `${new Date(r.reminder_time).toLocaleDateString()} - `
                        : ""}
                      {new Date(r.reminder_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{r.medicine_name}</p>
                    <p className="text-sm text-foreground/60">{r.dosage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      r.status === "acknowledged"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-orange-500/20 text-orange-400"
                    )}
                  >
                    {r.status === "acknowledged" ? "Completed" : "Pending"}
                  </span>
                  {r.status !== "acknowledged" && (
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      Take Now
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-foreground/60">No {title.toLowerCase()}.</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
