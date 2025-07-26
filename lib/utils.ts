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

export function calculateScore(correct: number, total: number): number {
  return Math.round((correct / total) * 100)
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "text-green-600"
    case "intermediate":
      return "text-yellow-600"
    case "advanced":
      return "text-orange-600"
    case "expert":
      return "text-red-600"
    case "master":
      return "text-purple-600"
    default:
      return "text-gray-600"
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  if (score >= 60) return "text-orange-600"
  return "text-red-600"
}
