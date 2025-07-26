export interface UserPerformance {
  category: string
  correctAnswers: number
  totalAnswers: number
  averageTime: number
  difficulty: "beginner" | "intermediate" | "advanced"
  lastAttempt: Date
}

export interface Question {
  id: string
  category: string
  question: string
  options: string[]
  correct_answer: number
  difficulty: "beginner" | "intermediate" | "advanced"
  explanation: string
  points: number
}

export class AdaptiveLearning {
  static calculateSkillLevel(performance: UserPerformance): "beginner" | "intermediate" | "advanced" {
    const accuracy = performance.correctAnswers / performance.totalAnswers

    if (accuracy >= 0.8 && performance.totalAnswers >= 10) {
      return "advanced"
    } else if (accuracy >= 0.6 && performance.totalAnswers >= 5) {
      return "intermediate"
    }
    return "beginner"
  }

  static selectQuestions(
    allQuestions: Question[],
    userLevel: "beginner" | "intermediate" | "advanced",
    count = 10,
  ): Question[] {
    // Filter questions based on user level
    let filteredQuestions = allQuestions.filter((q) => {
      if (userLevel === "beginner") {
        return q.difficulty === "beginner" || q.difficulty === "intermediate"
      } else if (userLevel === "intermediate") {
        return q.difficulty === "intermediate" || q.difficulty === "advanced"
      } else {
        return q.difficulty === "advanced" || q.difficulty === "intermediate"
      }
    })

    // If not enough questions, include all difficulties
    if (filteredQuestions.length < count) {
      filteredQuestions = allQuestions
    }

    // Shuffle and return requested count
    return this.shuffleArray(filteredQuestions).slice(0, count)
  }

  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  static calculateXP(
    correctAnswers: number,
    totalQuestions: number,
    difficulty: "beginner" | "intermediate" | "advanced",
    timeBonus = 0,
  ): number {
    const basePoints = correctAnswers * 10
    const difficultyMultiplier = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2,
    }

    return Math.round(basePoints * difficultyMultiplier[difficulty] + timeBonus)
  }

  static getRecommendations(performance: UserPerformance): string[] {
    const accuracy = performance.correctAnswers / performance.totalAnswers
    const recommendations: string[] = []

    if (accuracy < 0.5) {
      recommendations.push("Focus on fundamental concepts")
      recommendations.push("Try easier questions first")
      recommendations.push("Review explanations carefully")
    } else if (accuracy < 0.7) {
      recommendations.push("Practice more intermediate questions")
      recommendations.push("Work on timing")
      recommendations.push("Review incorrect answers")
    } else {
      recommendations.push("Challenge yourself with advanced topics")
      recommendations.push("Try timed quizzes")
      recommendations.push("Explore related subjects")
    }

    return recommendations
  }
}
