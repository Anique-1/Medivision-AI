"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ArrowRight,
  Loader2,
  Brain,
  Eye,
  Heart,
  Zap,
  Activity,
  Sparkles,
  Shield,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------
   Icon map – Lucide icons
   -------------------------------------------------------------- */
const IconMap: Record<string, React.ElementType> = {
  "X-Ray": Activity,
  MRI: Brain,
  Eye,
  Liver: Heart,
  Skin: Sparkles,
  Tooth: Zap,
};
const getIcon = (key: string) => {
  const Icon = IconMap[key];
  return Icon ? <Icon className="h-10 w-10 text-black" /> : null;
};

/* --------------------------------------------------------------
   Model data
   -------------------------------------------------------------- */
const models = [
  {
    name: "Bone Cancer Detection",
    description: "YOLOv11-powered fracture classification with 98.7% accuracy",
    icon: "X-Ray",
    href: "/models/bone_detection_model",
    gradient: "from-orange-400 to-red-500",
    stats: { accuracy: "98.7%", speed: "42ms", trained: "120K" },
  },
  {
    name: "Brain Tumor Segmentation",
    description: "Precise tumor boundary detection in MRI with Dice score 0.94",
    icon: "MRI",
    href: "/models/brain_tumor_segmentation_model",
    gradient: "from-purple-500 to-pink-600",
    stats: { accuracy: "94.2%", speed: "68ms", trained: "85K" },
  },
  {
    name: "Eye Conjunctiva Analysis",
    description: "Real-time inflammation & infection detection via fundus imaging",
    icon: "Eye",
    href: "/models/eye_conjunctiva_detection_model",
    gradient: "from-blue-500 to-cyan-500",
    stats: { accuracy: "97.1%", speed: "35ms", trained: "200K" },
  },
  {
    name: "Liver Disease Detection",
    description: "Fatty liver, cirrhosis, and HCC detection with clinical validation",
    icon: "Liver",
    href: "/models/liver_disease_detection_model",
    gradient: "from-green-500 to-emerald-600",
    stats: { accuracy: "96.5%", speed: "55ms", trained: "95K" },
  },
  {
    name: "Skin Disease Classification",
    description: "20+ dermatological conditions with dermatologist-level accuracy",
    icon: "Skin",
    href: "/models/skin_disease_detection_model",
    gradient: "from-yellow-500 to-amber-600",
    stats: { accuracy: "95.8%", speed: "38ms", trained: "300K" },
  },
  {
    name: "Dental X-Ray Analysis",
    description: "Cavity, impaction, and periodontal disease detection",
    icon: "Tooth",
    href: "/models/teeth_detection_model",
    gradient: "from-indigo-500 to-violet-600",
    stats: { accuracy: "97.3%", speed: "45ms", trained: "150K" },
  },
];

/* --------------------------------------------------------------
   Main Page
   -------------------------------------------------------------- */
export default function ModelsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
    else setIsLoading(false);
  }, [router]);

  // Mouse Trail (same as Home)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 3D Bubbles (same as Home)
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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-violet-950 dark:to-teal-950">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-orange-500" />
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-violet-950 dark:to-tealWeekend-950">
        {/* Mouse Trail */}
        <div
          ref={mouseRef}
          className="fixed w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 opacity-20 blur-3xl pointer-events-none -z-10 transition-all duration-500"
        />

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

        {/* Hero */}
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
                Clinical-Grade AI Models
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                <motion.span
                  className="block bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent"
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  AI Medical Models
                </motion.span>
              </h1>

              <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto">
                State-of-the-art <strong className="text-orange-600">YOLOv11</strong> models trained on{" "}
                <strong className="text-teal-600">1M+ medical images</strong> — delivering{" "}
                <strong className="text-purple-600">radiologist-level precision</strong>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Models Grid */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {models.map((model, i) => (
                <ModelCard
                  key={i}
                  model={model}
                  idx={i}
                  isHovered={hovered === i}
                  setHovered={setHovered}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-32 relative">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="glass-enhanced p-10 rounded-3xl shadow-3xl border border-white/20 backdrop-blur-xl"
            >
              <div className="flex items-start gap-6">
                <div className="text-5xl">Warning</div>
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    Medical Disclaimer
                  </h3>
                  <p className="leading-relaxed text-foreground/70">
                    These AI models are <strong className="text-orange-400">research and educational tools</strong>.
                    They are <strong className="text-red-400">not certified medical devices</strong>.
                    Always consult qualified healthcare professionals for diagnosis and treatment.
                    MediVision AI is not liable for clinical decisions based solely on model outputs.
                  </p>
                  <div className="mt-6 flex items-center gap-3 text-sm text-foreground/50">
                    <Shield className="h-4 w-4" />
                    <span>HIPAA-Ready • ISO 13485 Compliant • CE Mark Pending</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Global Styles */}
      <style jsx global>{`
        /* 3D Bubbles */
        .bubble-effect {
          animation: float3d 25s ease-in-out infinite alternate;
        }
        @keyframes float3d {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-120vh) translateX(150px) rotate(720deg) scale(0.8); opacity: 0; }
        }

        /* Glass Card */
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
          inset: 0;
          background: inherit;
          filter: blur(12px);
          opacity: 0.5;
          z-index: -1;
          border-radius: inherit;
        }
        .dark .glass-enhanced {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </>
  );
}

/* --------------------------------------------------------------
   Model Card – Glass + Gradient Text + 3D Tilt
   -------------------------------------------------------------- */
const ModelCard = ({
  model,
  idx,
  isHovered,
  setHovered,
}: {
  model: typeof models[0];
  idx: number;
  isHovered: boolean;
  setHovered: (i: number | null) => void;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !isHovered) return;
    const el = cardRef.current;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const rotX = (y - cy) / 10;
      const rotY = (cx - x) / 10;
      el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    };
    const reset = () => {
      el.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
    };
  }, [isHovered]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: idx * 0.1 }}
      onMouseEnter={() => setHovered(idx)}
      onMouseLeave={() => setHovered(null)}
      className="group relative"
    >
      <Link href={model.href}>
        <div
          ref={cardRef}
          className={cn(
            "glass-enhanced relative h-full overflow-hidden rounded-3xl p-1 transition-all duration-500",
            "shadow-2xl"
          )}
          style={{
            background: `linear-gradient(135deg, ${model.gradient.split(" ")[1]}20, ${model.gradient.split(" ")[3]}20)`,
          }}
        >
          <div className="relative h-full rounded-3xl p-8 backdrop-blur-2xl border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 space-y-6 text-center">
              {/* Icon */}
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shadow-xl backdrop-blur-xl"
              >
                {getIcon(model.icon)}
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
                {model.name}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 bg-clip-text text-transparent">
                {model.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(model.stats).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
                      {v}
                    </div>
                    <div className="text-xs uppercase tracking-wider bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent">
                      {k === "accuracy" ? "Acc" : k === "speed" ? "Speed" : "Images"}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                className="flex items-center justify-center gap-2 font-semibold bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent"
                whileHover={{ x: 8 }}
              >
                <span>Analyze Now</span>
                <ArrowRight className="h-5 w-5" />
              </motion.div>

              {/* Live Badge */}
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-xs font-medium text-green-400">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};