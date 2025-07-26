"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Target, Flame, Crown, Sparkles, Lock, TrendingUp, Award, Star, CheckCircle } from "lucide-react"

interface DifficultyLevel {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  gradient: string
  xpRequired: number
  estimatedTime: string
  features: string[]
  questionCount: number
  locked?: boolean
}

const difficultyLevels: DifficultyLevel[] = [
  {
    id: "beginner",
    name: "Beginner",
    description: "Perfect for getting started and building confidence",
    icon: Zap,
    color: "text-green-400",
    gradient: "from-green-500 to-emerald-500",
    xpRequired: 0,
    estimatedTime: "5-10 min",
    questionCount: 10,
    features: ["Basic concepts", "Multiple choice", "Instant feedback", "Encouraging hints"],
  },
  {
    id: "intermediate",
    name: "Intermediate",
    description: "Challenge yourself with moderate complexity questions",
    icon: Target,
    color: "text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    xpRequired: 100,
    estimatedTime: "10-15 min",
    questionCount: 15,
    features: ["Mixed question types", "Detailed explanations", "Progress tracking", "Skill assessment"],
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Test your expertise with complex problem-solving",
    icon: Flame,
    color: "text-orange-400",
    gradient: "from-orange-500 to-red-500",
    xpRequired: 250,
    estimatedTime: "15-20 min",
    questionCount: 20,
    features: ["Complex scenarios", "Critical thinking", "Time pressure", "Expert analysis"],
  },
  {
    id: "expert",
    name: "Expert",
    description: "Master-level challenges for true professionals",
    icon: Crown,
    color: "text-purple-400",
    gradient: "from-purple-500 to-violet-500",
    xpRequired: 500,
    estimatedTime: "20-30 min",
    questionCount: 25,
    features: ["Advanced concepts", "Multi-step problems", "Real-world applications", "Peer comparison"],
    locked: true,
  },
  {
    id: "master",
    name: "Master",
    description: "Ultimate test of knowledge and skill mastery",
    icon: Sparkles,
    color: "text-pink-400",
    gradient: "from-pink-500 to-rose-500",
    xpRequired: 1000,
    estimatedTime: "30-45 min",
    questionCount: 30,
    features: ["Expert-level content", "Comprehensive assessment", "Certification worthy", "Leaderboard ranking"],
    locked: true,
  },
]

interface DifficultySelectorProps {
  selectedDifficulty: string
  onDifficultyChange: (difficulty: string) => void
  userXP?: number
}

