import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
    case "beginner":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
    case "medium":
    case "intermediate":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20"
    case "hard":
    case "advanced":
    case "expert":
    case "master":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
  }
}

export function getSubjectColor(subject: string): string {
  const colors = {
    mathematics: "bg-blue-500",
    science: "bg-green-500",
    history: "bg-purple-500",
    literature: "bg-pink-500",
    geography: "bg-teal-500",
    physics: "bg-indigo-500",
    chemistry: "bg-orange-500",
    biology: "bg-emerald-500",
    english: "bg-rose-500",
    computer: "bg-cyan-500",
  }

  const key = subject.toLowerCase().replace(/\s+/g, "")
  return colors[key as keyof typeof colors] || "bg-gray-500"
}

export function calculateGrade(score: number): string {
  if (score >= 90) return "A+"
  if (score >= 85) return "A"
  if (score >= 80) return "A-"
  if (score >= 75) return "B+"
  if (score >= 70) return "B"
  if (score >= 65) return "B-"
  if (score >= 60) return "C+"
  if (score >= 55) return "C"
  if (score >= 50) return "C-"
  return "F"
}

export function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-green-600 dark:text-green-400"
  if (grade.startsWith("B")) return "text-blue-600 dark:text-blue-400"
  if (grade.startsWith("C")) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

export function parseQuizResults(results: any[]) {
  return results.map((result, index) => ({
    id: result.id || index,
    question: result.question,
    userAnswer: result.userAnswer,
    correctAnswer: result.correctAnswer,
    isCorrect: result.userAnswer === result.correctAnswer,
    explanation: result.explanation,
    timeSpent: result.timeSpent || 0,
  }))
}

export function calculateQuizStats(results: any[]) {
  const totalQuestions = results.length
  const correctAnswers = results.filter((r) => r.isCorrect).length
  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
  const totalTime = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0)
  const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    score: Math.round(score * 10) / 10,
    grade: calculateGrade(score),
    totalTime,
    averageTime: Math.round(averageTime),
  }
}
