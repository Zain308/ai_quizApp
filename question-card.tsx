"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react"

interface QuestionCardProps {
  question: string
  options: string[]
  selectedAnswer: string | null
  correctAnswer: string
  showResult: boolean
  onAnswerSelect: (answer: string) => void
  onNext: () => void
  isLastQuestion: boolean
}

export function QuestionCard({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  showResult,
  onAnswerSelect,
  onNext,
  isLastQuestion,
}: QuestionCardProps) {
  const [timeLeft, setTimeLeft] = useState(30)
  const [isTimeUp, setIsTimeUp] = useState(false)

  useEffect(() => {
    if (showResult || isTimeUp) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showResult, isTimeUp])

  useEffect(() => {
    // Reset timer when question changes
    setTimeLeft(30)
    setIsTimeUp(false)
  }, [question])

  useEffect(() => {
    // Auto-submit when time is up
    if (isTimeUp && !showResult && selectedAnswer) {
      onNext()
    }
  }, [isTimeUp, showResult, selectedAnswer, onNext])

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option
        ? "bg-gradient-to-r from-violet-500/20 to-purple-600/20 border-violet-400/50 text-white"
        : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30"
    }

    if (option === correctAnswer) {
      return "bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-green-400/50 text-green-100"
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return "bg-gradient-to-r from-red-500/20 to-pink-600/20 border-red-400/50 text-red-100"
    }

    return "bg-white/5 border-white/20 text-gray-400"
  }

  const getOptionIcon = (option: string) => {
    if (!showResult) return null

    if (option === correctAnswer) {
      return <CheckCircle className="w-5 h-5 text-green-400" />
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return <XCircle className="w-5 h-5 text-red-400" />
    }

    return null
  }

  const getTimeColor = () => {
    if (timeLeft > 20) return "text-green-400"
    if (timeLeft > 10) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Timer */}
            <div className="flex items-center justify-center mb-6">
              <Badge className="bg-black/40 border-white/20 px-4 py-2">
                <Clock className={`w-4 h-4 mr-2 ${getTimeColor()}`} />
                <span className={`font-mono text-lg ${getTimeColor()}`}>
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
                </span>
              </Badge>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">{question}</h2>
            </div>

            {/* Options */}
            <div className="grid gap-4 mb-8">
              <AnimatePresence>
                {options.map((option, index) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => !showResult && !isTimeUp && onAnswerSelect(option)}
                    disabled={showResult || isTimeUp}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${getOptionStyle(
                      option,
                    )} ${!showResult && !isTimeUp ? "hover:scale-[1.02] cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                            selectedAnswer === option && !showResult
                              ? "border-violet-400 bg-violet-500/20 text-violet-300"
                              : "border-gray-400 text-gray-400"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg font-medium">{option}</span>
                      </div>
                      {getOptionIcon(option)}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Action Button */}
            <div className="text-center">
              {showResult ? (
                <Button
                  onClick={onNext}
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold group"
                >
                  {isLastQuestion ? "Complete Quiz" : "Next Question"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  onClick={onNext}
                  disabled={!selectedAnswer || isTimeUp}
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  Submit Answer
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>

            {/* Time Up Message */}
            {isTimeUp && !showResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
                <Badge className="bg-red-500/20 border-red-400/50 text-red-200 px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Time's up! {selectedAnswer ? "Submitting your answer..." : "No answer selected"}
                </Badge>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
