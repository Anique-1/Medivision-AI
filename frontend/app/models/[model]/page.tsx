"use client"

import { useState, useRef, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Upload, Download, AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

interface YoloDetection {
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [x_min, y_min, x_max, y_max]
}

interface AnalysisResult {
  model_name?: string; // Optional, as yolo endpoint might not return it
  detections?: string[]; // Existing detections, if any
  segmentation_info?: Array<{
    class: string;
    confidence: number;
    area_percentage: number;
    area_pixels: number;
  }>;
  ai_analysis?: string; // Existing AI analysis
  annotated_image_url?: string; // Existing annotated image URL
  interpretation?: string; // For YOLO output
  yolo_detections?: YoloDetection[]; // For YOLO output
  timestamp?: string; // For YOLO output
}

// Map model keys to API endpoints
const MODEL_ENDPOINTS: Record<string, string> = {
  "bone_detection_model": "/bone-detection",
  "brain_tumor_segmentation_model": "/brain-tumor",
  "eye_conjunctiva_detection_model": "/eye-conjunctiva",
  "liver_disease_detection_model": "/liver-disease",
  "skin_disease_detection_model": "/skin-disease",
  "teeth_detection_model": "/teeth-detection",
  "bone_cancer_detection_model": "/api/yolo/detect", // New YOLO endpoint
}

export default function ModelPage({ params }: { params: Promise<{ model: string }> }) {
  const { model: modelKey } = use(params)
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const modelInfo: Record<string, any> = {
    "bone_detection_model": {
      name: "Bone Fracture Detection",
      description: "Advanced YOLO model for detecting and classifying bone fractures with clinical-grade accuracy",
      icon: "🦴",
      color: "from-orange-500 to-red-500",
      endpoint: "/bone-detection",
    },
    "brain_tumor_segmentation_model": {
      name: "Brain Tumor Segmentation",
      description: "Precise segmentation of brain tumors in MRI images with detailed boundary detection",
      icon: "🧠",
      color: "from-purple-500 to-pink-500",
      endpoint: "/brain-tumor",
    },
    "eye_conjunctiva_detection_model": {
      name: "Eye Conjunctiva Analysis",
      description: "Detailed analysis of conjunctival regions including forniceal, palpebral zones",
      icon: "👁️",
      color: "from-blue-500 to-cyan-500",
      endpoint: "/eye-conjunctiva",
    },
    "liver_disease_detection_model": {
      name: "Liver Disease Detection",
      description: "Detection of liver abnormalities and diseases using advanced imaging analysis",
      icon: "🫘",
      color: "from-green-500 to-emerald-500",
      endpoint: "/liver-disease",
    },
    "skin_disease_detection_model": {
      name: "Skin Disease Classification",
      description: "Classification of various skin conditions with detailed diagnostic information",
      icon: "🔬",
      color: "from-yellow-500 to-amber-500",
      endpoint: "/skin-disease",
    },
    "teeth_detection_model": {
      name: "Dental Analysis",
      description: "Comprehensive dental image analysis for oral health assessment",
      icon: "🦷",
      color: "from-indigo-500 to-violet-500",
      endpoint: "/teeth-detection",
    },
    "bone_cancer_detection_model": { // New entry for YOLO model
      name: "Bone Cancer Detection (YOLO)",
      description: "YOLO-based model for detecting potential bone cancer in medical images.",
      icon: "💀", // Using a skull icon for bone cancer
      color: "from-red-700 to-red-900",
      endpoint: "/api/yolo/detect",
    },
  }

  const model = modelInfo[modelKey] || {
    name: "Unknown Model",
    description: "This model is not recognized.",
    icon: "❓",
    color: "from-gray-500 to-gray-600",
    endpoint: null,
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file")
        toast({
          title: "Invalid File",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB")
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 50MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to analyze.",
        variant: "destructive",
      })
      return
    }

    // Check if model has a valid endpoint
    if (!model.endpoint) {
      toast({
        title: "Model Not Available",
        description: "This model is not currently available.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)
    setError(null)

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const endpoint = MODEL_ENDPOINTS[modelKey]
      const rawResult: any = await fetchWithAuth(endpoint, {
        method: "POST",
        body: formData,
      })

      let processedResult: AnalysisResult = {}

      if (modelKey === "bone_cancer_detection_model") {
        processedResult = {
          ai_analysis: rawResult.interpretation,
          yolo_detections: rawResult.yolo_detections,
          timestamp: rawResult.timestamp,
          // No annotated_image_url from this endpoint for now
        }
      } else {
        processedResult = rawResult as AnalysisResult
      }

      setAnalysisResult(processedResult)
      toast({
        title: "Analysis Complete!",
        description: "Your medical image has been analyzed successfully.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Analysis error:", error)
      const errorMessage = error.message || "Failed to analyze image. Please try again."
      setError(errorMessage)
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadReport = () => {
    if (analysisResult) {
      const reportContent = `
╔════════════════════════════════════════════════════════════════╗
║          MEDICAL IMAGE ANALYSIS REPORT                         ║
╚════════════════════════════════════════════════════════════════╝

Model: ${model.name}
Analysis Date: ${new Date().toLocaleString()}
Report Generated: ${new Date().toISOString()}

${analysisResult.detections && analysisResult.detections.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETECTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${analysisResult.detections.map((d, i) => `${i + 1}. ${d}`).join('\n')}
` : ''}

${analysisResult.yolo_detections && analysisResult.yolo_detections.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOLO DETECTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${analysisResult.yolo_detections.map((d, i) => `
${i + 1}. Label: ${d.label}
   - Confidence: ${(d.confidence * 100).toFixed(2)}%
   - Bounding Box: [${d.box.map(coord => coord.toFixed(0)).join(', ')}]
`).join('\n')}
` : ''}

${analysisResult.segmentation_info && analysisResult.segmentation_info.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENTATION INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${analysisResult.segmentation_info.map((info, i) => `
${i + 1}. ${info.class.toUpperCase()}
   - Confidence: ${(info.confidence * 100).toFixed(2)}%
   - Coverage Area: ${info.area_percentage.toFixed(2)}%
   - Area (pixels): ${info.area_pixels.toLocaleString()}
`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDICAL INTERPRETATION & RECOMMENDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysisResult.ai_analysis || analysisResult.interpretation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISCLAIMER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This analysis is generated by AI for educational purposes only.
Always consult with qualified healthcare professionals for medical
diagnosis and treatment decisions.

This report should not be used as a substitute for professional
medical advice, diagnosis, or treatment.
      `
      
      const blob = new Blob([reportContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${modelKey}_analysis_${new Date().toISOString().split('T')[0]}_${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Report Downloaded",
        description: "Your analysis report has been saved successfully.",
      })
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className={`text-6xl p-4 rounded-2xl bg-gradient-to-br ${model.color} bg-opacity-10`}>
                {model.icon}
              </div>
              <div className="flex-1">
                <h1 className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${model.color} bg-clip-text text-transparent`}>
                  {model.name}
                </h1>
                <p className="text-foreground/60 text-lg">{model.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="glass p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-bold mb-6">Upload Medical Image</h2>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                    isDragging 
                      ? "border-primary bg-primary/10 scale-105" 
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                    isDragging ? "text-primary" : "text-foreground/40"
                  }`} />
                  <p className="font-medium mb-2 text-lg">
                    {isDragging ? "Drop your image here" : "Drag and drop your image here"}
                  </p>
                  <p className="text-sm text-foreground/60 mb-4">or click to browse files</p>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-primary font-medium flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} />
                        Selected: {selectedFile.name}
                      </p>
                    </div>
                  )}
                </div>

                {previewUrl && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Image Preview</h3>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain bg-muted"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button 
                    className="flex-1" 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !selectedFile}
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Image"
                    )}
                  </Button>
                  {selectedFile && (
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      disabled={isAnalyzing}
                      size="lg"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                <p className="text-xs text-foreground/60 mt-4 text-center">
                  Supported formats: JPG, PNG, DICOM • Max size: 50MB
                </p>
              </div>

              {/* Info Box */}
              <div className="glass p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">Important Notice</p>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      This AI analysis tool is designed for educational and research purposes only. 
                      It should not be used as a substitute for professional medical advice, diagnosis, 
                      or treatment. Always consult with qualified healthcare professionals for medical decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div>
              {isAnalyzing ? (
                <div className="glass p-12 rounded-2xl border border-border h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Analyzing Image</h3>
                    <p className="text-foreground/60">
                      Our AI is processing your medical image. This may take a few moments...
                    </p>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="glass p-8 rounded-2xl border border-border space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Analysis Results</h2>
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 size={20} />
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  </div>

                  {/* Annotated Image */}
                  {analysisResult.annotated_image_url && (
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Annotated Image</h3>
                      <div className="relative w-full rounded-xl overflow-hidden border border-border bg-muted">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${analysisResult.annotated_image_url}`}
                          alt="Annotated Result"
                          className="w-full h-auto object-contain"
                          onError={(e) => {
                            console.error("Image failed to load")
                            e.currentTarget.src = previewUrl || ""
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Detections (existing models) */}
                  {analysisResult.detections && analysisResult.detections.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Detections</h3>
                      <div className="space-y-2">
                        {analysisResult.detections.map((detection, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border"
                          >
                            <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                            <span className="font-medium">{detection}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* YOLO Detections (new) */}
                  {analysisResult.yolo_detections && analysisResult.yolo_detections.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">YOLO Detections</h3>
                      <div className="space-y-3">
                        {analysisResult.yolo_detections.map((detection, idx) => (
                          <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-primary">{detection.label}</span>
                              <span className="text-sm px-2 py-1 bg-primary/10 rounded">
                                {(detection.confidence * 100).toFixed(1)}% confident
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-foreground/70">
                                Bounding Box: <span className="font-medium text-foreground">[{detection.box.map(coord => coord.toFixed(0)).join(', ')}]</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Segmentation Information */}
                  {analysisResult.segmentation_info && analysisResult.segmentation_info.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Segmentation Details</h3>
                      <div className="space-y-3">
                        {analysisResult.segmentation_info.map((info, idx) => (
                          <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-primary">{info.class}</span>
                              <span className="text-sm px-2 py-1 bg-primary/10 rounded">
                                {(info.confidence * 100).toFixed(1)}% confident
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-foreground/70">
                                Coverage: <span className="font-medium text-foreground">{info.area_percentage.toFixed(2)}%</span>
                              </p>
                              <p className="text-foreground/70">
                                Area: <span className="font-medium text-foreground">{info.area_pixels.toLocaleString()} pixels</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Medical Analysis */}
                  {(analysisResult.ai_analysis || analysisResult.interpretation) && (
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Medical Interpretation & Recommendations</h3>
                      <div className="p-6 bg-muted/50 rounded-lg border border-border">
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap"
                        >
                          {analysisResult.ai_analysis || analysisResult.interpretation}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <Button 
                    className="w-full gap-2" 
                    onClick={handleDownloadReport}
                    size="lg"
                    variant="outline"
                  >
                    <Download size={20} />
                    Download Full Report
                  </Button>
                </div>
              ) : (
                <div className="glass p-12 rounded-2xl border border-dashed border-border h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-6">📊</div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
                    <p className="text-foreground/60">
                      Upload a medical image to see detailed analysis results
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
