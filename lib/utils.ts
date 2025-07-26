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

export function calculateXP(score: number, difficulty: string): number {
  const baseXP = score * 10
  const difficultyMultiplier = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
  }
  return Math.round(baseXP * (difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1))
}

export function getLevel(totalXP: number): number {
  return Math.floor(totalXP / 1000) + 1
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = getLevel(currentXP)
  return currentLevel * 1000 - currentXP
}
