"use client"

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Brain } from "lucide-react"

export default function Home() {
  const models = [
    { name: "Bone Fracture Detection", icon: "🦴", href: "/models/bone-detection" },
    { name: "Brain Tumor Segmentation", icon: "🧠", href: "/models/brain-tumor" },
    { name: "Eye Conjunctiva Analysis", icon: "👁️", href: "/models/eye-conjunctiva" },
    { name: "Liver Disease Detection", icon: "🫘", href: "/models/liver-disease" },
    { name: "Skin Disease Classification", icon: "🔬", href: "/models/skin-disease" },
    { name: "Dental Analysis", icon: "🦷", href: "/models/teeth-detection" },
  ]

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Analysis",
      description: "Get instant results with our advanced YOLO models",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Precise medical diagnostics powered by deep learning",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your medical data is encrypted and protected",
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-6 animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                <span className="gradient-text">AI-Powered Medical</span>
                <br />
                <span>Image Analysis</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
                Advanced YOLO models for precise medical diagnostics. Upload your medical images and get instant
                AI-powered insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/register">
                    Get Started <ArrowRight size={20} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/models">Explore Models</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose MediVision AI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="glass p-8 rounded-xl border border-border hover:border-primary/50 transition">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-foreground/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Models Showcase */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our AI Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model, idx) => (
                <Link key={idx} href={model.href}>
                  <div className="glass p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition cursor-pointer h-full">
                    <div className="text-4xl mb-4">{model.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{model.name}</h3>
                    <p className="text-foreground/60 text-sm mb-4">
                      Advanced YOLO model for accurate detection and analysis
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Try Now <ArrowRight size={16} className="ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Upload Image", desc: "Select your medical image" },
                { step: "2", title: "AI Analysis", desc: "Our models analyze instantly" },
                { step: "3", title: "Get Results", desc: "Receive detailed insights" },
                { step: "4", title: "Take Action", desc: "Share with healthcare providers" },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="glass p-6 rounded-xl border border-border text-center">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-foreground/60 text-sm">{item.desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-accent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-foreground/70 mb-8">
              Join healthcare professionals using MediVision AI for accurate medical image analysis.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link href="/register">
                Create Free Account <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
