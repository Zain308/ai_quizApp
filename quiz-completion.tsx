"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Star,
  Award,
  TrendingUp,
  BookOpen,
  Target,
  Clock,
  RotateCcw,
  Home,
  Share2,
  Download,
} from "lucide-react"

interface QuizCompletionProps {
  score: number
  totalQuestions: number
  timeSpent: number
  correctAnswers: number
  difficulty: string
  topic: string
  onRestart: () => void
  onBackToDashboard: () => void
}

export function QuizCompletion({
  score,
  totalQuestions,
  timeSpent,
  correctAnswers,
  difficulty,
  topic,
  onRestart,
  onBackToDashboard,
}: QuizCompletionProps) {
  const scorePercentage = Math.round((score / totalQuestions) * 100)
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100)

  const getPerformanceLevel = () => {
    if (scorePercentage >= 90)
      return {
        level: "Excellent",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-400/50",
      }
    if (scorePercentage >= 70)
      return { level: "Great", color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-400/50" }
    if (scorePercentage >= 50)
      return { level: "Good", color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-400/50" }
    return { level: "Keep Learning", color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-400/50" }
  }

  const performance = getPerformanceLevel()

  const getPerformanceIcon = () => {
    if (scorePercentage >= 90) return <Star className="w-6 h-6" />
    if (scorePercentage >= 70) return <Award className="w-6 h-6" />
    if (scorePercentage >= 50) return <TrendingUp className="w-6 h-6" />
    return <BookOpen className="w-6 h-6" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-white mb-2">Quiz Completed!</CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Congratulations on completing the {topic} quiz
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Score Display */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                className="text-6xl font-bold text-white mb-2"
              >
                {scorePercentage}%
              </motion.div>
              <p className="text-gray-300 text-lg mb-4">
                {score} out of {totalQuestions} questions correct
              </p>

              {/* Performance Badge */}
              <Badge
                variant="outline"
                className={`px-6 py-3 text-lg ${performance.borderColor} ${performance.color} ${performance.bgColor}`}
              >
                <span className="mr-2">{getPerformanceIcon()}</span>
                {performance.level}
              </Badge>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{accuracy}%</p>
                <p className="text-gray-400 text-sm">Accuracy Rate</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <Clock className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-gray-400 text-sm">Time Taken</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1 capitalize">{difficulty}</p>
                <p className="text-gray-400 text-sm">Difficulty Level</p>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">Overall Performance</span>
                <span className="text-white font-bold">{scorePercentage}%</span>
              </div>
              <Progress value={scorePercentage} className="h-3" />
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-violet-500/20 to-purple-600/20 border border-violet-400/30 rounded-xl p-6">
              <div className="text-center">
                <h3 className="text-white font-semibold mb-2">
                  {scorePercentage >= 90
                    ? "Outstanding Performance! 🌟"
                    : scorePercentage >= 70
                      ? "Great Job! Keep it up! 🎉"
                      : scorePercentage >= 50
                        ? "Good effort! Room for improvement! 💪"
                        : "Don't give up! Practice makes perfect! 📚"}
                </h3>
                <p className="text-gray-300 text-sm">
                  {scorePercentage >= 90
                    ? "You've mastered this topic! Try a harder difficulty level."
                    : scorePercentage >= 70
                      ? "You're doing well! A few more practice sessions and you'll be an expert."
                      : scorePercentage >= 50
                        ? "You're on the right track. Review the topics you missed and try again."
                        : "Learning is a journey. Review the explanations and keep practicing!"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onBackToDashboard}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent py-6"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                onClick={onRestart}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>

            {/* Share Options */}
            <div className="flex justify-center space-x-4 pt-4 border-t border-white/10">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Share2 className="w-4 h-4 mr-2" />
                Share Result
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
