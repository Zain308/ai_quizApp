import { type NextRequest, NextResponse } from "next/server"

const testQuestions = [
  {
    id: 1,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correct: 1,
    explanation: "2 + 2 equals 4, which is basic arithmetic.",
  },
  {
    id: 2,
    question: "What color do you get when you mix red and blue?",
    options: ["Green", "Purple", "Orange", "Yellow"],
    correct: 1,
    explanation: "Red and blue combine to make purple.",
  },
  {
    id: 3,
    question: "How many days are in a week?",
    options: ["5", "6", "7", "8"],
    correct: 2,
    explanation: "There are 7 days in a week: Monday through Sunday.",
  },
  {
    id: 4,
    question: "What is the opposite of hot?",
    options: ["Warm", "Cool", "Cold", "Freezing"],
    correct: 2,
    explanation: "Cold is the direct opposite of hot in terms of temperature.",
  },
  {
    id: 5,
    question: "Which animal says 'meow'?",
    options: ["Dog", "Cat", "Bird", "Fish"],
    correct: 1,
    explanation: "Cats are known for making the 'meow' sound.",
  },
]

export async function GET() {
  try {
    // Return test questions without correct answers
    const questions = testQuestions.map(({ correct, explanation, ...question }) => question)

    return NextResponse.json({
      questions,
      total: questions.length,
    })
  } catch (error) {
    console.error("Test quiz API error:", error)
    return NextResponse.json({ error: "Failed to fetch test questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers } = body

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers format" }, { status: 400 })
    }

    // Calculate score
    let correctCount = 0
    const results = answers.map((answer, index) => {
      const question = testQuestions[index]
      const isCorrect = answer === question.correct
      if (isCorrect) correctCount++

      return {
        questionId: question.id,
        question: question.question,
        options: question.options,
        userAnswer: answer,
        correctAnswer: question.correct,
        isCorrect,
        explanation: question.explanation,
      }
    })

    const score = Math.round((correctCount / answers.length) * 100)

    return NextResponse.json({
      score,
      correctCount,
      totalQuestions: answers.length,
      results,
    })
  } catch (error) {
    console.error("Test quiz submission error:", error)
    return NextResponse.json({ error: "Failed to process test submission" }, { status: 500 })
  }
}
