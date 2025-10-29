"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea" // Assuming you have a Textarea component

interface Medicine {
  id: number
  name: string
  dosage: string
  times: string[]
  instructions: string | null
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export default function MedicinesPage() {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // State for new/edit medicine form
  const [newMedicineName, setNewMedicineName] = useState("")
  const [newMedicineDosage, setNewMedicineDosage] = useState("")
  const [newMedicineTimes, setNewMedicineTimes] = useState("") // Comma-separated string
  const [newMedicineInstructions, setNewMedicineInstructions] = useState("")

  const fetchMedicines = async () => {
    setIsLoading(true)
    try {
      const data: Medicine[] = await fetchWithAuth(`/medicines/?status=${filter === "all" ? "" : filter}`)
      setMedicines(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch medicines.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [filter]) // Refetch when filter changes

  const handleAddMedicine = async () => {
    try {
      const timesArray = newMedicineTimes.split(",").map((time) => time.trim()).filter(Boolean)
      const newMedicine = {
        name: newMedicineName,
        dosage: newMedicineDosage,
        times: timesArray,
        instructions: newMedicineInstructions || null,
      }
      await fetchWithAuth("/medicines/", {
        method: "POST",
        body: JSON.stringify(newMedicine),
      })
      toast({
        title: "Success!",
        description: "Medicine added successfully.",
        variant: "default",
      })
      setShowAddModal(false)
      resetForm()
      fetchMedicines() // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add medicine.",
        variant: "destructive",
      })
    }
  }

  const handleEditMedicine = async () => {
    if (!selectedMedicine) return;
    try {
      const timesArray = newMedicineTimes.split(",").map((time) => time.trim()).filter(Boolean)
      const updatedMedicine = {
        name: newMedicineName,
        dosage: newMedicineDosage,
        times: timesArray,
        instructions: newMedicineInstructions || null,
      }
      await fetchWithAuth(`/medicines/${selectedMedicine.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedMedicine),
      })
      toast({
        title: "Success!",
        description: "Medicine updated successfully.",
        variant: "default",
      })
      setShowEditModal(false)
      resetForm()
      fetchMedicines() // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update medicine.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMedicine = async (medicineId: number) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await fetchWithAuth(`/medicines/${medicineId}`, {
        method: "DELETE",
      })
      toast({
        title: "Success!",
        description: "Medicine deleted successfully.",
        variant: "default",
      })
      fetchMedicines() // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete medicine.",
        variant: "destructive",
      })
    }
  }

  const openEditModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setNewMedicineName(medicine.name)
    setNewMedicineDosage(medicine.dosage)
    setNewMedicineTimes(medicine.times.join(", "))
    setNewMedicineInstructions(medicine.instructions || "")
    setShowEditModal(true)
  }

  const resetForm = () => {
    setNewMedicineName("")
    setNewMedicineDosage("")
    setNewMedicineTimes("")
    setNewMedicineInstructions("")
    setSelectedMedicine(null)
  }

  const filteredMedicines = medicines.filter((med) => {
    const matchesFilter = filter === "all" || med.status === filter
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Medicines</h1>
              <p className="text-foreground/60">Manage your medications and reminders</p>
            </div>
            <Button onClick={() => { setShowAddModal(true); resetForm(); }} className="gap-2">
              <Plus size={20} />
              Add Medicine
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="glass p-4 rounded-xl border border-border mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-foreground/40" size={20} />
              <Input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "inactive"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Medicines Grid */}
          {isLoading ? (
            <div className="text-center py-12">Loading medicines...</div>
          ) : filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedicines.map((medicine) => (
                <div key={medicine.id} className="glass p-6 rounded-xl border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{medicine.name}</h3>
                      <p className="text-primary font-semibold">{medicine.dosage}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        medicine.status === "active" ? "bg-accent/20 text-accent" : "bg-muted text-foreground/60"
                      }`}
                    >
                      {medicine.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-foreground/60 mb-2">Times</p>
                    <div className="flex flex-wrap gap-2">
                      {medicine.times.map((time, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-foreground/60 mb-4">{medicine.instructions}</p>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-2 bg-transparent">
                      <Eye size={16} />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-2 bg-transparent" onClick={() => openEditModal(medicine)}>
                      <Edit2 size={16} />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-2 bg-transparent" onClick={() => handleDeleteMedicine(medicine.id)}>
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-12 rounded-xl border border-border text-center">
              <div className="text-5xl mb-4">💊</div>
              <h3 className="text-xl font-bold mb-2">No medicines found</h3>
              <p className="text-foreground/60 mb-6">Add your first medicine to get started</p>
              <Button onClick={() => { setShowAddModal(true); resetForm(); }} className="gap-2">
                <Plus size={20} />
                Add Medicine
              </Button>
            </div>
          )}

          {/* Add Medicine Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="glass p-8 rounded-xl border border-border max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Add New Medicine</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Medicine Name</label>
                    <Input
                      type="text"
                      placeholder="Enter medicine name"
                      value={newMedicineName}
                      onChange={(e) => setNewMedicineName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Dosage</label>
                    <Input
                      type="text"
                      placeholder="e.g., 500mg"
                      value={newMedicineDosage}
                      onChange={(e) => setNewMedicineDosage(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Times (comma-separated)</label>
                    <Input
                      type="text"
                      placeholder="e.g., 08:00 AM, 08:00 PM"
                      value={newMedicineTimes}
                      onChange={(e) => setNewMedicineTimes(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Instructions</label>
                    <Textarea
                      placeholder="Special instructions"
                      value={newMedicineInstructions}
                      onChange={(e) => setNewMedicineInstructions(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" onClick={handleAddMedicine}>Save Medicine</Button>
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Medicine Modal */}
          {showEditModal && selectedMedicine && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="glass p-8 rounded-xl border border-border max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Edit Medicine</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Medicine Name</label>
                    <Input
                      type="text"
                      placeholder="Enter medicine name"
                      value={newMedicineName}
                      onChange={(e) => setNewMedicineName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Dosage</label>
                    <Input
                      type="text"
                      placeholder="e.g., 500mg"
                      value={newMedicineDosage}
                      onChange={(e) => setNewMedicineDosage(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Times (comma-separated)</label>
                    <Input
                      type="text"
                      placeholder="e.g., 08:00 AM, 08:00 PM"
                      value={newMedicineTimes}
                      onChange={(e) => setNewMedicineTimes(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Instructions</label>
                    <Textarea
                      placeholder="Special instructions"
                      value={newMedicineInstructions}
                      onChange={(e) => setNewMedicineInstructions(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" onClick={handleEditMedicine}>Save Changes</Button>
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
