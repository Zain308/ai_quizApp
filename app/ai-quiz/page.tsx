"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Sparkles,
  Target,
  Users,
  Trophy,
  Zap,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Award,
  Timer,
  CheckCircle,
} from "lucide-react"
import { SubjectSelector } from "@/components/subject-selector"
import { DifficultySelector } from "@/components/difficulty-selector"
import { toast } from "sonner"

export default function AIQuizPage() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<"subject" | "difficulty" | "generating">("subject")
  const router = useRouter()

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject)
    setCurrentStep("difficulty")
    toast.success(`📚 ${subject} selected! Now choose your difficulty level.`)
  }

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    toast.success(`🎯 ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty selected!`)
  }

  const generateQuiz = async () => {
    if (!selectedSubject || !selectedDifficulty) {
      toast.error("Please select both subject and difficulty! 🤔")
      return
    }

    setIsGenerating(true)
    setCurrentStep("generating")

    try {
      toast.loading("🧠 AI is crafting your personalized quiz...", { id: "generating" })

      const response = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: selectedSubject,
          difficulty: selectedDifficulty,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quizData = await response.json()

      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error("No questions received from the API")
      }

      // Add metadata and timestamp
      const enhancedQuizData = {
        ...quizData,
        startTime: Date.now(),
        metadata: {
          source: quizData.metadata?.source || "ai",
          generatedAt: new Date().toISOString(),
        },
      }

      // Store quiz data in session storage
      sessionStorage.setItem("currentQuiz", JSON.stringify(enhancedQuizData))

      toast.dismiss("generating")
      toast.success("🎉 Your personalized quiz is ready! Let's begin!")

      // Navigate to quiz page
      setTimeout(() => {
        router.push("/ai-quiz/quiz")
      }, 1000)
    } catch (error) {
      console.error("Quiz generation error:", error)
      toast.dismiss("generating")
      toast.error("Failed to generate quiz. Please try again! 😔")
      setCurrentStep("difficulty")
    } finally {
      setIsGenerating(false)
    }
  }

  const resetSelection = () => {
    setSelectedSubject("")
    setSelectedDifficulty("")
    setCurrentStep("subject")
    toast.info("🔄 Selection reset. Choose your subject again!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-56 h-56 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 blur-3xl rounded-full"></div>
              <div className="relative flex items-center justify-center gap-4">
                <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl shadow-2xl animate-bounce">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    AI Quiz Master
                  </h1>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-400 animate-pulse" />
                    <p className="text-xl text-slate-300">Powered by Advanced AI</p>
                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8">
              Experience personalized learning with AI-generated quizzes tailored to your knowledge level and interests
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              {[
                { icon: Target, label: "Adaptive Difficulty", color: "text-green-400" },
                { icon: Sparkles, label: "AI Generated", color: "text-blue-400" },
                { icon: Trophy, label: "Progress Tracking", color: "text-yellow-400" },
                { icon: Timer, label: "Timed Challenges", color: "text-purple-400" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group p-4 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105"
                >
                  <feature.icon
                    className={`h-8 w-8 ${feature.color} mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`}
                  />
                  <p className="text-slate-300 font-semibold text-sm">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              {/* Step 1: Subject */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep === "subject"
                      ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white scale-110 shadow-lg shadow-violet-500/30"
                      : selectedSubject
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {selectedSubject ? <CheckCircle className="h-6 w-6" /> : "1"}
                </div>
                <span
                  className={`font-semibold transition-colors duration-300 ${
                    currentStep === "subject"
                      ? "text-violet-400"
                      : selectedSubject
                        ? "text-green-400"
                        : "text-slate-400"
                  }`}
                >
                  Choose Subject
                </span>
              </div>

              {/* Arrow */}
              <ArrowRight
                className={`h-6 w-6 transition-colors duration-300 ${
                  selectedSubject ? "text-slate-400" : "text-slate-600"
                }`}
              />

              {/* Step 2: Difficulty */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep === "difficulty"
                      ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white scale-110 shadow-lg shadow-violet-500/30"
                      : selectedDifficulty
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {selectedDifficulty ? <CheckCircle className="h-6 w-6" /> : "2"}
                </div>
                <span
                  className={`font-semibold transition-colors duration-300 ${
                    currentStep === "difficulty"
                      ? "text-violet-400"
                      : selectedDifficulty
                        ? "text-green-400"
                        : "text-slate-400"
                  }`}
                >
                  Select Difficulty
                </span>
              </div>

              {/* Arrow */}
              <ArrowRight
                className={`h-6 w-6 transition-colors duration-300 ${
                  selectedDifficulty ? "text-slate-400" : "text-slate-600"
                }`}
              />

              {/* Step 3: Generate */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep === "generating"
                      ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white scale-110 shadow-lg shadow-violet-500/30 animate-pulse"
                      : selectedSubject && selectedDifficulty
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {currentStep === "generating" ? <Sparkles className="h-6 w-6 animate-spin" /> : "3"}
                </div>
                <span
                  className={`font-semibold transition-colors duration-300 ${
                    currentStep === "generating"
                      ? "text-violet-400"
                      : selectedSubject && selectedDifficulty
                        ? "text-blue-400"
                        : "text-slate-400"
                  }`}
                >
                  Generate Quiz
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Subject Selection */}
            {currentStep === "subject" && (
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
                    <BookOpen className="h-8 w-8 text-violet-400" />
                    Choose Your Subject
                  </CardTitle>
                  <p className="text-slate-400 text-lg">Select the topic you want to master</p>
                </CardHeader>
                <CardContent>
                  <SubjectSelector selectedSubject={selectedSubject} onSubjectSelect={handleSubjectSelect} />
                </CardContent>
              </Card>
            )}

            {/* Difficulty Selection */}
            {currentStep === "difficulty" && (
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={resetSelection}
                      variant="outline"
                      className="border-slate-600 hover:border-violet-400 bg-transparent hover:bg-violet-500/10 transition-all duration-300"
                    >
                      ← Back to Subjects
                    </Button>
                    <div className="text-center">
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
                        <Target className="h-8 w-8 text-violet-400" />
                        Select Difficulty
                      </CardTitle>
                      <p className="text-slate-400 text-lg">
                        Subject: <span className="text-violet-400 font-semibold">{selectedSubject}</span>
                      </p>
                    </div>
                    <div className="w-32"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DifficultySelector
                    selectedDifficulty={selectedDifficulty}
                    onDifficultyChange={handleDifficultySelect}
                  />
                </CardContent>
              </Card>
            )}

            {/* Generate Quiz Button */}
            {selectedSubject && selectedDifficulty && currentStep === "difficulty" && (
              <div className="text-center">
                <Button
                  onClick={generateQuiz}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-6 w-6 mr-3 animate-spin" />
                      Generating Your Quiz...
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6 mr-3" />
                      Generate AI Quiz
                    </>
                  )}
                </Button>
                <p className="text-slate-400 mt-4 text-lg">
                  Ready to test your knowledge in{" "}
                  <span className="text-violet-400 font-semibold">{selectedSubject}</span> at{" "}
                  <span className="text-purple-400 font-semibold">
                    {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                  </span>{" "}
                  level!
                </p>
              </div>
            )}

            {/* Generating State */}
            {currentStep === "generating" && (
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-12 text-center">
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Brain className="h-12 w-12 text-white animate-bounce" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-xl animate-ping"></div>
                    </div>

                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-4">
                        AI is Crafting Your Quiz
                      </h3>
                      <p className="text-slate-400 text-lg mb-6">
                        Creating personalized questions for{" "}
                        <span className="text-violet-400 font-semibold">{selectedSubject}</span> at{" "}
                        <span className="text-purple-400 font-semibold">
                          {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                        </span>{" "}
                        level
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-violet-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>

                    <div className="max-w-md mx-auto">
                      <Progress value={75} className="h-2" />
                      <p className="text-slate-500 text-sm mt-2">Analyzing difficulty patterns...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Footer */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, label: "Active Learners", value: "10,000+", color: "text-blue-400" },
              { icon: Award, label: "Quizzes Generated", value: "50,000+", color: "text-green-400" },
              { icon: TrendingUp, label: "Success Rate", value: "94%", color: "text-purple-400" },
            ].map((stat, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-slate-700/30 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
