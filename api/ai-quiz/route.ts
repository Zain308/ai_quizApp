import { type NextRequest, NextResponse } from "next/server"
import { AIQuestionGenerator } from "@/lib/ai-question-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, topic, difficulty, count = 10 } = body

    if (!subject || !difficulty) {
      return NextResponse.json({ error: "Subject and difficulty are required" }, { status: 400 })
    }

    if (difficulty < 1 || difficulty > 5) {
      return NextResponse.json({ error: "Difficulty must be between 1 and 5" }, { status: 400 })
    }

    const questions = await AIQuestionGenerator.generateQuestions({
      subject,
      topic,
      difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
      count: Math.min(count, 15), // Limit to 15 questions max
    })

    return NextResponse.json({
      questions,
      subject,
      topic,
      difficulty,
      total: questions.length,
    })
  } catch (error) {
    console.error("AI Quiz Generation Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quiz" },
      { status: 500 },
    )
  }
}
