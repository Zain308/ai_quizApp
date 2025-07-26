"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Target, Zap, Heart, Trophy } from "lucide-react"

interface ProgressHeaderProps {
  currentQuestion: number
  totalQuestions: number
  score: number
  topic: string
  level: number
  streak: number
  lives: number
  onBack: () => void
}

export function ProgressHeader({
  currentQuestion,
  totalQuestions,
  score,
  topic,
  level,
  streak,
  lives,
  onBack,
}: ProgressHeaderProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  return (
    <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 px-3 py-1">
                {topic} - Level {level}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">30s</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-3 py-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">
                {currentQuestion + 1}/{totalQuestions}
              </span>
            </div>
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-3 py-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">{score} XP</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-3 py-2">
              <Trophy className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-medium">Streak: {streak}</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-3 py-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-medium">{lives}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm text-white font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </div>
    </header>
  )
}
