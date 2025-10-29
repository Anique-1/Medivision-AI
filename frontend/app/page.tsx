"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Zap, Brain, Shield, Stethoscope, Pill, Search, Phone, Heart, Activity, Sparkles, Plus, Clock, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

// Tool Icons
const toolIcons: Record<string, React.ReactNode> = {
  add_medicine: <Pill className="w-5 h-5" />,
  show_all_medicines: <Stethoscope className="w-5 h-5" />,
  update_medicine: <Activity className="w-5 h-5" />,
  delete_medicine: <Heart className="w-5 h-5" />,
  health_advisor: <Brain className="w-5 h-5" />,
  medicine_pricing: <Search className="w-5 h-5" />,
  find_pharmacies: <Phone className="w-5 h-5" />,
  find_doctors: <Stethoscope className="w-5 h-5" />,
  find_hospitals: <Activity className="w-5 h-5" />,
  find_telemedicine_services: <Zap className="w-5 h-5" />,
  symptom_checker: <Heart className="w-5 h-5" />,
  check_drug_interactions: <Shield className="w-5 h-5" />,
  medicine_information: <Search className="w-5 h-5" />,
  emergency_services: <Phone className="w-5 h-5" />,
  nutrition_advisor: <Brain className="w-5 h-5" />,
  vaccine_information: <Shield className="w-5 h-5" />,
};

const tools = [
  { name: "Add Medicine", tool: "add_medicine", desc: "Add or update your daily medicines" },
  { name: "My Medicines", tool: "show_all_medicines", desc: "View all your active prescriptions" },
  { name: "Update Medicine", tool: "update_medicine", desc: "Edit dosage or timing" },
  { name: "Delete Medicine", tool: "delete_medicine", desc: "Remove from your list" },
  { name: "Health Advisor", tool: "health_advisor", desc: "Get instant health guidance" },
  { name: "Medicine Pricing", tool: "medicine_pricing", desc: "Find prices in Pakistan" },
  { name: "Find Pharmacies", tool: "find_pharmacies", desc: "Locate nearby pharmacies" },
  { name: "Find Doctors", tool: "find_doctors", desc: "Search by specialty & location" },
  { name: "Find Hospitals", tool: "find_hospitals", desc: "Nearest hospitals with ratings" },
  { name: "Telemedicine", tool: "find_telemedicine_services", desc: "Online doctor consultations" },
  { name: "Symptom Checker", tool: "symptom_checker", desc: "Analyze symptoms instantly" },
  { name: "Drug Interactions", tool: "check_drug_interactions", desc: "Check medicine compatibility" },
  { name: "Medicine Info", tool: "medicine_information", desc: "Uses, side effects, dosage" },
  { name: "Emergency Services", tool: "emergency_services", desc: "Find help in emergencies" },
  { name: "Nutrition Advisor", tool: "nutrition_advisor", desc: "Personalized diet tips" },
  { name: "Vaccine Info", tool: "vaccine_information", desc: "Schedule & side effects" },
];

