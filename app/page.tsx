"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ThemeProvider, useTheme } from "@/components/theme-provider"
import { HeroSection } from "@/components/hero-section"
import {
  Camera,
  FileText,
  MessageCircle,
  Download,
  Sparkles,
  Shield,
  Clock,
  Moon,
  Sun,
  Leaf,
  ShoppingBag,
  AlertTriangle,
  Heart,
  Stethoscope,
  Palette,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AnalysisResult {
  diagnosis: string
  cause: string
  treatment: string[]
  prevention: string[]
  medicines: string[]
  naturalRemedies: string[]
  products: string[]
}

interface SkincareResult {
  skinAnalysis: string
  morningRoutine: string[]
  eveningRoutine: string[]
  productRecommendations: string[]
  dietTips: string[]
  lifestyleTips: string[]
}

interface ChatMessage {
  id: string
  message: string
  timestamp: Date
  isUser: boolean
}

type Mode = "diagnosis" | "skincare"

const SKINCARE_GOALS = [
  { id: "tan", label: "Remove Tan" },
  { id: "brighten", label: "Brighten Skin Tone" },
  { id: "blackheads", label: "Reduce Blackheads" },
  { id: "acne-marks", label: "Clear Acne Marks" },
  { id: "pores", label: "Shrink Pores" },
  { id: "oil-control", label: "Control Oiliness" },
  { id: "hydration", label: "Hydration" },
  { id: "anti-aging", label: "Anti-Aging" },
]

const SKIN_TYPES = [
  { id: "oily", label: "Oily" },
  { id: "dry", label: "Dry" },
  { id: "combination", label: "Combination" },
  { id: "sensitive", label: "Sensitive" },
]

function ClearCueApp() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [step, setStep] = useState(0) // 0 = hero, 1 = mode selection, 2 = upload, 3 = description/skincare form, 4 = results
  const [images, setImages] = useState<File[]>([])

  // Diagnosis mode states
  const [description, setDescription] = useState({
    appearance: "",
    issue: "",
    started: "",
    symptoms: "",
    triggers: "",
    skinType: "",
  })
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

  // Skincare mode states
  const [skincareForm, setSkincareForm] = useState({
    skinType: "",
    goals: [] as string[],
    customGoal: "",
  })
  const [skincareResult, setSkincareResult] = useState<SkincareResult | null>(null)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxImages = mode === "skincare" ? 1 : 4
    if (images.length + files.length <= maxImages) {
      setImages((prev) => [...prev, ...files])
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGoalChange = (goalId: string, checked: boolean) => {
    setSkincareForm((prev) => ({
      ...prev,
      goals: checked ? [...prev.goals, goalId] : prev.goals.filter((g) => g !== goalId),
    }))
  }

  const handleDiagnosisAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append(`image${index}`, image)
      })
      formData.append("description", JSON.stringify(description))
      formData.append("mode", "diagnosis")

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      if (result.error) throw new Error(result.error)

      setAnalysis(result)
      setStep(4)
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Analysis failed. Please try again or contact support.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSkincareAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      if (images.length > 0) {
        formData.append("image0", images[0])
      }
      formData.append("skincareForm", JSON.stringify(skincareForm))
      formData.append("mode", "skincare")

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      if (result.error) throw new Error(result.error)

      setSkincareResult(result)
      setStep(4)
    } catch (error) {
      console.error("Skincare analysis failed:", error)
      alert("Skincare analysis failed. Please try again or contact support.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addChatMessage = () => {
    if (!newMessage.trim()) return
    const message: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      timestamp: new Date(),
      isUser: true,
    }
    setChatMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const downloadPDF = async () => {
    const data = mode === "diagnosis" ? { analysis, description } : { skincareResult, skincareForm }
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, mode }),
    })

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = mode === "diagnosis" ? "clearcue-diagnosis.pdf" : "clearcue-skincare-plan.pdf"
    a.click()
  }

  const resetApp = () => {
    setMode(null)
    setStep(0)
    setImages([])
    setDescription({
      appearance: "",
      issue: "",
      started: "",
      symptoms: "",
      triggers: "",
      skinType: "",
    })
    setSkincareForm({
      skinType: "",
      goals: [],
      customGoal: "",
    })
    setAnalysis(null)
    setSkincareResult(null)
    setChatMessages([])
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-500" />

        {/* Floating Orbs - Smaller for better fit */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-full blur-2xl"
          animate={{ x: [0, 50, 0], y: [0, -25, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-20 right-16 w-24 h-24 bg-gradient-to-r from-purple-200/20 to-pink-200/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-2xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Compact Header */}
      <header className="border-b border-indigo-100/50 dark:border-indigo-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img src="/logo.png" alt="ClearCue Logo" className="w-8 h-8 rounded-full shadow-lg" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                ClearCue
              </h1>
            </motion.div>

            <div className="flex items-center space-x-4">
              {step > 1 && (
                <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-1 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span>Instant</span>
                  </div>
                </div>
              )}
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="rounded-full p-1.5 border border-slate-200 dark:border-slate-700 bg-transparent"
              >
                {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Compact Progress Indicator */}
        {step > 1 && (
          <div className="py-4">
            <div className="flex items-center justify-center space-x-4">
              {[2, 3, 4].map((num) => (
                <div key={num} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                      step >= num
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                        : "bg-white/70 dark:bg-slate-800/70 text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {num - 1}
                  </div>
                  {num < 4 && (
                    <div
                      className={`w-12 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                        step > num ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-2">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                {step === 2 && `📸 Upload ${mode === "skincare" ? "face image" : "skin images"}`}
                {step === 3 && `📝 ${mode === "diagnosis" ? "Describe your concern" : "Set your skincare goals"}`}
                {step === 4 && `🔍 Review your ${mode === "diagnosis" ? "diagnosis" : "skincare plan"}`}
              </p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Hero Section */}
          {step === 0 && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <HeroSection onGetStarted={() => setStep(1)} />
            </motion.div>
          )}

          {/* Mode Selection */}
          {step === 1 && (
            <motion.div
              key="mode-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Choose Your Service</h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg">Select the type of consultation you need</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMode("diagnosis")
                    setStep(2)
                  }}
                  className="cursor-pointer"
                >
                  <Card className="border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Stethoscope className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-3">Skin Issue Diagnosis</h3>
                      <p className="text-red-700 dark:text-red-200 mb-4 leading-relaxed">
                        Get professional diagnosis for skin problems, acne, rashes, or any concerning skin conditions
                      </p>
                      <div className="space-y-2 text-sm text-red-600 dark:text-red-300">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Upload problem images</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Get diagnosis & treatment</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Medicine recommendations</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMode("skincare")
                    setStep(2)
                  }}
                  className="cursor-pointer"
                >
                  <Card className="border-2 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Palette className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">Skincare Routine</h3>
                      <p className="text-purple-700 dark:text-purple-200 mb-4 leading-relaxed">
                        Get personalized skincare routine recommendations based on your skin type and goals
                      </p>
                      <div className="space-y-2 text-sm text-purple-600 dark:text-purple-300">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Personalized AM/PM routine</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Product recommendations</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Diet & lifestyle tips</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setStep(0)}
                  variant="outline"
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-full"
                >
                  ← Back to Home
                </Button>
              </div>
            </motion.div>
          )}

          {/* Image Upload Step */}
          {step === 2 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-6"
            >
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl">
                <CardHeader className="text-center pb-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-t-2xl">
                  <CardTitle className="text-2xl font-light text-slate-800 dark:text-slate-100 mb-2">
                    {mode === "diagnosis" ? "Upload Skin Images" : "Upload Face Image (Optional)"}
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-300">
                    {mode === "diagnosis"
                      ? "Upload 1-4 clear photos of your skin concern for accurate diagnosis"
                      : "Upload a clear face photo for more personalized skincare recommendations"}
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div
                    className={`grid gap-4 max-w-3xl mx-auto ${mode === "diagnosis" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}
                  >
                    {images.map((image, index) => (
                      <motion.div
                        key={index}
                        className="relative group"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="relative overflow-hidden rounded-xl shadow-lg">
                          <img
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`${mode === "diagnosis" ? "Skin" : "Face"} image ${index + 1}`}
                            className={`w-full object-cover ${mode === "diagnosis" ? "h-32" : "h-48"}`}
                          />
                        </div>
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}

                    {/* Add Image Button */}
                    {(mode === "diagnosis" ? images.length < 4 : images.length < 1) && (
                      <motion.div
                        className={mode === "skincare" && images.length === 0 ? "flex justify-center" : ""}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label
                          className={`${mode === "skincare" && images.length === 0 ? "w-64" : "w-full"} ${mode === "diagnosis" ? "h-32" : "h-48"} border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300`}
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mb-2">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Add Image</span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                              {mode === "diagnosis" ? `${4 - images.length} more allowed` : "Optional but recommended"}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple={mode === "diagnosis"}
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-4 mt-6">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-full"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={mode === "diagnosis" && images.length === 0}
                      className="px-8 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full shadow-lg transition-all duration-300"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Form Step */}
          {step === 3 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-6"
            >
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl">
                <CardHeader className="text-center pb-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-t-2xl">
                  <CardTitle className="text-2xl font-light text-slate-800 dark:text-slate-100 mb-2">
                    {mode === "diagnosis" ? "Describe Your Skin Concern" : "Set Your Skincare Goals"}
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-300">
                    {mode === "diagnosis"
                      ? "Provide details about your skin issue for accurate diagnosis"
                      : "Tell us about your skin type and what you want to achieve"}
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {mode === "diagnosis" ? (
                    // Diagnosis Form
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      {[
                        {
                          id: "issue",
                          label: "Main concern",
                          placeholder: "Acne, rash, dry patches, discoloration...",
                          key: "issue",
                        },
                        {
                          id: "appearance",
                          label: "How does it look?",
                          placeholder: "Color, size, texture, changes...",
                          key: "appearance",
                        },
                        {
                          id: "started",
                          label: "When did it start?",
                          placeholder: "Timeline, triggers, onset...",
                          key: "started",
                        },
                        {
                          id: "symptoms",
                          label: "Any discomfort?",
                          placeholder: "Pain, itching, burning...",
                          key: "symptoms",
                        },
                        {
                          id: "triggers",
                          label: "What affects it?",
                          placeholder: "Weather, products, stress...",
                          key: "triggers",
                        },
                        {
                          id: "skinType",
                          label: "Skin type",
                          placeholder: "Oily, dry, combination, sensitive...",
                          key: "skinType",
                          isInput: true,
                        },
                      ].map((field, index) => (
                        <motion.div
                          key={field.id}
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Label htmlFor={field.id} className="text-slate-700 dark:text-slate-300 font-medium">
                            {field.label}
                          </Label>
                          {field.isInput ? (
                            <Input
                              id={field.id}
                              placeholder={field.placeholder}
                              value={description[field.key as keyof typeof description]}
                              onChange={(e) => setDescription((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white/50 dark:bg-slate-800/50"
                            />
                          ) : (
                            <Textarea
                              id={field.id}
                              placeholder={field.placeholder}
                              value={description[field.key as keyof typeof description]}
                              onChange={(e) => setDescription((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 min-h-[80px] resize-none bg-white/50 dark:bg-slate-800/50"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    // Skincare Form
                    <div className="max-w-3xl mx-auto space-y-6">
                      {/* Skin Type Selection */}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-300 font-medium text-base">
                          What's your skin type? *
                        </Label>
                        <RadioGroup
                          value={skincareForm.skinType}
                          onValueChange={(value) => setSkincareForm((prev) => ({ ...prev, skinType: value }))}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          {SKIN_TYPES.map((type) => (
                            <div key={type.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={type.id} id={type.id} />
                              <Label htmlFor={type.id} className="text-sm">
                                {type.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </motion.div>

                      {/* Goals Selection */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3"
                      >
                        <Label className="text-slate-700 dark:text-slate-300 font-medium text-base">
                          What are your skincare goals? (Select all that apply)
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {SKINCARE_GOALS.map((goal) => (
                            <div key={goal.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={goal.id}
                                checked={skincareForm.goals.includes(goal.id)}
                                onCheckedChange={(checked) => handleGoalChange(goal.id, checked as boolean)}
                              />
                              <Label htmlFor={goal.id} className="text-sm">
                                {goal.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Custom Goal */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="customGoal" className="text-slate-700 dark:text-slate-300 font-medium">
                          Other specific goals or concerns?
                        </Label>
                        <Textarea
                          id="customGoal"
                          placeholder="Describe any other skincare goals or specific concerns..."
                          value={skincareForm.customGoal}
                          onChange={(e) => setSkincareForm((prev) => ({ ...prev, customGoal: e.target.value }))}
                          className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 min-h-[80px] resize-none bg-white/50 dark:bg-slate-800/50"
                        />
                      </motion.div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4 mt-8">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-full"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={mode === "diagnosis" ? handleDiagnosisAnalysis : handleSkincareAnalysis}
                      disabled={isAnalyzing || (mode === "skincare" && !skincareForm.skinType)}
                      className="px-8 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full shadow-lg transition-all duration-300"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <>Get My {mode === "diagnosis" ? "Diagnosis" : "Skincare Plan"} ✨</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Step */}
          {step === 4 && (analysis || skincareResult) && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-6 space-y-6 pb-16"
            >
              {mode === "diagnosis" && analysis ? (
                // Diagnosis Results
                <>
                  <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="text-center pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-t-2xl">
                      <CardTitle className="text-2xl font-light text-slate-800 dark:text-slate-100 flex items-center justify-center space-x-3">
                        <Sparkles className="w-6 h-6 text-emerald-500" />
                        <span>Your Diagnosis Report</span>
                      </CardTitle>
                      <Button
                        onClick={downloadPDF}
                        className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-6 py-2 shadow-lg"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Medical Disclaimer */}
                      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl mb-6">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-1">
                                Medical Disclaimer
                              </h3>
                              <p className="text-amber-700 dark:text-amber-200 text-xs leading-relaxed">
                                This AI analysis is for informational purposes only. Please consult a dermatologist for
                                serious conditions.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-blue-800 dark:text-blue-300 flex items-center space-x-2">
                              <FileText className="w-5 h-5" />
                              <span>Diagnosis</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">
                              {analysis.diagnosis}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                              <Sparkles className="w-5 h-5" />
                              <span>Possible Cause</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-amber-700 dark:text-amber-200 text-sm leading-relaxed">
                              {analysis.cause}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Treatment Plan */}
                      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl mb-6">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-emerald-800 dark:text-emerald-300">
                            Treatment Plan
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analysis.treatment.map((step, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg"
                              >
                                <span className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </span>
                                <span className="text-emerald-700 dark:text-emerald-200 text-sm leading-relaxed">
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Prevention */}
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-xl">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-purple-800 dark:text-purple-300">Prevention</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {analysis.prevention.map((tip, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-1.5 flex-shrink-0" />
                                  <span className="text-purple-700 dark:text-purple-200 text-xs leading-relaxed">
                                    {tip}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Medicines */}
                        <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-200 dark:border-rose-700 rounded-xl">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-rose-800 dark:text-rose-300">Medicines</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {analysis.medicines.map((medicine, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-rose-400 to-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                  <span className="text-rose-700 dark:text-rose-200 text-xs leading-relaxed">
                                    {medicine}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Natural Remedies */}
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-green-800 dark:text-green-300 flex items-center space-x-1">
                              <Leaf className="w-4 h-4" />
                              <span>Natural Remedies</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {analysis.naturalRemedies.map((remedy, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                                  <span className="text-green-700 dark:text-green-200 text-xs leading-relaxed">
                                    {remedy}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Products */}
                      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-700 rounded-xl mt-4">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-cyan-800 dark:text-cyan-300 flex items-center space-x-2">
                            <ShoppingBag className="w-5 h-5" />
                            <span>Recommended Products</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analysis.products.map((product, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg"
                              >
                                <span className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="text-cyan-700 dark:text-cyan-200 text-sm leading-relaxed">
                                  {product}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </>
              ) : skincareResult ? (
                // Skincare Results
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="text-center pb-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-t-2xl">
                    <CardTitle className="text-2xl font-light text-slate-800 dark:text-slate-100 flex items-center justify-center space-x-3">
                      <Palette className="w-6 h-6 text-purple-500" />
                      <span>Your Skincare Plan</span>
                    </CardTitle>
                    <Button
                      onClick={downloadPDF}
                      className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 py-2 shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Skincare Plan
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Skin Analysis */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl mb-6">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-blue-800 dark:text-blue-300">Skin Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">
                          {skincareResult.skinAnalysis}
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Morning Routine */}
                      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-yellow-800 dark:text-yellow-300">
                            ☀️ Morning Routine
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {skincareResult.morningRoutine.map((step, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg"
                              >
                                <span className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </span>
                                <span className="text-yellow-700 dark:text-yellow-200 text-sm leading-relaxed">
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Evening Routine */}
                      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-indigo-800 dark:text-indigo-300">
                            🌙 Evening Routine
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {skincareResult.eveningRoutine.map((step, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg"
                              >
                                <span className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </span>
                                <span className="text-indigo-700 dark:text-indigo-200 text-sm leading-relaxed">
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Product Recommendations */}
                      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
                            <ShoppingBag className="w-4 h-4" />
                            <span>Products</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {skincareResult.productRecommendations.map((product, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="text-emerald-700 dark:text-emerald-200 text-xs leading-relaxed">
                                  {product}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Diet Tips */}
                      <Card className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-900/20 dark:to-lime-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-green-800 dark:text-green-300">🥗 Diet Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {skincareResult.dietTips.map((tip, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-lime-400 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="text-green-700 dark:text-green-200 text-xs leading-relaxed">
                                  {tip}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Lifestyle Tips */}
                      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-700 rounded-xl">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-pink-800 dark:text-pink-300">💆‍♀️ Lifestyle</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {skincareResult.lifestyleTips.map((tip, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="text-pink-700 dark:text-pink-200 text-xs leading-relaxed">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Chat Section */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/30 dark:to-gray-800/30 rounded-t-2xl">
                  <CardTitle className="text-xl font-light text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    <span>Follow-up Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="max-h-60 overflow-y-auto space-y-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/30 dark:to-gray-800/30 rounded-xl mb-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">Ask any follow-up questions!</p>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs px-4 py-2 rounded-xl shadow-sm ${
                              message.isUser
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Input
                      placeholder="Ask a question..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addChatMessage()}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white/50 dark:bg-slate-800/50"
                    />
                    <Button
                      onClick={addChatMessage}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg"
                    >
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center pt-6">
                <Button
                  onClick={resetApp}
                  variant="outline"
                  className="px-8 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full bg-transparent"
                >
                  🔄 Start New Consultation
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Credit */}
      <motion.div
        className="fixed bottom-3 right-3 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full px-3 py-1.5 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-2.5 h-2.5 text-red-500 fill-current" />
            <span>by Enigma's</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function ClearCue() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="clearcue-theme">
      <ClearCueApp />
    </ThemeProvider>
  )
}
