"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, Loader2 } from "lucide-react"

export default function ModelsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const models = [
    {
      name: "Bone Fracture Detection",
      description: "Detect and classify bone fractures with high accuracy using advanced YOLO technology",
      icon: "🦴",
      href: "/models/bone_detection_model",
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      name: "Brain Tumor Segmentation",
      description: "Identify and segment brain tumors in MRI images with precise boundaries",
      icon: "🧠",
      href: "/models/brain_tumor_segmentation_model",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      name: "Eye Conjunctiva Analysis",
      description: "Analyze conjunctival regions for comprehensive eye health assessment",
      icon: "👁️",
      href: "/models/eye_conjunctiva_detection_model",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      name: "Liver Disease Detection",
      description: "Detect liver abnormalities and diseases with clinical-grade accuracy",
      icon: "🫘",
      href: "/models/liver_disease_detection_model",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      name: "Skin Disease Classification",
      description: "Classify various skin conditions and diseases for early diagnosis",
      icon: "🔬",
      href: "/models/skin_disease_detection_model",
      gradient: "from-yellow-500/20 to-amber-500/20",
    },
    {
      name: "Dental Analysis",
      description: "Analyze dental images for comprehensive oral health assessment",
      icon: "🦷",
      href: "/models/teeth_detection_model",
      gradient: "from-indigo-500/20 to-violet-500/20",
    },
  ]

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                AI-Powered Medical Analysis
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Medical Models
            </h1>
            <p className="text-lg md:text-xl text-foreground/60 max-w-3xl mx-auto">
              Choose from our suite of advanced YOLO models for precise medical image analysis.
              Each model is trained on extensive medical datasets for clinical-grade accuracy.
            </p>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {models.map((model, idx) => (
              <Link key={idx} href={model.href}>
                <div className="relative group h-full">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Card Content */}
                  <div className="relative glass p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col group-hover:translate-y-[-4px]">
                    {/* Icon */}
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      {model.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {model.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-foreground/60 mb-6 flex-grow text-sm leading-relaxed">
                      {model.description}
                    </p>
                    
                    {/* CTA */}
                    <div className="flex items-center text-primary font-medium text-sm group-hover:gap-3 gap-2 transition-all">
                      <span>Analyze Now</span>
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Info Banner */}
          <div className="mt-16 glass p-8 rounded-2xl border border-border">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚕️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Medical Disclaimer</h3>
                <p className="text-foreground/60 leading-relaxed">
                  These AI models are designed for educational and research purposes. They should be used as 
                  supplementary tools alongside professional medical diagnosis. Always consult with qualified 
                  healthcare professionals for medical decisions and treatment plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}