export default function Home() {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [demoMedicines, setDemoMedicines] = useState([
    { id: 1, name: "Panadol", dosage: "500mg", time: "8:00 AM", status: "active" },
    { id: 2, name: "Aspirin", dosage: "100mg", time: "6:00 PM", status: "active" },
  ]);

  // Mouse Trail Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Enhanced 3D Bubbles
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

  return (
    <>
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
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
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
        <section ref={heroRef} className="relative py-32 overflow-hidden">
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
                First Agentic Health AI in Pakistan
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
                  Your 24/7 Health Oracle
                </motion.span>
              </h1>

              <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto">
                Powered by <strong className="text-orange-600">LangGraph Agentic Engine</strong> — one AI that thinks, plans, and acts across 16 health tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Button size="lg" asChild className="text-lg px-10 py-7 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-2xl transform hover:scale-105 transition backdrop-blur-sm border border-white/20">
                  <Link href="/chat">
                    Talk to AI Doctor <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 text-lg px-10 py-7 backdrop-blur-sm">
                  <Link href="/register">Start Free</Link>
                </Button>
              </div>
            </motion.div>

            {/* Enhanced Live Demo Interface */}
            <motion.div
              className="mt-20 max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="glass-enhanced rounded-3xl p-8 md:p-12 shadow-3xl border border-white/20 backdrop-blur-xl relative overflow-hidden">
                {/* Demo Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-orange-600">Live Agent Demo</h3>
                      <p className="text-sm text-foreground/60">Watch AI manage medicines in real-time</p>
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

                {/* Demo Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Medicine Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="glass-mini p-4 rounded-xl border border-white/10">
                      <div className="flex gap-2 mb-2">
                        <Input placeholder="Medicine name" className="glass-input bg-white/5 border-white/20" />
                        <Input placeholder="Dosage" className="glass-input bg-white/5 border-white/20 w-32" />
                        <Input placeholder="Time" className="glass-input bg-white/5 border-white/20 w-28" />
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 h-10 px-4">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-foreground/50">Try: "Panadol 500mg at 8:00 AM"</p>
                    </div>

                    {/* Medicine List */}
                    <div className="glass-mini p-4 rounded-xl border border-white/10 max-h-64 overflow-y-auto">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Pill className="w-4 h-4" /> Your Medicines
                      </h4>
                      <div className="space-y-2">
                        {demoMedicines.map((med) => (
                          <motion.div
                            key={med.id}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div>
                              <div className="font-medium">{med.name}</div>
                              <div className="text-xs text-foreground/60">
                                {med.dosage} • {med.time}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-400" />
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Active</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Agent Activity Log */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="glass-mini p-4 rounded-xl border border-white/10">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Agent Actions
                      </h4>
                      <div className="space-y-2">
                        {[
                          "✅ Added Panadol to schedule",
                          "💰 Found pricing: PKR 150-200",
                          "🏥 Nearest pharmacy: 2km away",
                          "⚠️ No interactions detected",
                          "📅 Reminder set for 8:00 AM",
                        ].map((action, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center gap-2 text-sm p-2 bg-white/5 rounded-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-teal-400" />
                            <span>{action}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="glass-mini p-4 rounded-xl border border-white/10">
                      <h4 className="font-semibold mb-3">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {["Find Doctor", "Check Symptoms", "Emergency"].map((action, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            size="sm"
                            className="glass-button justify-start h-10 bg-white/5 hover:bg-white/10 border-white/10"
                          >
                            <span className="w-4 h-4 mr-2">{action.includes("Emergency") ? <AlertCircle className="w-4 h-4" /> : <Search className="w-4 h-4" />}</span>
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <FeatureSection />

        {/* Tools Grid */}
        <ToolsSection tools={tools} toolIcons={toolIcons} />

        {/* Image AI */}
        <ImageAISection />

        {/* CTA */}
        <CTASection />
      </main>
      {/* Enhanced CSS */}
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
        }
        
        .glass-input {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
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
        .dark .glass-mini,
        .dark .glass-input,
        .dark .glass-button {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </>
  );
}

// Rest of the components remain the same but with enhanced glass effects
const FeatureSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-32 relative">
      {/* Background bubbles visible through features */}
      <div className="absolute inset-0 -z-10">
        <div className="bubble-effect w-32 h-32 bg-orange-400/20 rounded-full blur-xl top-20 left-20 animate-pulse" />
        <div className="bubble-effect w-48 h-48 bg-amber-400/15 rounded-full blur-2xl bottom-20 right-20 animate-pulse delay-1000" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent"
        >
          Why MediVision AI?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: <Brain className="w-12 h-12" />, title: "Agentic Intelligence", desc: "Plans, reasons, and acts using 16 tools autonomously" },
            { icon: <Shield className="w-12 h-12" />, title: "Military-Grade Privacy", desc: "End-to-end encrypted. Your data stays yours." },
            { icon: <Zap className="w-12 h-12" />, title: "Instant Action", desc: "No waiting. Real-time search, pricing, and advice." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="group relative"
            >
              <Card className="glass-enhanced p-10 h-full border border-white/10 hover:border-orange-500/30 transition-all duration-500 hover:shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 relative z-10">{f.title}</h3>
                  <p className="text-foreground/70 relative z-10">{f.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Update other sections similarly with glass-enhanced classes...
const ToolsSection = ({ tools, toolIcons }: any) => {
  const [ref, inView] = useInView({ triggerOnce: true });

  return (
    <section ref={ref} className="py-32 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent dark:via-slate-900/30 relative">
      <div className="absolute inset-0 -z-10">
        <div className="bubble-effect w-24 h-24 bg-teal-400/10 rounded-full blur-xl top-1/2 left-10 animate-pulse" />
        <div className="bubble-effect w-36 h-36 bg-orange-400/10 rounded-full blur-xl bottom-1/4 right-20 animate-pulse delay-2000" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-5xl font-bold text-center mb-6 relative z-10"
        >
          16 Powerful Health Tools
        </motion.h2>
        <p className="text-center text-foreground/70 mb-20 max-w-3xl mx-auto text-lg relative z-10">
          One AI controls everything — no app switching, no confusion.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map((tool: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group relative"
            >
              <Card className="glass-enhanced p-8 h-full border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:shadow-xl cursor-pointer backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition">
                    {toolIcons[tool.tool] || <Brain className="w-7 h-7" />}
                  </div>
                  <h3 className="font-bold text-lg mb-2 relative z-10">{tool.name}</h3>
                  <p className="text-sm text-foreground/60 relative z-10">{tool.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Continue updating ImageAISection and CTASection with similar glass-enhanced effects...
// [Previous implementations with added glass-enhanced classes and bubble visibility]

const ImageAISection = () => {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="py-32 relative">
      <div className="absolute inset-0 -z-10">
        <div className="bubble-effect w-40 h-40 bg-violet-400/10 rounded-full blur-2xl top-1/4 left-1/4 animate-pulse" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent relative z-10"
        >
          Medical Image Intelligence
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { name: "Bone Fracture", icon: "🦴", href: "/models/bone-detection" },
            { name: "Brain Tumor", icon: "🧠", href: "/models/brain-tumor" },
            { name: "Skin Disease", icon: "🩹", href: "/models/skin-disease" },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, rotateY: 180 }}
              animate={inView ? { opacity: 1, rotateY: 0 } : {}}
              transition={{ delay: i * 0.3 }}
              whileHover={{ scale: 1.1, rotateY: 10 }}
              className="group relative"
            >
              <Link href={m.href}>
                <Card className="glass-enhanced p-12 text-center h-full border border-white/10 hover:border-teal-500/30 transition-all hover:shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-violet-500/5" />
                  <div className="relative z-10">
                    <div className="text-7xl mb-6 relative z-20">{m.icon}</div>
                    <h3 className="text-2xl font-bold relative z-20">{m.name}</h3>
                    <p className="text-foreground/60 mt-3 relative z-20">YOLO-powered precision</p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 -z-10">
        <div className="bubble-effect w-60 h-60 bg-orange-400/15 rounded-full blur-3xl bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="max-w-5xl mx-auto text-center px-4 relative z-10"
      >
        <div className="glass-enhanced p-12 rounded-3xl shadow-3xl border border-white/20 backdrop-blur-xl">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 relative z-10">
            Health, <span className="text-orange-600">Reimagined</span>
          </h2>
          <p className="text-xl text-foreground/70 mb-12 max-w-2xl mx-auto relative z-10">
            Join 50,000+ users trusting AI for smarter, faster, safer healthcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <Button size="lg" asChild className="text-xl px-12 py-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xl hover:shadow-orange-500/50 backdrop-blur-sm border border-white/20">
              <Link href="/register">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-xl px-12 py-8 border-2 backdrop-blur-sm glass-button">
              <Link href="/chat">Live Demo</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
