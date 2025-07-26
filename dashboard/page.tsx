"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SubjectSelector } from "@/components/subject-selector"
import { DifficultySelector } from "@/components/difficulty-selector"
import {
  Brain,
  Sparkles,
  Target,
  Trophy,
  Star,
  CheckCircle,
  Globe,
  Award,
  TrendingUp,
  Zap,
  Crown,
  BookOpen,
  Calculator,
  Atom,
  Code,
} from "lucide-react"

interface QuizSession {
  subject: string
  topic?: string
  difficulty: 1 | 2 | 3 | 4 | 5
}

export default function Dashboard() {
  const router = useRouter()
  const [demoAttempts, setDemoAttempts] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [showSubjectSelector, setShowSubjectSelector] = useState(false)
  const [showDifficultySelector, setShowDifficultySelector] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<{ name: string; topic?: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    // Load demo attempts from localStorage
    const attempts = localStorage.getItem("demoAttempts")
    if (attempts) {
      setDemoAttempts(Number.parseInt(attempts))
    }

    // Load user progress
    const savedXP = localStorage.getItem("userXP")
    if (savedXP) {
      const xp = Number.parseInt(savedXP)
      setTotalXP(xp)
      setUserLevel(Math.floor(xp / 500) + 1)
    }
  }, [])

  const handleStartQuiz = () => {
    if (demoAttempts >= 5) {
      alert("Demo limit reached! Please sign up to continue.")
      return
    }
    setShowSubjectSelector(true)
  }

  const handleSubjectSelect = (subject: any, topic?: string) => {
    setSelectedSubject({ name: subject.name, topic })
    setShowSubjectSelector(false)
    setShowDifficultySelector(true)
  }

  const handleDifficultySelect = (difficulty: 1 | 2 | 3 | 4 | 5) => {
    if (!selectedSubject) return

    const newAttempts = demoAttempts + 1
    setDemoAttempts(newAttempts)
    localStorage.setItem("demoAttempts", newAttempts.toString())

    // Navigate to AI quiz
    const params = new URLSearchParams({
      subject: selectedSubject.name,
      difficulty: difficulty.toString(),
      ...(selectedSubject.topic && { topic: selectedSubject.topic }),
    })

    router.push(`/ai-quiz?${params.toString()}`)
  }

  const stats = [
    { number: `${totalXP}`, label: "Total XP", icon: Zap, color: "text-yellow-400" },
    { number: `${userLevel}`, label: "Current Level", icon: Crown, color: "text-purple-400" },
    { number: `${5 - demoAttempts}`, label: "Demo Attempts Left", icon: Target, color: "text-blue-400" },
    { number: "∞", label: "Subjects Available", icon: BookOpen, color: "text-green-400" },
  ]

  const achievements = [
    { name: "First Steps", description: "Complete your first quiz", icon: Star, unlocked: totalXP > 0 },
    { name: "Knowledge Seeker", description: "Earn 100 XP", icon: Target, unlocked: totalXP >= 100 },
    { name: "Rising Star", description: "Reach Level 3", icon: TrendingUp, unlocked: userLevel >= 3 },
    { name: "Subject Master", description: "Try 3 different subjects", icon: Trophy, unlocked: false },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="w-4 h-4 text-yellow-900" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Powered Learning Hub
            </h1>
            <p className="text-xl text-purple-200 mb-6 max-w-2xl mx-auto">
              Explore unlimited subjects with AI-generated questions. Choose any topic and challenge yourself across 5
              progressive difficulty levels.
            </p>

            <Button
              onClick={handleStartQuiz}
              disabled={demoAttempts >= 5}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold group transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              {demoAttempts >= 5 ? "Demo Limit Reached" : "Start AI Quiz"}
            </Button>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-purple-200 text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Start Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Popular Subjects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Mathematics", icon: Calculator, color: "text-blue-400", bg: "from-blue-400/20 to-cyan-500/20" },
              { name: "Science", icon: Atom, color: "text-green-400", bg: "from-green-400/20 to-emerald-500/20" },
              {
                name: "Computer Science",
                icon: Code,
                color: "text-purple-400",
                bg: "from-purple-400/20 to-pink-500/20",
              },
              { name: "History", icon: Globe, color: "text-amber-400", bg: "from-amber-400/20 to-orange-500/20" },
            ].map((subject, index) => {
              const Icon = subject.icon
              return (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card
                    className="group cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                    onClick={handleStartQuiz}
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${subject.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`w-8 h-8 ${subject.color}`} />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{subject.name}</h3>
                      <p className="text-purple-200 text-sm">AI-generated questions</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Progress & Achievements */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Level Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Level {userLevel}</span>
                    <span className="text-white font-bold">{totalXP} XP</span>
                  </div>
                  <Progress value={(totalXP % 500) / 5} className="h-3 bg-white/20" />
                  <p className="text-xs text-purple-300">
                    {500 - (totalXP % 500)} XP to Level {userLevel + 1}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? "bg-yellow-400/20" : "bg-gray-500/20"
                        }`}
                      >
                        <achievement.icon
                          className={`w-4 h-4 ${achievement.unlocked ? "text-yellow-400" : "text-gray-400"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${achievement.unlocked ? "text-white" : "text-gray-400"}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-purple-300">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && <CheckCircle className="w-5 h-5 text-green-400" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-violet-400/30 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold">AI-Generated</h3>
                  <p className="text-purple-200 text-sm">Questions created by advanced AI for any subject</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold">5 Difficulty Levels</h3>
                  <p className="text-purple-200 text-sm">Progressive challenges from beginner to expert</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold">Unlimited Subjects</h3>
                  <p className="text-purple-200 text-sm">Explore any topic that interests you</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      {showSubjectSelector && (
        <SubjectSelector onSubjectSelect={handleSubjectSelect} onClose={() => setShowSubjectSelector(false)} />
      )}

      {showDifficultySelector && selectedSubject && (
        <DifficultySelector
          subject={selectedSubject.name}
          topic={selectedSubject.topic}
          onDifficultySelect={handleDifficultySelect}
          onBack={() => {
            setShowDifficultySelector(false)
            setShowSubjectSelector(true)
          }}
          userLevel={userLevel}
        />
      )}
    </div>
  )
}
