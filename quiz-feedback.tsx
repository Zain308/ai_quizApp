"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ArrowRight, Zap, Trophy } from "lucide-react"

interface QuizFeedbackProps {
  isCorrect: boolean
  isVisible: boolean
  correctAnswer: string
  selectedAnswer: string
  onNext: () => void
  streak: number
  xpEarned: number
}

export function QuizFeedback({
  isCorrect,
  isVisible,
  correctAnswer,
  selectedAnswer,
  onNext,
  streak,
  xpEarned,
}: QuizFeedbackProps) {
  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card
            className={`border-2 backdrop-blur-sm ${
              isCorrect
                ? "bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/50"
                : "bg-gradient-to-br from-red-500/20 to-pink-600/20 border-red-400/50"
            }`}
          >
            <CardContent className="p-8 text-center">
              {/* Icon */}
              <div className="mb-6">
                {isCorrect ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto"
                  >
                    <XCircle className="w-10 h-10 text-white" />
                  </motion.div>
                )}
              </div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-3xl font-bold mb-4 ${isCorrect ? "text-green-100" : "text-red-100"}`}
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </motion.h3>

              {/* Answer Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6 space-y-3"
              >
                {!isCorrect && (
                  <div className="bg-black/20 rounded-xl p-4">
                    <p className="text-gray-300 text-sm mb-2">Your answer:</p>
                    <p className="text-red-200 font-medium">{selectedAnswer}</p>
                  </div>
                )}
                <div className="bg-black/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-2">Correct answer:</p>
                  <p className="text-green-200 font-medium">{correctAnswer}</p>
                </div>
              </motion.div>

              {/* Stats */}
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center space-x-4 mb-6"
                >
                  {xpEarned > 0 && (
                    <Badge className="bg-yellow-500/20 border-yellow-400/50 text-yellow-200 px-3 py-2">
                      <Zap className="w-4 h-4 mr-1" />+{xpEarned} XP
                    </Badge>
                  )}
                  {streak > 1 && (
                    <Badge className="bg-orange-500/20 border-orange-400/50 text-orange-200 px-3 py-2">
                      <Trophy className="w-4 h-4 mr-1" />
                      {streak} Streak!
                    </Badge>
                  )}
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Button
                  onClick={onNext}
                  size="lg"
                  className={`w-full py-4 rounded-2xl text-lg font-semibold group ${
                    isCorrect
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  } text-white`}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
