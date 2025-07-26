"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Trophy,
  Star,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Share2,
  Award,
  TrendingUp,
  Brain,
  Loader2,
} from "lucide-react"
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
  completed_at: string
  xp_earned: number
  time_taken: number
  status: string
  subjects: {
    name: string
    category: string
    color: string
  }
}

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<QuizSession | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadResults()
  }, [params.id])

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select(`
          *,
          subjects (name, category, color)
        `)
        .eq("id", params.id)
        .single()

      if (error || !data) {
        toast.error("Quiz results not found")
        router.push("/dashboard")
        return
      }

      if (data.status !== "completed") {
        toast.error("Quiz not completed yet")
        router.push(`/quiz/session/${params.id}`)
        return
      }

      setSession(data)
    } catch (error) {
      console.error("Error loading results:", error)
      toast.error("Failed to load results")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!session) return

    const shareText = `🎯 Just completed a ${session.difficulty} ${session.subjects.name} quiz!\n\nScore: ${Math.round((session.score / session.total_questions) * 100)}%\nXP Earned: +${session.xp_earned}\n\nChallenge yourself at AI Quiz Master! 🚀`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Quiz Master Results",
          text: shareText,
        })
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)
        toast.success("Results copied to clipboard!")
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      toast.success("Results copied to clipboard!")
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-400"
    if (percentage >= 70) return "text-blue-400"
    if (percentage >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding! 🏆"
    if (percentage >= 70) return "Great job! 🎉"
    if (percentage >= 50) return "Good effort! 👍"
    return "Keep practicing! 💪"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Results not found</p>
          <Button asChild className="mt-4">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    )
  }

  const percentage = Math.round((session.score / session.total_questions) * 100)
  const averageTimePerQuestion = Math.round(session.time_taken / session.total_questions)

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="glass bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleShare} className="glass bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button onClick={() => router.push(`/quiz/subject/${session.subject_id}`)} className="btn-hover">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>

        {/* Results Overview */}
        <Card className="glass text-center">
          <CardHeader>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${session.subjects.color}20` }}
              >
                <Brain className="h-6 w-6" style={{ color: session.subjects.color }} />
              </div>
              <div>
                <CardTitle className="text-2xl">{session.subjects.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className="mt-1 capitalize"
                  style={{ backgroundColor: `${session.subjects.color}20`, color: session.subjects.color }}
                >
                  {session.difficulty}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>{percentage}%</div>
                <p className="text-xl text-slate-300">{getScoreMessage(percentage)}</p>
              </div>

              <div className="text-slate-400">
                <p>
                  You answered {session.score} out of {session.total_questions} questions correctly
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">+{session.xp_earned}</div>
              <div className="text-sm text-slate-400">XP Earned</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{formatTime(session.time_taken)}</div>
              <div className="text-sm text-slate-400">Total Time</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{averageTimePerQuestion}s</div>
              <div className="text-sm text-slate-400">Avg per Question</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">{session.score}</div>
              <div className="text-sm text-slate-400">Correct Answers</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analysis */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Accuracy</span>
                <span className={getScoreColor(percentage)}>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Correct Answers</span>
                </h4>
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-3xl font-bold text-green-400">{session.score}</div>
                  <div className="text-sm text-green-300">out of {session.total_questions}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span>Incorrect Answers</span>
                </h4>
                <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="text-3xl font-bold text-red-400">{session.total_questions - session.score}</div>
                  <div className="text-sm text-red-300">out of {session.total_questions}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Alert */}
        {percentage >= 70 && (
          <Alert className="glass border-green-500/50 bg-green-500/10">
            <Award className="h-4 w-4" />
            <AlertDescription className="text-green-300">
              <strong>Congratulations!</strong> You scored 70% or higher and unlocked the next difficulty level!
            </AlertDescription>
          </Alert>
        )}

        {/* Question Review */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Question Review</span>
              </CardTitle>
              <Button variant="outline" onClick={() => setShowReview(!showReview)} className="glass bg-transparent">
                {showReview ? "Hide" : "Show"} Review
              </Button>
            </div>
          </CardHeader>

          {showReview && (
            <CardContent className="space-y-6">
              {session.questions.map((question, index) => {
                const userAnswer = session.answers[index]
                const isCorrect = userAnswer === question.correctAnswer

                return (
                  <div key={question.id} className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-3">{question.question}</h4>

                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            let optionClass = "p-3 rounded-lg border text-sm "

                            if (optionIndex === question.correctAnswer) {
                              optionClass += "border-green-500 bg-green-500/10 text-green-300"
                            } else if (optionIndex === userAnswer && !isCorrect) {
                              optionClass += "border-red-500 bg-red-500/10 text-red-300"
                            } else {
                              optionClass += "border-slate-600 bg-slate-800/30 text-slate-400"
                            }

                            return (
                              <div key={optionIndex} className={optionClass}>
                                <div className="flex items-center space-x-3">
                                  <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                                  <span>{option}</span>
                                  {optionIndex === question.correctAnswer && (
                                    <CheckCircle className="h-4 w-4 ml-auto" />
                                  )}
                                  {optionIndex === userAnswer && !isCorrect && <XCircle className="h-4 w-4 ml-auto" />}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <Alert className="mt-4 border-blue-500/50 bg-blue-500/10">
                          <Brain className="h-4 w-4" />
                          <AlertDescription className="text-blue-300">
                            <strong>Explanation:</strong> {question.explanation}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>

                    {index < session.questions.length - 1 && <Separator className="my-6" />}
                  </div>
                )
              })}
            </CardContent>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => router.push(`/quiz/subject/${session.subject_id}`)} className="btn-hover">
            <RotateCcw className="w-4 h-4 mr-2" />
            Take Another Quiz
          </Button>

          <Button variant="outline" onClick={() => router.push("/dashboard")} className="glass bg-transparent">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
