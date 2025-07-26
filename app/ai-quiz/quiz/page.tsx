"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  Home,
  Zap,
  Target,
  Trophy,
  Star,
  Brain,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: string
  subject: string
}

interface QuizData {
  questions: QuizQuestion[]
  subject: string
  difficulty: string
  startTime: number
  metadata: {
    source: "ai" | "fallback"
    generatedAt: string
  }
}

export default function QuizPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const savedQuiz = sessionStorage.getItem("currentQuiz")
    if (!savedQuiz) {
      toast.error("No quiz data found. Please start a new quiz.")
      router.push("/ai-quiz")
      return
    }

    try {
      const parsedQuiz: QuizData = JSON.parse(savedQuiz)
      setQuizData(parsedQuiz)
      setAnswers(new Array(parsedQuiz.questions.length).fill(null))
    } catch (error) {
      toast.error("Invalid quiz data. Please start a new quiz.")
      router.push("/ai-quiz")
    }
  }, [router])

  useEffect(() => {
    if (!quizData) return

    const timer = setInterval(() => {
      setTimeElapsed(Date.now() - quizData.startTime)
    }, 1000)

    return () => clearInterval(timer)
  }, [quizData])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer first! 🤔")
      return
    }

    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = selectedAnswer
    setAnswers(newAnswers)

    const currentQuestion = quizData!.questions[currentQuestionIndex]
    // FIX: This is the critical fix - ensure we're comparing the right values
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    console.log("🔍 Answer validation:", {
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      question: currentQuestion.question,
      selectedOption: currentQuestion.options[selectedAnswer],
      correctOption: currentQuestion.options[currentQuestion.correctAnswer],
    })

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1)
      toast.success("🎉 Correct! Amazing work!")
    } else {
      toast.error("❌ Not quite right")
    }

    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      completeQuiz()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedAnswer(answers[currentQuestionIndex - 1])
      setShowExplanation(answers[currentQuestionIndex - 1] !== null)
    }
  }

  const completeQuiz = () => {
    const finalCorrectCount = answers.filter(
      (answer, index) => answer === quizData!.questions[index].correctAnswer,
    ).length

    const results = {
      subject: quizData!.subject,
      difficulty: quizData!.difficulty,
      questions: quizData!.questions,
      answers: answers.map((answer, index) => ({
        questionIndex: index,
        selectedAnswer: answer!,
        isCorrect: answer === quizData!.questions[index].correctAnswer,
        timeSpent: Math.floor(timeElapsed / quizData!.questions.length),
      })),
      completedAt: Date.now(),
      totalTime: timeElapsed,
    }

    sessionStorage.setItem("quizResults", JSON.stringify(results))
    toast.success(`🏆 Quiz Complete! You got ${finalCorrectCount}/${quizData!.questions.length} correct!`)

    setTimeout(() => {
      router.push("/ai-quiz/results")
    }, 1500)
  }

  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, string> = {
      Mathematics: "🧮",
      English: "📚",
      "Data Structures": "🏗️",
      Algorithms: "⚡",
      "Web Development": "🌐",
      "Machine Learning": "🤖",
      Science: "🔬",
      History: "🏛️",
      Geography: "🗺️",
    }
    return icons[subject] || "🎯"
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner: "from-green-500 to-emerald-500",
      intermediate: "from-blue-500 to-cyan-500",
      advanced: "from-purple-500 to-violet-500",
      expert: "from-red-500 to-pink-500",
      master: "from-yellow-500 to-orange-500",
    }
    return colors[difficulty.toLowerCase()] || "from-gray-500 to-slate-500"
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 text-violet-400 mx-auto mb-6 animate-bounce" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Preparing Your Quiz...
            </h2>
            <p className="text-slate-400 mb-6">Getting everything ready for an amazing experience!</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = quizData.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100
  const isCorrect = selectedAnswer !== null && selectedAnswer === currentQuestion.correctAnswer

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-pink-500/10 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between backdrop-blur-xl bg-slate-900/30 rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 hover:border-violet-400 bg-transparent hover:bg-violet-500/10 transition-all duration-300 hover:scale-105"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl">{getSubjectIcon(quizData.subject)}</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {quizData.subject}
              </h1>
            </div>
            <Badge
              className={`bg-gradient-to-r ${getDifficultyColor(quizData.difficulty)} text-white border-0 px-4 py-1 text-sm font-semibold shadow-lg`}
            >
              <Target className="h-3 w-3 mr-1" />
              {quizData.difficulty.charAt(0).toUpperCase() + quizData.difficulty.slice(1)} Level
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-600/50">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="font-mono text-blue-300 font-semibold">{formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-600/50">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300 font-semibold">
                {correctAnswersCount}/{quizData.questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Progress */}
        <Card className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-violet-400" />
                <span className="text-lg font-semibold text-white">
                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-300 font-semibold">{Math.round(progress)}% Complete</span>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Enhanced Question Card */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl text-white leading-relaxed flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {currentQuestionIndex + 1}
                </div>
                <span className="flex-1 mt-1">{currentQuestion.question}</span>
              </CardTitle>
              <div className="flex gap-2">
                {quizData.metadata.source === "ai" && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
                {quizData.metadata.source === "fallback" && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Curated
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Enhanced Answer Options */}
            <div className="grid gap-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrectAnswer = index === currentQuestion.correctAnswer
                const showResult = showExplanation
                const isWrongSelection = showResult && isSelected && !isCorrectAnswer

                let buttonClass =
                  "group w-full p-6 text-left border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] "
                let iconClass = ""

                if (showResult) {
                  if (isCorrectAnswer) {
                    buttonClass +=
                      "border-green-500 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 shadow-lg shadow-green-500/20"
                    iconClass = "border-green-500 bg-green-500/20 text-green-300"
                  } else if (isWrongSelection) {
                    buttonClass +=
                      "border-red-500 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 shadow-lg shadow-red-500/20"
                    iconClass = "border-red-500 bg-red-500/20 text-red-300"
                  } else {
                    buttonClass += "border-slate-600 bg-slate-800/30 text-slate-400"
                    iconClass = "border-slate-600 bg-slate-700/30 text-slate-400"
                  }
                } else if (isSelected) {
                  buttonClass +=
                    "border-violet-500 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 scale-[1.02] shadow-lg shadow-violet-500/20"
                  iconClass = "border-violet-500 bg-violet-500/20 text-violet-300"
                } else {
                  buttonClass +=
                    "border-slate-600 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-700/50 text-white hover:shadow-lg"
                  iconClass =
                    "border-slate-500 bg-slate-700/30 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-300"
                }

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    variant="outline"
                    className={buttonClass}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className={`relative w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 ${iconClass}`}
                      >
                        <span className="relative z-10">{String.fromCharCode(65 + index)}</span>
                      </div>
                      <span className="flex-1 text-lg leading-relaxed">{option}</span>
                      <div className="flex-shrink-0">
                        {showResult && isCorrectAnswer && (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        )}
                        {showResult && isWrongSelection && (
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>

            {/* Enhanced Explanation */}
            {showExplanation && (
              <Card
                className={`border-2 ${
                  isCorrect
                    ? "border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10 shadow-lg shadow-green-500/10"
                    : "border-red-500/50 bg-gradient-to-r from-red-500/10 to-pink-500/10 shadow-lg shadow-red-500/10"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCorrect ? "bg-green-500/20" : "bg-red-500/20"}`}
                    >
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-xl font-bold mb-3 ${isCorrect ? "text-green-300" : "text-red-300"}`}>
                        {isCorrect ? "🎉 Excellent! That's correct!" : "💡 Not quite, but great try!"}
                      </h4>
                      <p className="text-slate-300 text-lg leading-relaxed">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Action Buttons */}
            <div className="flex justify-between items-center pt-6">
              <Button
                onClick={handlePreviousQuestion}
                variant="outline"
                disabled={currentQuestionIndex === 0}
                className="border-slate-600 hover:border-slate-500 bg-transparent hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 px-6 py-3"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Previous
              </Button>

              {!showExplanation ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 px-8 py-3 text-lg font-semibold shadow-lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 px-8 py-3 text-lg font-semibold shadow-lg"
                >
                  {currentQuestionIndex === quizData.questions.length - 1 ? (
                    <>
                      <Trophy className="h-5 w-5 mr-2" />
                      Finish Quiz
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Question Navigation */}
        <Card className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Question Navigation</h3>
              <p className="text-slate-400 text-sm">Click any question to jump to it</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {quizData.questions.map((_, index) => {
                const isCurrentQuestion = index === currentQuestionIndex
                const isAnswered = answers[index] !== null
                const isCorrectAnswer = isAnswered && answers[index] === quizData.questions[index].correctAnswer

                let buttonClass = "w-12 h-12 rounded-xl font-bold transition-all duration-300 hover:scale-110 "

                if (isCurrentQuestion) {
                  buttonClass +=
                    "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30 scale-110"
                } else if (isAnswered) {
                  if (showExplanation && index < currentQuestionIndex) {
                    buttonClass += isCorrectAnswer
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30"
                  } else {
                    buttonClass += "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                  }
                } else {
                  buttonClass +=
                    "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-600/50 hover:text-slate-300"
                }

                return (
                  <Button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index)
                      setSelectedAnswer(answers[index])
                      setShowExplanation(answers[index] !== null)
                    }}
                    variant="outline"
                    className={buttonClass}
                  >
                    {index + 1}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
