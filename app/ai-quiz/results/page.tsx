"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Home,
  RotateCcw,
  Share2,
  Award,
  Zap,
  Brain,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: string
}

interface Answer {
  questionIndex: number
  selectedAnswer: number
  isCorrect: boolean
  timeSpent: number
}

interface QuizResults {
  subject: string
  difficulty: string
  questions: QuizQuestion[]
  answers: Answer[]
  completedAt: number
  totalTime: number
}

export default function ResultsPage() {
  const [results, setResults] = useState<QuizResults | null>(null)
  const [showDetailedReview, setShowDetailedReview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedResults = sessionStorage.getItem("quizResults")
    if (!savedResults) {
      toast.error("No quiz results found. Please complete a quiz first.")
      router.push("/ai-quiz")
      return
    }

    try {
      const parsedResults = JSON.parse(savedResults)
      setResults(parsedResults)
      saveToUserStats(parsedResults)
    } catch (error) {
      console.error("Error parsing quiz results:", error)
      toast.error("Invalid results data. Please try again.")
      router.push("/ai-quiz")
    }
  }, [router])

  const saveToUserStats = (quizResults: QuizResults) => {
    const correctAnswers = quizResults.answers.filter((a) => a.isCorrect).length
    const score = Math.round((correctAnswers / quizResults.questions.length) * 100)
    const xpEarned = calculateXP(score, quizResults.difficulty)

    const existingStats = JSON.parse(localStorage.getItem("userStats") || "{}")

    const updatedStats = {
      totalQuizzes: (existingStats.totalQuizzes || 0) + 1,
      totalXP: (existingStats.totalXP || 0) + xpEarned,
      level: Math.floor(((existingStats.totalXP || 0) + xpEarned) / 100) + 1,
      accuracy: calculateNewAccuracy(existingStats, score),
      streak: (existingStats.streak || 0) + 1,
      achievements: updateAchievements(existingStats, score, quizResults.difficulty),
      recentQuizzes: [
        {
          subject: quizResults.subject,
          difficulty: quizResults.difficulty,
          score,
          date: new Date().toLocaleDateString(),
        },
        ...(existingStats.recentQuizzes || []).slice(0, 9),
      ],
    }

    localStorage.setItem("userStats", JSON.stringify(updatedStats))
  }

  const calculateXP = (score: number, difficulty: string): number => {
    const baseXP = Math.round(score / 10)
    const difficultyMultiplier = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2,
      expert: 2.5,
      master: 3,
    }
    return Math.round(
      baseXP * (difficultyMultiplier[difficulty.toLowerCase() as keyof typeof difficultyMultiplier] || 1),
    )
  }

  const calculateNewAccuracy = (existingStats: any, newScore: number): number => {
    const totalQuizzes = (existingStats.totalQuizzes || 0) + 1
    const currentAccuracy = existingStats.accuracy || 0
    const previousTotal = (existingStats.totalQuizzes || 0) * currentAccuracy
    return Math.round((previousTotal + newScore) / totalQuizzes)
  }

  const updateAchievements = (existingStats: any, score: number, difficulty: string): string[] => {
    const achievements = new Set(existingStats.achievements || [])

    if ((existingStats.totalQuizzes || 0) === 0) {
      achievements.add("first_quiz")
    }
    if (score === 100) {
      achievements.add("perfect_score")
    }
    if ((existingStats.streak || 0) >= 4) {
      achievements.add("streak_5")
    }
    if (Math.floor(((existingStats.totalXP || 0) + calculateXP(score, difficulty)) / 100) + 1 >= 5) {
      achievements.add("level_5")
    }

    return Array.from(achievements)
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

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 text-violet-400 mx-auto mb-6 animate-bounce" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Loading Results...
            </h2>
            <p className="text-slate-400">Calculating your amazing performance!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const correctAnswers = results.answers.filter((a) => a.isCorrect).length
  const score = Math.round((correctAnswers / results.questions.length) * 100)
  const xpEarned = calculateXP(score, results.difficulty)
  const averageTime = Math.round(results.totalTime / results.questions.length / 1000)

  const getScoreColor = (score: number) => {
    if (score >= 90) return "from-green-400 to-emerald-400"
    if (score >= 70) return "from-blue-400 to-cyan-400"
    if (score >= 50) return "from-yellow-400 to-orange-400"
    return "from-red-400 to-pink-400"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "🏆 Outstanding Performance!"
    if (score >= 70) return "🎉 Great Job!"
    if (score >= 50) return "👍 Good Effort!"
    return "💪 Keep Practicing!"
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return "🏆"
    if (score >= 70) return "🎉"
    if (score >= 50) return "👍"
    return "💪"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-pink-500/10 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{getSubjectIcon(results.subject)}</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Quiz Complete!
            </h1>
            <span className="text-4xl">{getScoreEmoji(score)}</span>
          </div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Here's how you performed on your {results.subject} quiz
          </p>
        </div>

        {/* Score Overview */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl text-center">
          <CardHeader className="pb-4">
            <div className="relative mb-6">
              <div
                className={`text-8xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}
              >
                {score}%
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">{getScoreMessage(score)}</CardTitle>
            <p className="text-slate-400 text-lg">
              {correctAnswers} out of {results.questions.length} questions correct
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                  <span className="text-sm text-yellow-300 font-semibold">XP Earned</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400">+{xpEarned}</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                  <span className="text-sm text-blue-300 font-semibold">Avg. Time</span>
                </div>
                <div className="text-3xl font-bold text-blue-400">{averageTime}s</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <span className="text-sm text-purple-300 font-semibold">Accuracy</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">{score}%</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-400" />
                  </div>
                  <span className="text-sm text-green-300 font-semibold">Difficulty</span>
                </div>
                <div className="text-xl font-bold text-green-400 capitalize">{results.difficulty}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-lg mb-3">
                  <span className="text-slate-300 font-semibold">Correct Answers</span>
                  <span className="text-green-400 font-bold">
                    {correctAnswers}/{results.questions.length}
                  </span>
                </div>
                <Progress value={(correctAnswers / results.questions.length) * 100} className="h-4" />
              </div>

              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-2">{correctAnswers}</div>
                  <div className="text-green-300 font-semibold">Correct</div>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {results.questions.length - correctAnswers}
                  </div>
                  <div className="text-red-300 font-semibold">Incorrect</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Review Toggle */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                Question Review
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowDetailedReview(!showDetailedReview)}
                className="border-slate-600 hover:border-violet-400 bg-transparent hover:bg-violet-500/10 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {showDetailedReview ? "Hide" : "Show"} Details
              </Button>
            </div>
          </CardHeader>
          {showDetailedReview && (
            <CardContent className="space-y-6">
              {results.questions.map((question, index) => {
                const answer = results.answers[index]
                const isCorrect = answer.isCorrect

                return (
                  <div
                    key={index}
                    className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/50 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                              isCorrect
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <h4 className="font-semibold text-white text-lg leading-relaxed flex-1">
                            {question.question}
                          </h4>
                        </div>

                        <div className="space-y-3 ml-14">
                          {question.options.map((option, optionIndex) => {
                            let optionClass = "p-4 rounded-xl text-sm border transition-all duration-300 "

                            if (optionIndex === question.correctAnswer) {
                              optionClass += "bg-green-500/20 text-green-300 border-green-500/40"
                            } else if (optionIndex === answer.selectedAnswer && !isCorrect) {
                              optionClass += "bg-red-500/20 text-red-300 border-red-500/40"
                            } else {
                              optionClass += "bg-slate-700/30 text-slate-400 border-slate-600/30"
                            }

                            return (
                              <div key={optionIndex} className={optionClass}>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-lg">{String.fromCharCode(65 + optionIndex)}.</span>
                                  <span className="flex-1">{option}</span>
                                  {optionIndex === question.correctAnswer && (
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                  )}
                                  {optionIndex === answer.selectedAnswer && !isCorrect && (
                                    <XCircle className="h-5 w-5 text-red-400" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-6 ml-14 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Zap className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-blue-300 mb-2">Explanation</h5>
                              <p className="text-blue-200 text-sm leading-relaxed">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={isCorrect ? "default" : "destructive"}
                        className={`ml-6 px-4 py-2 text-sm font-semibold ${
                          isCorrect
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                        }`}
                      >
                        {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-slate-600 hover:border-violet-400 bg-transparent hover:bg-violet-500/10 transition-all duration-300 hover:scale-105 px-8 py-4 text-lg"
            >
              <Home className="h-5 w-5 mr-3" />
              Back to Dashboard
            </Button>
          </Link>

          <Link href="/ai-quiz">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 px-8 py-4 text-lg font-semibold shadow-lg">
              <RotateCcw className="h-5 w-5 mr-3" />
              Take Another Quiz
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => {
              const shareText = `🎯 I just scored ${score}% on a ${results.difficulty} ${results.subject} quiz! 🚀\n\nCorrect answers: ${correctAnswers}/${results.questions.length}\nXP earned: +${xpEarned}\n\nChallenge yourself too! 💪`
              if (navigator.share) {
                navigator.share({ text: shareText })
              } else {
                navigator.clipboard.writeText(shareText)
                toast.success("🎉 Results copied to clipboard!")
              }
            }}
            className="w-full sm:w-auto border-slate-600 hover:border-green-400 hover:text-green-400 bg-transparent hover:bg-green-500/10 transition-all duration-300 hover:scale-105 px-8 py-4 text-lg"
          >
            <Share2 className="h-5 w-5 mr-3" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  )
}
