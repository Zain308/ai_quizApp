"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Trophy, Target, Brain, Star, ArrowRight, RotateCcw } from "lucide-react"

interface Question {
  id: string
  category: string
  question: string
  options: string[]
  correct_answer: number
  difficulty: "beginner" | "intermediate" | "advanced"
  explanation: string
  points: number
}

interface QuizResult {
  questionId: string
  question: string
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  explanation: string
  points: number
}

interface QuizSummary {
  correctAnswers: number
  totalQuestions: number
  accuracy: number
  totalPoints: number
  timeBonus: number
  finalScore: number
  timeSpent: number
  grade: string
}

export default function QuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get("category")

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [totalTime, setTotalTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<QuizResult[]>([])
  const [summary, setSummary] = useState<QuizSummary | null>(null)
  const [quizStartTime, setQuizStartTime] = useState<number>(0)

  // Fetch questions
  useEffect(() => {
    if (!category) {
      router.push("/dashboard")
      return
    }

    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/quiz?category=${category}&count=10`)
        const data = await response.json()

        if (data.questions) {
          setQuestions(data.questions)
          setQuizStartTime(Date.now())
        } else {
          throw new Error("No questions found")
        }
      } catch (error) {
        console.error("Error fetching questions:", error)
        alert("Error loading quiz. Please try again.")
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [category, router])

  // Timer effect
  useEffect(() => {
    if (isLoading || showResults) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion()
          return 30
        }
        return prev - 1
      })
      setTotalTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex, isLoading, showResults])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = useCallback(() => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = selectedAnswer ?? -1
    setUserAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setTimeLeft(30)
    } else {
      submitQuiz(newAnswers)
    }
  }, [currentQuestionIndex, questions.length, selectedAnswer, userAnswers])

  const submitQuiz = async (answers: number[]) => {
    try {
      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000)

      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          category,
          timeSpent,
        }),
      })

      const data = await response.json()
      setResults(data.results)
      setSummary(data.summary)
      setShowResults(true)
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("Error submitting quiz. Please try again.")
    }
  }

  const getTimeColor = () => {
    if (timeLeft > 20) return "text-green-400"
    if (timeLeft > 10) return "text-yellow-400"
    return "text-red-400"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-400"
      case "B":
        return "text-blue-400"
      case "C":
        return "text-yellow-400"
      case "D":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
            <h2 className="text-2xl font-bold text-white">Loading Quiz...</h2>
            <p className="text-purple-200">Preparing your personalized questions</p>
          </div>
        </Card>
      </div>
    )
  }

  if (showResults && results && summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Results Header */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2">Quiz Complete!</CardTitle>
              <div className="flex items-center justify-center gap-4 text-lg">
                <Badge className={`${getGradeColor(summary.grade)} bg-white/20 text-2xl px-4 py-2`}>
                  Grade: {summary.grade}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 text-xl px-4 py-2">
                  {summary.accuracy}% Accuracy
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-400">{summary.correctAnswers}</div>
                  <div className="text-sm text-purple-200">Correct</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-400">{summary.finalScore}</div>
                  <div className="text-sm text-purple-200">Final Score</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-yellow-400">{summary.timeBonus}</div>
                  <div className="text-sm text-purple-200">Time Bonus</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.floor(summary.timeSpent / 60)}:{(summary.timeSpent % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm text-purple-200">Time Taken</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <div className="space-y-4 mb-6">
            {results.map((result, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          result.isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                        }`}
                      >
                        {result.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <span className="text-white font-semibold">Question {index + 1}</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400">+{result.points} XP</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white text-lg">{result.question}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-sm text-purple-200">Your Answer:</p>
                      <div
                        className={`p-3 rounded-lg border ${
                          result.isCorrect ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"
                        }`}
                      >
                        <p className="text-white">
                          {questions[index]?.options[result.userAnswer] || "No answer selected"}
                        </p>
                      </div>
                    </div>

                    {!result.isCorrect && (
                      <div className="space-y-2">
                        <p className="text-sm text-purple-200">Correct Answer:</p>
                        <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                          <p className="text-white">{questions[index]?.options[result.correctAnswer]}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm text-blue-200 mb-1">Explanation:</p>
                    <p className="text-white">{result.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Quiz Header */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white capitalize">{category} Quiz</h1>
                  <p className="text-purple-200">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge className={getDifficultyColor(currentQuestion?.difficulty || "beginner")}>
                  {currentQuestion?.difficulty}
                </Badge>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Clock className={`w-5 h-5 ${getTimeColor()}`} />
                  <span className={`font-bold text-lg ${getTimeColor()}`}>{timeLeft}s</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-purple-200">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-white/20" />
            </div>
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl leading-relaxed">{currentQuestion?.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedAnswer === index
                    ? "bg-purple-500/30 border-purple-400 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/10 border-white/20 text-purple-100 hover:bg-white/20 hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index ? "bg-purple-500 border-purple-400" : "border-white/30"
                    }`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-purple-200">
            <Target className="w-5 h-5" />
            <span>+{currentQuestion?.points || 10} XP for correct answer</span>
          </div>

          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              <>
                <Trophy className="w-5 h-5 mr-2" />
                Finish Quiz
              </>
            ) : (
              <>
                Next Question
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Points Display */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">
              Potential Score:{" "}
              {questions.slice(0, currentQuestionIndex + 1).reduce((sum, q) => sum + (q.points || 10), 0)} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
