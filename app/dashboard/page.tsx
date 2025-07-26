"use client"

import { getSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Target, BookOpen, TrendingUp, Clock, Award, Zap, Brain, LogOut, Play } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user stats
  const { data: userStats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single()

  // Fetch subjects
  const { data: subjects } = await supabase.from("subjects").select("*").order("name")

  // Fetch user progress
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select(`
      *,
      subjects (name, color, icon)
    `)
    .eq("user_id", user.id)
    .order("total_xp", { ascending: false })
    .limit(5)

  // Fetch recent quiz sessions
  const { data: recentQuizzes } = await supabase
    .from("quiz_sessions")
    .select(`
      *,
      subjects (name, color)
    `)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(5)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    redirect("/")
  }

  const stats = userStats || {
    total_xp: 0,
    level: 1,
    quiz_streak: 0,
    total_quizzes: 0,
    total_correct_answers: 0,
    total_questions_answered: 0,
  }

  const accuracy =
    stats.total_questions_answered > 0
      ? Math.round((stats.total_correct_answers / stats.total_questions_answered) * 100)
      : 0

  const nextLevelXP = stats.level * 100
  const currentLevelXP = (stats.level - 1) * 100
  const progressToNextLevel = ((stats.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.user_metadata?.full_name || "Learner"}!</h1>
              <p className="text-slate-400">Ready to challenge yourself today?</p>
            </div>
          </div>

          <Button variant="outline" onClick={handleSignOut} className="glass bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Star className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total XP</p>
                  <p className="text-2xl font-bold">{stats.total_xp.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Level</p>
                  <p className="text-2xl font-bold">{stats.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Accuracy</p>
                  <p className="text-2xl font-bold">{accuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Streak</p>
                  <p className="text-2xl font-bold">{stats.quiz_streak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Level Progress</span>
            </CardTitle>
            <CardDescription>
              {nextLevelXP - stats.total_xp} XP needed to reach Level {stats.level + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {stats.level}</span>
                <span>Level {stats.level + 1}</span>
              </div>
              <Progress value={progressToNextLevel} className="h-3" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{currentLevelXP} XP</span>
                <span>{nextLevelXP} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subjects */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Available Subjects</span>
              </CardTitle>
              <CardDescription>Choose a subject to start a new quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjects?.slice(0, 6).map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${subject.color}20` }}
                    >
                      <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
                    </div>
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-xs text-slate-400">{subject.category}</p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="btn-hover">
                    <Link href={`/quiz/subject/${subject.id}`}>
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Link>
                  </Button>
                </div>
              ))}

              {subjects && subjects.length > 6 && (
                <Button asChild variant="outline" className="w-full glass bg-transparent">
                  <Link href="/subjects">View All Subjects</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Your latest quiz results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentQuizzes && recentQuizzes.length > 0 ? (
                recentQuizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${quiz.subjects.color}20` }}
                      >
                        <Brain className="h-5 w-5" style={{ color: quiz.subjects.color }} />
                      </div>
                      <div>
                        <p className="font-medium">{quiz.subjects.name}</p>
                        <p className="text-xs text-slate-400">{new Date(quiz.completed_at!).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={quiz.score >= quiz.total_questions * 0.7 ? "default" : "secondary"}
                        className={quiz.score >= quiz.total_questions * 0.7 ? "bg-green-500/20 text-green-400" : ""}
                      >
                        {Math.round((quiz.score / quiz.total_questions) * 100)}%
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">+{quiz.xp_earned} XP</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No quizzes completed yet</p>
                  <p className="text-sm text-slate-500">Start your first quiz to see your progress here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Subjects */}
        {userProgress && userProgress.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Your Top Subjects</span>
              </CardTitle>
              <CardDescription>Subjects where you've earned the most XP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProgress.map((progress) => (
                  <div key={progress.id} className="p-4 rounded-lg bg-slate-800/30">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${progress.subjects.color}20` }}
                      >
                        <BookOpen className="h-5 w-5" style={{ color: progress.subjects.color }} />
                      </div>
                      <div>
                        <p className="font-medium">{progress.subjects.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{progress.difficulty}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Accuracy</span>
                        <span>
                          {progress.total_questions > 0
                            ? Math.round((progress.correct_answers / progress.total_questions) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">XP Earned</span>
                        <span className="text-blue-400">{progress.total_xp}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Quizzes</span>
                        <span>{progress.quiz_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
