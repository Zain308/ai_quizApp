import { GoogleGenerativeAI } from "@google/generative-ai"

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface QuizGenerationOptions {
  subject: string
  topic: string
  difficulty: "easy" | "medium" | "hard"
  questionCount: number
}

export class AIQuestionGenerator {
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateQuiz(options: QuizGenerationOptions): Promise<QuizQuestion[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Generate ${options.questionCount} multiple choice questions about ${options.topic} in ${options.subject} at ${options.difficulty} difficulty level.

For each question, provide:
1. A clear, well-written question
2. 4 multiple choice options (A, B, C, D)
3. The correct answer (0-3 index)
4. A brief explanation of why the answer is correct

Format the response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation here"
  }
]

Make sure the questions are educational, accurate, and appropriate for the ${options.difficulty} difficulty level.`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Clean up the response to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("Invalid response format from AI")
      }

      const questions = JSON.parse(jsonMatch[0])

      // Validate the response structure
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array")
      }

      return questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))
    } catch (error) {
      console.error("Error generating quiz:", error)
      throw new Error("Failed to generate quiz questions")
    }
  }
}
