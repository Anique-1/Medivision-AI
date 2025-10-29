"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Activity, Pill, Bell, TrendingUp, Plus, MessageSquare, Upload, User } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface UserProfile {
  username: string;
  email: string;
  // Add other user properties as needed
}

interface DashboardStats {
  total_medicines: number
  active_medicines: number
  today_reminders: number
  upcoming_reminders: number
  recent_medicines: {
    id: number
    name: string
    dosage: string
    status: string
    created_at: string
  }[]
}

interface Reminder {
  id: number
  medicine_id: number
  medicine_name: string
  dosage: string
  reminder_time: string
  status: string
}

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([])
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const statsData: DashboardStats = await fetchWithAuth("/dashboard/stats")
        setDashboardStats(statsData)

        const todayRemindersData: Reminder[] = await fetchWithAuth("/dashboard/reminders/today")
        setTodayReminders(todayRemindersData)

        const upcomingRemindersData: Reminder[] = await fetchWithAuth("/dashboard/reminders/upcoming")
        setUpcomingReminders(upcomingRemindersData)

        const profileData: UserProfile = await fetchWithAuth("/profile")
        setUserProfile(profileData)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch dashboard data.",
          variant: "destructive",
        })
        // If unauthorized, fetchWithAuth will redirect to login, so no need to do it here
      } finally {
        setIsLoading(false)
      }
    }

    getDashboardData()
  }, [toast, router])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading dashboard...</p>
        </main>
        <Footer />
      </>
    )
  }

  // Fallback for when dashboardStats is null (e.g., after an error that didn't redirect)
  if (!dashboardStats) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p>Could not load dashboard data. Please try again later.</p>
        </main>
        <Footer />
      </>
    )
  }

  const statsDisplay = [
    { label: "Total Medicines", value: dashboardStats.total_medicines, icon: Pill, trend: "" },
    { label: "Active Medicines", value: dashboardStats.active_medicines, icon: Activity, trend: "" },
    { label: "Today's Reminders", value: dashboardStats.today_reminders, icon: Bell, trend: "" },
    { label: "Upcoming Reminders", value: dashboardStats.upcoming_reminders, icon: TrendingUp, trend: "" },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {userProfile?.username || "User"}!</h1>
            <p className="text-foreground/60">Here's your health overview for today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsDisplay.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="glass p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Icon size={24} />
                    </div>
                  </div>
                  <p className="text-foreground/60 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold mb-2">{stat.value}</p>
                  <p className="text-accent text-xs font-medium">{stat.trend}</p>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Reminders */}
            <div className="lg:col-span-2">
              <div className="glass p-6 rounded-xl border border-border mb-8">
                <h2 className="text-xl font-bold mb-6">Today's Reminders</h2>
                <div className="space-y-4">
                  {todayReminders.length > 0 ? (
                    todayReminders.map((reminder, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-semibold text-primary">
                              {new Date(reminder.reminder_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">{reminder.medicine_name}</p>
                            <p className="text-sm text-foreground/60">{reminder.dosage}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              reminder.status === "acknowledged"
                                ? "bg-accent/20 text-accent"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            {reminder.status === "acknowledged" ? "Completed" : "Pending"}
                          </span>
                          {reminder.status === "pending" && <Button size="sm">Take Now</Button>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/60">No reminders for today.</p>
                  )}
                </div>
              </div>

              {/* Upcoming Reminders */}
              <div className="glass p-6 rounded-xl border border-border">
                <h2 className="text-xl font-bold mb-6">Upcoming Reminders</h2>
                <div className="space-y-4">
                  {upcomingReminders.length > 0 ? (
                    upcomingReminders.map((reminder, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-semibold text-primary">
                              {new Date(reminder.reminder_time).toLocaleDateString()} -{" "}
                              {new Date(reminder.reminder_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">{reminder.medicine_name}</p>
                            <p className="text-sm text-foreground/60">{reminder.dosage}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              reminder.status === "acknowledged"
                                ? "bg-accent/20 text-accent"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            {reminder.status === "acknowledged" ? "Completed" : "Pending"}
                          </span>
                          {reminder.status === "pending" && <Button size="sm">Take Now</Button>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/60">No upcoming reminders.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="glass p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start gap-2 bg-transparent" variant="outline" onClick={() => router.push("/medicines")}>
                    <Plus size={20} />
                    Add Medicine
                  </Button>
                  <Button className="w-full justify-start gap-2 bg-transparent" variant="outline" onClick={() => router.push("/chat")}>
                    <MessageSquare size={20} />
                    Chat with AI
                  </Button>
                  <Button className="w-full justify-start gap-2 bg-transparent" variant="outline" onClick={() => router.push("/models")}>
                    <Upload size={20} />
                    Analyze Image
                  </Button>
                  <Button className="w-full justify-start gap-2 bg-transparent" variant="outline" onClick={() => router.push("/profile")}>
                    <User size={20} />
                    View Profile
                  </Button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  {dashboardStats.recent_medicines.length > 0 ? (
                    dashboardStats.recent_medicines.map((medicine, idx) => (
                      <p key={idx} className="text-foreground/60">
                        ✓ Added {medicine.name} ({medicine.dosage}) on{" "}
                        {new Date(medicine.created_at).toLocaleDateString()}
                      </p>
                    ))
                  ) : (
                    <p className="text-foreground/60">No recent medicine activity.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
