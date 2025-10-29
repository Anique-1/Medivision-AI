"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit2, Trash2, Eye, Clock, Pill, Sparkles, AlertCircle, Zap } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { MedicineCard } from "@/components/MedicineCard";

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  times: string[];
  instructions: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export default function MedicinesPage() {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineDosage, setNewMedicineDosage] = useState("");
  const [newMedicineTimes, setNewMedicineTimes] = useState("");
  const [newMedicineInstructions, setNewMedicineInstructions] = useState("");

  /* ---------- Mouse Trail (same as home) ---------- */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  /* ---------- 3D Bubbles (same as home) ---------- */
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

  /* ---------- Fetch Medicines ---------- */
  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const data: Medicine[] = await fetchWithAuth(`/medicines/?status=${filter === "all" ? "" : filter}`);
      setMedicines(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch medicines.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [filter]);

  /* ---------- CRUD Handlers ---------- */
  const handleAddMedicine = async () => {
    try {
      const timesArray = newMedicineTimes.split(",").map(t => t.trim()).filter(Boolean);
      const payload = {
        name: newMedicineName,
        dosage: newMedicineDosage,
        times: timesArray,
        instructions: newMedicineInstructions || null,
      };
      await fetchWithAuth("/medicines/", { method: "POST", body: JSON.stringify(payload) });
      toast({ title: "Success!", description: "Medicine added.", variant: "default" });
      setShowAddModal(false);
      resetForm();
      fetchMedicines();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add.", variant: "destructive" });
    }
  };

  const handleEditMedicine = async () => {
    if (!selectedMedicine) return;
    try {
      const timesArray = newMedicineTimes.split(",").map(t => t.trim()).filter(Boolean);
      const payload = {
        name: newMedicineName,
        dosage: newMedicineDosage,
        times: timesArray,
        instructions: newMedicineInstructions || null,
      };
      await fetchWithAuth(`/medicines/${selectedMedicine.id}`, { method: "PUT", body: JSON.stringify(payload) });
      toast({ title: "Success!", description: "Medicine updated.", variant: "default" });
      setShowEditModal(false);
      resetForm();
      fetchMedicines();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update.", variant: "destructive" });
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    if (!confirm("Delete this medicine?")) return;
    try {
      await fetchWithAuth(`/medicines/${id}`, { method: "DELETE" });
      toast({ title: "Deleted", description: "Medicine removed.", variant: "default" });
      fetchMedicines();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete.", variant: "destructive" });
    }
  };

  const openEditModal = (med: Medicine) => {
    setSelectedMedicine(med);
    setNewMedicineName(med.name);
    setNewMedicineDosage(med.dosage);
    setNewMedicineTimes(med.times.join(", "));
    setNewMedicineInstructions(med.instructions || "");
    setShowEditModal(true);
  };

  const resetForm = () => {
    setNewMedicineName("");
    setNewMedicineDosage("");
    setNewMedicineTimes("");
    setNewMedicineInstructions("");
    setSelectedMedicine(null);
  };

  const filteredMedicines = medicines.filter(med => {
    const matchesFilter = filter === "all" || med.status === filter;
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
                  My Medicines
                </span>
              </h1>
              <p className="mt-4 text-xl text-foreground/70">Track, manage, and never miss a dose</p>
            </motion.div>

            {/* Search + Filter */}
            <div className="glass-enhanced p-6 rounded-3xl border border-white/20 backdrop-blur-xl mb-12 shadow-3xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search your medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 glass-input bg-white/5 border-white/20 text-lg h-14"
                  />
                </div>
                <div className="flex gap-3">
                  {(["all", "active", "inactive"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? "default" : "outline"}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "capitalize h-14 px-8 glass-button",
                        filter === f && "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      )}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Button */}
            <div className="flex justify-center mb-12">
              <Button
                size="lg"
                onClick={() => { setShowAddModal(true); resetForm(); }}
                className="px-10 py-7 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-2xl transform hover:scale-105 transition backdrop-blur-sm border border-white/20"
              >
                <Plus className="w-6 h-6 mr-2" />
                Add New Medicine
              </Button>
            </div>

            {/* Medicines Grid */}
            {isLoading ? (
              <div className="text-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-xl text-foreground/70">Loading your medicines...</p>
              </div>
            ) : filteredMedicines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMedicines.map((med, i) => (
                  <MedicineCard
                    key={med.id}
                    medicine={med}
                    index={i}
                    openEditModal={openEditModal}
                    handleDeleteMedicine={handleDeleteMedicine}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="glass-enhanced p-16 rounded-3xl border border-white/20 backdrop-blur-xl max-w-md mx-auto">
                  <div className="text-8xl mb-6">Pill</div>
                  <h3 className="text-3xl font-bold mb-4">No medicines yet</h3>
                  <p className="text-foreground/70 mb-8">Start by adding your first medicine</p>
                  <Button
                    size="lg"
                    onClick={() => { setShowAddModal(true); resetForm(); }}
                    className="px-10 py-7 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-2xl"
                  >
                    <Plus className="w-6 h-6 mr-2" /> Add Medicine
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Modals */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-enhanced p-8 rounded-3xl border border-white/20 backdrop-blur-xl max-w-lg w-full shadow-3xl"
            >
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Pill className="w-8 h-8 text-orange-500" />
                {showAddModal ? "Add New Medicine" : "Edit Medicine"}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Medicine Name</label>
                  <Input
                    value={newMedicineName}
                    onChange={(e) => setNewMedicineName(e.target.value)}
                    placeholder="e.g., Panadol"
                    className="glass-input bg-white/5 border-white/20 h-14 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Dosage</label>
                  <Input
                    value={newMedicineDosage}
                    onChange={(e) => setNewMedicineDosage(e.target.value)}
                    placeholder="e.g., 500mg"
                    className="glass-input bg-white/5 border-white/20 h-14 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Times (comma-separated)</label>
                  <Input
                    value={newMedicineTimes}
                    onChange={(e) => setNewMedicineTimes(e.target.value)}
                    placeholder="08:00 AM, 08:00 PM"
                    className="glass-input bg-white/5 border-white/20 h-14 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Instructions (optional)</label>
                  <Textarea
                    value={newMedicineInstructions}
                    onChange={(e) => setNewMedicineInstructions(e.target.value)}
                    placeholder="Take with food..."
                    rows={3}
                    className="glass-input bg-white/5 border-white/20 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    onClick={showAddModal ? handleAddMedicine : handleEditMedicine}
                  >
                    {showAddModal ? "Add Medicine" : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-14 text-lg glass-button bg-white/5"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
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
