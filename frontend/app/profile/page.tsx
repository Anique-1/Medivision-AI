"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Trash2, Edit2, Save } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: number
  email: string
  username: string
  full_name: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

interface ProfileStats {
  username: string
  email: string
  full_name: string | null
  member_since: string
  total_medicines: number
  total_reminders: number
  acknowledged_reminders: number
  adherence_rate: number
  total_chats: number
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // State for profile editing
  const [editFullName, setEditFullName] = useState("")
  const [editEmail, setEditEmail] = useState("")

  // State for password change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const fetchProfileData = async () => {
    setIsLoading(true)
    try {
      const profile: UserProfile = await fetchWithAuth("/profile/me")
      setUserProfile(profile)
      setEditFullName(profile.full_name || "")
      setEditEmail(profile.email)

      const stats: ProfileStats = await fetchWithAuth("/profile/stats")
      setProfileStats(stats)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [toast])

  const handleUpdateProfile = async () => {
    try {
      const updatedData = {
        full_name: editFullName,
        email: editEmail,
      }
      const response: UserProfile = await fetchWithAuth("/profile/me", {
        method: "PUT",
        body: JSON.stringify(updatedData),
      })
      setUserProfile(response)
      toast({
        title: "Success!",
        description: "Profile updated successfully.",
        variant: "default",
      })
      setIsEditing(false)
      fetchProfileData() // Refresh stats as well
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      await fetchWithAuth("/profile/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })
      toast({
        title: "Success!",
        description: "Password changed successfully.",
        variant: "default",
      })
      setIsChangingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }
    try {
      await fetchWithAuth("/profile/me", {
        method: "DELETE",
      })
      toast({
        title: "Success!",
        description: "Account deleted successfully.",
        variant: "default",
      })
      localStorage.removeItem("access_token") // Clear token
      router.push("/register") // Redirect to registration or login
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading profile...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (!userProfile || !profileStats) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p>Could not load profile data. Please try again later.</p>
        </main>
        <Footer />
      </>
    )
  }

  const statsDisplay = [
    { label: "Total Medicines", value: profileStats.total_medicines },
    { label: "Total Reminders", value: profileStats.total_reminders },
    { label: "Adherence Rate", value: `${profileStats.adherence_rate}%` },
    { label: "AI Chats", value: profileStats.total_chats },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Profile Header */}
          <div className="glass p-8 rounded-xl border border-border mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : userProfile.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{userProfile.full_name || userProfile.username}</h1>
                  <p className="text-foreground/60">@{userProfile.username}</p>
                  <p className="text-sm text-foreground/50 mt-1">
                    Member since {new Date(profileStats.member_since).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="gap-2">
                <Edit2 size={20} />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsDisplay.map((stat, idx) => (
              <div key={idx} className="glass p-4 rounded-lg border border-border text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="glass p-8 rounded-xl border border-border mb-8">
                <h2 className="text-xl font-bold mb-6">Profile Information</h2>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <Input type="text" value={userProfile.username} disabled />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button className="gap-2" onClick={handleUpdateProfile}>
                        <Save size={20} />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <span className="text-foreground/60">Full Name</span>
                      <span className="font-medium">{userProfile.full_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <span className="text-foreground/60">Email</span>
                      <span className="font-medium">{userProfile.email}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <span className="text-foreground/60">Username</span>
                      <span className="font-medium">{userProfile.username}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Section */}
              <div className="glass p-8 rounded-xl border border-border">
                <h2 className="text-xl font-bold mb-6">Security</h2>

                {isChangingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-foreground/40" size={20} />
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          className="pl-10"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-foreground/40" size={20} />
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          className="pl-10"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-foreground/40" size={20} />
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          className="pl-10"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button className="gap-2" onClick={handleChangePassword}>
                        <Save size={20} />
                        Update Password
                      </Button>
                      <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setIsChangingPassword(true)} className="gap-2">
                    <Lock size={20} />
                    Change Password
                  </Button>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <div className="glass p-6 rounded-xl border border-destructive/30 bg-destructive/5">
                <h3 className="font-bold text-destructive mb-4">Danger Zone</h3>
                <p className="text-sm text-foreground/60 mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <Button variant="destructive" className="w-full gap-2" onClick={handleDeleteAccount}>
                  <Trash2 size={20} />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