export function DifficultySelector({ selectedDifficulty, onDifficultyChange, userXP = 0 }: DifficultySelectorProps) {
  const handleDifficultySelect = (difficultyId: string, isLocked: boolean) => {
    if (isLocked) {
      return
    }
    onDifficultyChange(difficultyId)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 blur-3xl rounded-full"></div>
          <div className="relative flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl shadow-lg animate-pulse">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Select Difficulty
            </h2>
          </div>
        </div>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Choose the challenge level that matches your current expertise
        </p>

        {/* XP Display */}
        <div className="flex items-center justify-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="text-white font-semibold">Your XP: {userXP}</span>
          </div>
          <div className="flex-1">
            <Progress value={(userXP / 1000) * 100} className="h-2" />
          </div>
        </div>
      </div>

      {/* Difficulty Cards */}
      <div className="grid gap-6 max-w-5xl mx-auto">
        {difficultyLevels.map((level, index) => {
          const Icon = level.icon
          const isSelected = selectedDifficulty === level.id
          const isLocked = level.locked && userXP < level.xpRequired
          const canUnlock = userXP >= level.xpRequired

          return (
            <Card
              key={level.id}
              className={`
                group relative overflow-hidden transition-all duration-500 ease-out cursor-pointer
                ${
                  isSelected
                    ? `bg-gradient-to-r ${level.gradient} shadow-2xl scale-105 border-transparent`
                    : isLocked
                      ? "bg-slate-800/20 border-slate-700/30 opacity-60"
                      : "bg-slate-800/40 hover:bg-slate-700/60 border-slate-600/30 hover:border-slate-500/50 hover:scale-102"
                }
                hover:shadow-2xl backdrop-blur-sm
              `}
              style={{
                animationDelay: `${index * 150}ms`,
                animation: `slideInRight 0.6s ease-out ${index * 150}ms both`,
              }}
              onClick={() => handleDifficultySelect(level.id, isLocked)}
            >
              {/* Background Effects */}
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r ${level.gradient} 
                  ${isSelected ? "opacity-100" : isLocked ? "opacity-5" : "opacity-0 group-hover:opacity-10"} 
                  transition-opacity duration-500
                `}
              />

              {/* Lock Overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Lock className="h-12 w-12 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-slate-300 font-semibold">Requires {level.xpRequired} XP</p>
                      <p className="text-slate-400 text-sm">You need {level.xpRequired - userXP} more XP to unlock</p>
                    </div>
                  </div>
                </div>
              )}

              <CardContent className="relative p-8">
                <div className="flex items-start gap-6">
                  {/* Icon and Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
                        ${
                          isSelected
                            ? "bg-white/20 shadow-2xl scale-110"
                            : isLocked
                              ? "bg-slate-700/50"
                              : `bg-gradient-to-br ${level.gradient} shadow-lg group-hover:scale-110 group-hover:rotate-12`
                        }
                      `}
                    >
                      <Icon
                        className={`
                          h-8 w-8 transition-all duration-500
                          ${isSelected ? "text-white" : isLocked ? "text-slate-400" : "text-white"}
                        `}
                      />
                    </div>

                    {/* XP Badge */}
                    <div className="mt-3 text-center">
                      <Badge
                        variant="outline"
                        className={`
                          text-xs transition-all duration-300
                          ${
                            isSelected
                              ? "border-white/30 text-white/80"
                              : isLocked
                                ? "border-slate-600/50 text-slate-500"
                                : "border-slate-500/50 text-slate-400"
                          }
                        `}
                      >
                        {level.xpRequired} XP
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className={`
                            text-2xl font-bold transition-all duration-300
                            ${
                              isSelected
                                ? "text-white"
                                : isLocked
                                  ? "text-slate-400"
                                  : `${level.color} group-hover:text-white`
                            }
                          `}
                        >
                          {level.name}
                        </h3>
                        <p
                          className={`
                            text-sm mt-1 transition-all duration-300
                            ${
                              isSelected
                                ? "text-white/90"
                                : isLocked
                                  ? "text-slate-500"
                                  : "text-slate-400 group-hover:text-slate-300"
                            }
                          `}
                        >
                          {level.description}
                        </p>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-6 w-6 text-white animate-bounce" />
                          <span className="text-white font-semibold text-sm">Selected</span>
                        </div>
                      )}

                      {/* Unlock Progress */}
                      {isLocked && !canUnlock && (
                        <div className="text-right">
                          <div className="w-24">
                            <Progress value={(userXP / level.xpRequired) * 100} className="h-1" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {Math.round((userXP / level.xpRequired) * 100)}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`
                          p-3 rounded-lg transition-all duration-300
                          ${
                            isSelected
                              ? "bg-white/10"
                              : isLocked
                                ? "bg-slate-800/30"
                                : "bg-slate-800/30 group-hover:bg-slate-700/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp
                            className={`
                              h-4 w-4 
                              ${isSelected ? "text-white/80" : isLocked ? "text-slate-500" : "text-slate-400"}
                            `}
                          />
                          <span
                            className={`
                              text-xs font-medium
                              ${isSelected ? "text-white/80" : isLocked ? "text-slate-500" : "text-slate-400"}
                            `}
                          >
                            Questions
                          </span>
                        </div>
                        <p
                          className={`
                            font-bold
                            ${isSelected ? "text-white" : isLocked ? "text-slate-400" : level.color}
                          `}
                        >
                          {level.questionCount}
                        </p>
                      </div>

                      <div
                        className={`
                          p-3 rounded-lg transition-all duration-300
                          ${
                            isSelected
                              ? "bg-white/10"
                              : isLocked
                                ? "bg-slate-800/30"
                                : "bg-slate-800/30 group-hover:bg-slate-700/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Award
                            className={`
                              h-4 w-4 
                              ${isSelected ? "text-white/80" : isLocked ? "text-slate-500" : "text-slate-400"}
                            `}
                          />
                          <span
                            className={`
                              text-xs font-medium
                              ${isSelected ? "text-white/80" : isLocked ? "text-slate-500" : "text-slate-400"}
                            `}
                          >
                            Duration
                          </span>
                        </div>
                        <p
                          className={`
                            font-bold
                            ${isSelected ? "text-white" : isLocked ? "text-slate-400" : level.color}
                          `}
                        >
                          {level.estimatedTime}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <p
                        className={`
                          text-xs font-medium mb-2
                          ${isSelected ? "text-white/70" : isLocked ? "text-slate-500" : "text-slate-500"}
                        `}
                      >
                        What you'll get:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {level.features.map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className={`
                              text-xs transition-all duration-300
                              ${
                                isSelected
                                  ? "border-white/30 text-white/80"
                                  : isLocked
                                    ? "border-slate-600/30 text-slate-500"
                                    : "border-slate-500/50 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-300"
                              }
                            `}
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                {!isLocked && (
                  <div
                    className={`
                      absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
                    `}
                  />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-slate-400 text-sm leading-relaxed">
          💡 <strong>Tip:</strong> Start with Beginner if you're new to the subject, or jump to your comfort level. Earn
          XP by completing quizzes to unlock higher difficulty levels!
        </p>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
