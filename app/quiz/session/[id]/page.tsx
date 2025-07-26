"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle, Brain, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: string
  subject: string
}

interface QuizSession {
  id: string
  user_id: string
  subject_id: string
  difficulty: string
  questions: Question[]
  answers: number[]
  score: number
  total_questions: number
  completed_at: string | null
  xp_earned: number
  time_taken: number
  status: string
  created_at: string
  subjects: {
    name: string
    category: string
    color: string
  }
}

export default function QuizSessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questionsLoading, setQuestionsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSession()
  }, [params.id])

  useEffect(() => {
    if (session && session.questions.length === 0) {
      generateQuestions()
    }
  }, [session])

  useEffect(() => {
    if (timeLeft > 0 && session && !session.completed_at) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && session && !session.completed_at) {
      handleSubmitQuiz()
    }
  }, [timeLeft, session])

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select(`
          *,
          subjects (name, category, color)
        `)
        .eq("id", params.id)
        .single()

      if (error) {
        console.error("Error loading session:", error)
        toast.error("Failed to load quiz session")
        router.push("/dashboard")
        return
      }

      setSession(data)
      setUserAnswers(data.answers || [])

      if (data.completed_at) {
        router.push(`/quiz/results/${data.id}`)
        return
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const generateQuestions = async () => {
    setQuestionsLoading(true)
    try {
      const response = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: params.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate questions")
      }

      const { questions } = await response.json()

      setSession((prev) => (prev ? { ...prev, questions } : null))
      toast.success("Questions generated successfully!")
    } catch (error) {
      console.error("Error generating questions:", error)
      toast.error("Failed to generate questions")
    } finally {
      setQuestionsLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return

    setSelectedAnswer(answerIndex)
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = answerIndex
    setUserAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer")
      return
    }

    setShowExplanation(true)

    setTimeout(() => {
      if (currentQuestion < session!.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        handleSubmitQuiz()
      }
    }, 3000) // Show explanation for 3 seconds
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(userAnswers[currentQuestion - 1] || null)
      setShowExplanation(false)
    }
  }

  const calculateScore = () => {
    if (!session) return 0

    return userAnswers.reduce((score, answer, index) => {
      if (answer === session.questions[index]?.correctAnswer) {
        return score + 1
      }
      return score
    }, 0)
  }

  const calculateXP = (score: number, difficulty: string, timeTaken: number) => {
    const baseXP = 10
    const difficultyMultipliers = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2,
      expert: 2.5,
      master: 3,
    }

    const difficultyMultiplier = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 1
    const performanceBonus = 0.5 + (1.5 * score) / session!.total_questions
    const timeBonus = timeTaken <= 120 ? 1.2 : timeTaken <= 180 ? 1.1 : timeTaken <= 240 ? 1.05 : 1

    return Math.round(baseXP * score * difficultyMultiplier * performanceBonus * timeBonus)
  }

  const handleSubmitQuiz = async () => {
    if (!session) return

    setSubmitting(true)

    try {
      const score = calculateScore()
      const timeTaken = 300 - timeLeft
      const xpEarned = calculateXP(score, session.difficulty, timeTaken)

      // Update quiz session
      const { error: sessionError } = await supabase
        .from("quiz_sessions")
        .update({
          answers: userAnswers,
          score,
          completed_at: new Date().toISOString(),
          xp_earned: xpEarned,
          time_taken: timeTaken,
          status: "completed",
        })
        .eq("id", params.id)

      if (sessionError) {
        throw sessionError
      }

      // Update user progress using the database function
      const { error: progressError } = await supabase.rpc("update_user_progress", {
        p_user_id: session.user_id,
        p_subject_id: session.subject_id,
        p_difficulty: session.difficulty,
        p_score: score,
        p_total_questions: session.total_questions,
        p_xp_earned: xpEarned,
      })

      if (progressError) {
        console.error("Progress update error:", progressError)
        // Don't throw here, as the quiz is still completed
      }

      toast.success(`Quiz completed! You earned ${xpEarned} XP!`)
      router.push(`/quiz/results/${params.id}`)
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Quiz session not found</p>
          <Button asChild className="mt-4">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    )
  }

  if (questionsLoading || session.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 animate-pulse mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Generating Your Quiz</h2>
          <p className="text-slate-400 mb-4">AI is creating personalized questions for you...</p>
          <div className="w-64 mx-auto">
            <Progress value={75} className="h-2" />
          </div>
        </div>
      </div>
    )
  }

  const currentQ = session.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / session.questions.length) * 100

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")} className="glass">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Quiz
            </Button>

            <div>
              <h1 className="text-2xl font-bold">{session.subjects.name}</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{session.difficulty}</Badge>
                <span className="text-slate-400 text-sm">
                  Question {currentQuestion + 1} of {session.questions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className={`font-mono ${timeLeft < 60 ? "text-red-400" : "text-slate-300"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="glass mb-8">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 "

                if (showExplanation) {
                  if (index === currentQ.correctAnswer) {
                    buttonClass += "border-green-500 bg-green-500/20 text-green-300"
                  } else if (index === selectedAnswer && index !== currentQ.correctAnswer) {
                    buttonClass += "border-red-500 bg-red-500/20 text-red-300"
                  } else {
                    buttonClass += "border-slate-600 bg-slate-800/30 text-slate-400"
                  }
                } else {
                  if (index === selectedAnswer) {
                    buttonClass += "border-blue-500 bg-blue-500/20 text-blue-300"
                  } else {
                    buttonClass +=
                      "border-slate-600 bg-slate-800/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/30"
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {showExplanation && index === currentQ.correctAnswer && (
                        <CheckCircle className="w-5 h-5 ml-auto" />
                      )}
                      {showExplanation && index === selectedAnswer && index !== currentQ.correctAnswer && (
                        <XCircle className="w-5 h-5 ml-auto" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {showExplanation && (
              <Alert className="mt-6 border-blue-500/50 bg-blue-500/10">
                <Brain className="w-4 h-4" />
                <AlertDescription className="text-blue-300">
                  <strong>Explanation:</strong> {currentQ.explanation}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0 || showExplanation}
            className="glass bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentQuestion === session.questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} disabled={selectedAnswer === null || submitting} className="btn-hover">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || showExplanation}
                className="btn-hover"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
