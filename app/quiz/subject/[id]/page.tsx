"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Play, Trophy, Target, Clock, Star, Lock, CheckCircle, BookOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Subject {
  id: string
  name: string
  category: string
  description: string
  color: string
  icon: string
}

interface UserProgress {
  difficulty: string
  total_xp: number
  quiz_count: number
  correct_answers: number
  total_questions: number
  best_score: number
}

const difficulties = [
  {
    id: "beginner",
    name: "Beginner",
    description: "Perfect for getting started",
    color: "from-green-500 to-emerald-500",
    xpRequired: 0,
    questions: 10,
    timeLimit: 300, // 5 minutes
  },
  {
    id: "intermediate",
    name: "Intermediate",
    description: "Build on your foundation",
    color: "from-blue-500 to-cyan-500",
    xpRequired: 100,
    questions: 15,
    timeLimit: 450, // 7.5 minutes
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Challenge your expertise",
    color: "from-purple-500 to-violet-500",
    xpRequired: 300,
    questions: 20,
    timeLimit: 600, // 10 minutes
  },
  {
    id: "expert",
    name: "Expert",
    description: "For true masters",
    color: "from-orange-500 to-red-500",
    xpRequired: 600,
    questions: 25,
    timeLimit: 750, // 12.5 minutes
  },
  {
    id: "master",
    name: "Master",
    description: "Ultimate challenge",
    color: "from-pink-500 to-rose-500",
    xpRequired: 1000,
    questions: 30,
    timeLimit: 900, // 15 minutes
  },
]

export default function SubjectQuizPage({ params }: { params: { id: string } }) {
  const [subject, setSubject] = useState<Subject | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSubjectData()
  }, [params.id])

  const loadSubjectData = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load subject
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", params.id)
        .single()

      if (subjectError || !subjectData) {
        toast.error("Subject not found")
        router.push("/dashboard")
        return
      }

      setSubject(subjectData)

      // Load user progress for this subject
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject_id", params.id)

      setUserProgress(progressData || [])

      // Load total user XP
      const { data: statsData } = await supabase.from("user_stats").select("total_xp").eq("user_id", user.id).single()

      setTotalXP(statsData?.total_xp || 0)
    } catch (error) {
      console.error("Error loading subject data:", error)
      toast.error("Failed to load subject data")
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyProgress = (difficultyId: string) => {
    return userProgress.find((p) => p.difficulty === difficultyId)
  }

  const isDifficultyUnlocked = (difficulty: (typeof difficulties)[0]) => {
    if (difficulty.id === "beginner") return true

    const previousDifficultyIndex = difficulties.findIndex((d) => d.id === difficulty.id) - 1
    if (previousDifficultyIndex < 0) return true

    const previousDifficulty = difficulties[previousDifficultyIndex]
    const previousProgress = getDifficultyProgress(previousDifficulty.id)

    if (!previousProgress) return false

    // Need 70% accuracy to unlock next level
    const accuracy =
      previousProgress.total_questions > 0
        ? (previousProgress.correct_answers / previousProgress.total_questions) * 100
        : 0

    return accuracy >= 70
  }

  const createQuizSession = async () => {
    if (!selectedDifficulty || !subject) return

    setCreating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const difficulty = difficulties.find((d) => d.id === selectedDifficulty)!

      // Create quiz session
      const { data: session, error } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          subject_id: subject.id,
          difficulty: selectedDifficulty,
          total_questions: difficulty.questions,
          status: "active",
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success("Quiz session created!")
      router.push(`/quiz/session/${session.id}`)
    } catch (error) {
      console.error("Error creating quiz session:", error)
      toast.error("Failed to create quiz session")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading subject...</p>
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Subject not found</p>
          <Button asChild className="mt-4">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="glass bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              <BookOpen className="h-6 w-6" style={{ color: subject.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{subject.name}</h1>
              <p className="text-slate-400">{subject.description}</p>
              <Badge variant="secondary" className="mt-1">
                {subject.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* User Progress Summary */}
        {userProgress.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Your Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {userProgress.reduce((sum, p) => sum + p.total_xp, 0)}
                  </div>
                  <div className="text-sm text-slate-400">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {userProgress.reduce((sum, p) => sum + p.quiz_count, 0)}
                  </div>
                  <div className="text-sm text-slate-400">Quizzes Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {userProgress.length > 0
                      ? Math.round(
                          (userProgress.reduce((sum, p) => sum + p.correct_answers, 0) /
                            userProgress.reduce((sum, p) => sum + p.total_questions, 0)) *
                            100,
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-slate-400">Overall Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Difficulty Selection */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Choose Difficulty</span>
            </CardTitle>
            <CardDescription>Select your challenge level. Higher difficulties unlock as you progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {difficulties.map((difficulty) => {
              const progress = getDifficultyProgress(difficulty.id)
              const isUnlocked = isDifficultyUnlocked(difficulty)
              const isSelected = selectedDifficulty === difficulty.id

              return (
                <div
                  key={difficulty.id}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${
                      isSelected
                        ? `border-blue-500 bg-blue-500/10`
                        : isUnlocked
                          ? "border-slate-600 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-700/50"
                          : "border-slate-700 bg-slate-800/20 opacity-50"
                    }
                  `}
                  onClick={() => isUnlocked && setSelectedDifficulty(difficulty.id)}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">
                          Complete {difficulties[difficulties.findIndex((d) => d.id === difficulty.id) - 1]?.name} with
                          70%+ accuracy
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${difficulty.color} flex items-center justify-center`}
                      >
                        <Target className="h-6 w-6 text-white" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{difficulty.name}</h3>
                          {isSelected && <CheckCircle className="h-5 w-5 text-blue-400" />}
                        </div>
                        <p className="text-slate-400 text-sm">{difficulty.description}</p>

                        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{difficulty.questions} questions</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{Math.floor(difficulty.timeLimit / 60)} min</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {progress && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Best: {Math.round((progress.best_score / difficulty.questions) * 100)}%
                          </div>
                          <div className="text-xs text-slate-400">
                            {progress.quiz_count} quiz{progress.quiz_count !== 1 ? "es" : ""} • {progress.total_xp} XP
                          </div>
                          {progress.total_questions > 0 && (
                            <div className="w-20">
                              <Progress
                                value={(progress.correct_answers / progress.total_questions) * 100}
                                className="h-1"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {!progress && isUnlocked && (
                        <Badge variant="outline" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Start Quiz Button */}
        {selectedDifficulty && (
          <Card className="glass">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
                  <p className="text-slate-400">
                    You've selected{" "}
                    <span className="text-blue-400 font-medium">
                      {difficulties.find((d) => d.id === selectedDifficulty)?.name}
                    </span>{" "}
                    difficulty
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-8 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{difficulties.find((d) => d.id === selectedDifficulty)?.questions} Questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.floor(difficulties.find((d) => d.id === selectedDifficulty)?.timeLimit! / 60)} Minutes
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>AI Generated</span>
                  </div>
                </div>

                <Button onClick={createQuizSession} disabled={creating} className="btn-hover px-8 py-3">
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Alert className="glass border-blue-500/50 bg-blue-500/10">
          <Star className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            <strong>Pro Tip:</strong> Each quiz features fresh AI-generated questions. Score 70% or higher to unlock the
            next difficulty level!
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
