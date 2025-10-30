"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Upload, Download, AlertCircle, Loader2, CheckCircle2, XCircle, Brain, Sparkles } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface YoloDetection {
  label: string;
  confidence: number;
  box: [number, number, number, number];
}

interface AnalysisResult {
  model_name?: string;
  detections?: string[];
  segmentation_info?: Array<{
    class: string;
    confidence: number;
    area_percentage: number;
    area_pixels: number;
  }>;
  ai_analysis?: string;
  annotated_image_url?: string;
  interpretation?: string;
  yolo_detections?: YoloDetection[];
  timestamp?: string;
}

const MODEL_ENDPOINTS: Record<string, string> = {
  "bone_detection_model": "/bone-detection",
  "brain_tumor_segmentation_model": "/brain-tumor",
  "eye_conjunctiva_detection_model": "/eye-conjunctiva",
  "liver_disease_detection_model": "/liver-disease",
  "skin_disease_detection_model": "/skin-disease",
  "teeth_detection_model": "/teeth-detection",
  "bone_cancer_detection_model": "/api/yolo/detect",
};

export default function ModelPage({ params }: { params: Promise<{ model: string }> }) {
  const { model: modelKey } = use(params);
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  // Mouse trail
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Bubbles
  useEffect(() => {
    const container = bubbleRef.current;
    if (!container) return;

    const createBubble = () => {
      const bubble = document.createElement("div");
      const size = Math.random() * 100 + 50;
      const duration = Math.random() * 20 + 15;
      const delay = Math.random() * 5;
      const depth = Math.random() * 0.8 + 0.2;

      bubble.className = "bubble-effect absolute rounded-full pointer-events-none";
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.bottom = `-200px`;
      bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(251, 146, 60, ${depth * 0.7}), rgba(245, 158, 11, ${depth * 0.3}), transparent)`;
      bubble.style.filter = `blur(${size / 25}px)`;
      bubble.style.animation = `float3d ${duration}s ease-in-out ${delay}s infinite alternate`;
      container.appendChild(bubble);
      setTimeout(() => bubble.remove(), (duration + delay) * 1000);
    };

    const interval = setInterval(createBubble, 600);
    return () => clearInterval(interval);
  }, []);

  const modelInfo: Record<string, any> = {
    "bone_detection_model": { name: "Bone Fracture Detection", icon: "Bone", color: "from-orange-500 to-red-500" },
    "brain_tumor_segmentation_model": { name: "Brain Tumor Segmentation", icon: "Brain", color: "from-purple-500 to-pink-500" },
    "eye_conjunctiva_detection_model": { name: "Eye Conjunctiva Analysis", icon: "Eye", color: "from-blue-500 to-cyan-500" },
    "liver_disease_detection_model": { name: "Liver Disease Detection", icon: "Liver", color: "from-green-500 to-emerald-500" },
    "skin_disease_detection_model": { name: "Skin Disease Classification", icon: "Skin", color: "from-yellow-500 to-amber-500" },
    "teeth_detection_model": { name: "Dental Analysis", icon: "Tooth", color: "from-indigo-500 to-violet-500" },
    "bone_cancer_detection_model": { name: "Bone Cancer Detection (YOLO)", icon: "Skull", color: "from-red-700 to-red-900" },
  };

  const model = modelInfo[modelKey] || { name: "Unknown Model", icon: "Question", color: "from-gray-500 to-gray-600" };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image");
      toast({ title: "Invalid File", description: "Image only", variant: "destructive" });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File too large (>50MB)");
      toast({ title: "Too Large", description: "<50MB", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !MODEL_ENDPOINTS[modelKey]) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const raw = await fetchWithAuth(MODEL_ENDPOINTS[modelKey], { method: "POST", body: formData });
      const result: AnalysisResult = modelKey === "bone_cancer_detection_model"
        ? {
            yolo_detections: raw.yolo_detections,
            interpretation: raw.interpretation,
            timestamp: raw.timestamp,
            annotated_image_url: raw.annotated_image_url
          }
        : raw;

      setAnalysisResult(result);
      toast({ title: "Success", description: "Analysis complete!", variant: "default" });
    } catch (err: any) {
      setError(err.message || "Analysis failed");
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;

    const report = `
MEDICAL IMAGE ANALYSIS REPORT
Model: ${model.name}
Date: ${new Date().toLocaleString()}

${analysisResult.yolo_detections ? "YOLO DETECTIONS:\n" + analysisResult.yolo_detections.map(d => 
  `- ${d.label}: ${(d.confidence*100).toFixed(1)}% [${d.box.map(Math.round).join(', ')}]`
).join('\n') : ''}

${analysisResult.ai_analysis || analysisResult.interpretation || "No interpretation available."}

DISCLAIMER: For educational use. Consult a doctor.
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${modelKey}_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Report saved" });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-violet-950 dark:to-teal-950">
        {/* Mouse Trail */}
        <div ref={mouseRef} className="fixed w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 opacity-20 blur-3xl pointer-events-none -z-10 transition-all duration-500" />

        {/* Bubbles */}
        <div ref={bubbleRef} className="fixed inset-0 -z-10" />

        {/* Wave Background */}
        <div className="absolute inset-0 -z-10">
          <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="url(#wave)"
              fillOpacity="0.08"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"
              animate={{ d: ["M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z", "M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,149C672,170,768,181,864,170C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L0,320Z", "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="wave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <section className="relative py-24">
          <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-gradient-to-t from-orange-100/20 to-teal-50/10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-white font-medium shadow-xl backdrop-blur-sm border border-white/20 mb-6">
                <Sparkles className="w-5 h-5" />
                {model.name}
              </div>
              <h1 className={cn("text-5xl md:text-7xl font-bold bg-gradient-to-r bg-clip-text text-transparent", model.color)}>
                AI-Powered Diagnosis
              </h1>
              <p className="mt-4 text-xl text-foreground/70 max-w-3xl mx-auto">
                Upload your medical image and get instant AI analysis with clinical-grade precision.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Upload Panel */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="glass-enhanced rounded-3xl p-8 shadow-3xl border border-white/20 backdrop-blur-xl">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Upload className="w-7 h-7 text-orange-500" />
                    Upload Image
                  </h2>

                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                      isDragging ? "border-orange-500 bg-orange-500/10 scale-105" : "border-white/30 hover:border-orange-400/50 hover:bg-white/5"
                    )}
                  >
                    <Upload className={cn("w-14 h-14 mx-auto mb-4", isDragging ? "text-orange-500" : "text-foreground/40")} />
                    <p className="text-lg font-medium">{isDragging ? "Drop here" : "Drag & drop or click"}</p>
                    <p className="text-sm text-foreground/60 mt-1">JPG, PNG • Max 50MB</p>
                    {selectedFile && (
                      <p className="mt-3 text-sm text-green-400 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {selectedFile.name}
                      </p>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="mt-6 relative rounded-2xl overflow-hidden border border-white/20">
                      <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain" />
                      {analysisResult?.yolo_detections && (
                        <YoloOverlay detections={analysisResult.yolo_detections} imageUrl={previewUrl} />
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !selectedFile}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl"
                    >
                      {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</> : "Analyze Now"}
                    </Button>
                    {selectedFile && (
                      <Button variant="outline" onClick={handleReset} size="lg" className="border-white/20 backdrop-blur-sm">
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                <div className="glass-enhanced p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
                  <div className="flex gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="font-semibold text-yellow-600 dark:text-yellow-400">Educational Use Only</p>
                      <p className="text-sm text-foreground/70">This AI tool is not a substitute for professional medical diagnosis.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Results Panel */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {isAnalyzing ? (
                  <div className="glass-enhanced p-16 rounded-3xl h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-orange-500" />
                      <h3 className="text-2xl font-bold">AI is Analyzing...</h3>
                      <p className="text-foreground/60 mt-2">Processing with YOLO & Deep Learning</p>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="glass-enhanced p-8 rounded-3xl shadow-3xl border border-white/20 backdrop-blur-xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Brain className="w-7 h-7 text-teal-500" />
                        Analysis Complete
                      </h2>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>

                    {/* Annotated Image */}
                    {analysisResult.annotated_image_url && (
                      <div>
                        <h3 className="font-semibold mb-3">Annotated Result</h3>
                        <div className="rounded-xl overflow-hidden border border-white/20">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || ''}${analysisResult.annotated_image_url}`}
                            alt="Annotated"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    )}

                    {/* YOLO Detections */}
                    {analysisResult.yolo_detections && (
                      <div>
                        <h3 className="font-semibold mb-3">YOLO Detections</h3>
                        <div className="space-y-3">
                          {analysisResult.yolo_detections.map((d, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="p-4 bg-white/5 rounded-xl border border-white/10"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-orange-400">{d.label}</span>
                                <span className="text-sm bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                                  {(d.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-xs text-foreground/60">
                                Box: [{d.box.map(Math.round).join(", ")}]
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interpretation */}
                    {(analysisResult.ai_analysis || analysisResult.interpretation) && (
                      <div>
                        <h3 className="font-semibold mb-3">Clinical Interpretation</h3>
                        <div className="p-5 bg-white/5 rounded-xl border border-white/10 text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">
                          {analysisResult.ai_analysis || analysisResult.interpretation}
                        </div>
                      </div>
                    )}

                    <Button onClick={handleDownloadReport} className="w-full" size="lg" variant="outline">
                      <Download className="w-5 h-5 mr-2" />
                      Download Report
                    </Button>
                  </div>
                ) : (
                  <div className="glass-enhanced p-16 rounded-3xl h-full flex items-center justify-center text-center">
                    <div>
                      <div className="text-6xl mb-6">Analysis</div>
                      <h3 className="text-2xl font-bold mb-2">Ready When You Are</h3>
                      <p className="text-foreground/60">Upload an image to begin</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes float3d {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-120vh) translateX(150px) rotate(720deg) scale(0.8); opacity: 0; }
        }
        .bubble-effect { animation: float3d 25s ease-in-out infinite alternate; }
        .glass-enhanced {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        .dark .glass-enhanced { background: rgba(15, 23, 42, 0.6); border-color: rgba(255, 255, 255, 0.05); }
      `}</style>
    </>
  );
}

// YOLO Bounding Box Overlay
const YoloOverlay = ({ detections, imageUrl }: { detections: YoloDetection[]; imageUrl: string }) => {
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImgDims({ width: img.width, height: img.height });
  }, [imageUrl]);

  if (!imgDims.width) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {detections.map((d, i) => {
        const [x1, y1, x2, y2] = d.box;
        const left = (x1 / imgDims.width) * 100;
        const top = (y1 / imgDims.height) * 100;
        const width = ((x2 - x1) / imgDims.width) * 100;
        const height = ((y2 - y1) / imgDims.height) * 100;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute border-2 border-orange-500 bg-orange-500/20 rounded-lg"
            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
          >
            <div className="absolute -top-8 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-bold">
              {d.label} {(d.confidence * 100).toFixed(0)}%
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
