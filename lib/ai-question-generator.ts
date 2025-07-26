import { GoogleGenerativeAI } from "@google/generative-ai"

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: string
  subject: string
}

export interface GenerateQuestionsParams {
  subject: string
  difficulty: string
  count: number
  topic?: string
}

export async function generateQuestions({
  subject,
  difficulty,
  count,
  topic,
}: GenerateQuestionsParams): Promise<Question[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const difficultyDescriptions = {
    beginner: "Basic concepts and fundamental knowledge",
    intermediate: "Moderate complexity requiring some experience",
    advanced: "Complex topics requiring deep understanding",
    expert: "Highly specialized knowledge and critical thinking",
    master: "Expert-level mastery with advanced applications",
  }

  const prompt = `Generate ${count} multiple choice questions for ${subject}${topic ? ` focusing on ${topic}` : ""} at ${difficulty} level (${difficultyDescriptions[difficulty as keyof typeof difficultyDescriptions]}).

Requirements:
- Each question should have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Include detailed explanations for the correct answer
- Questions should be challenging but fair for the ${difficulty} level
- Avoid ambiguous or trick questions
- Cover different aspects of the subject

Return the response as a valid JSON array with this exact structure:
[
  {
    "id": "unique_id_1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "${difficulty}",
    "subject": "${subject}"
  }
]

Make sure the JSON is valid and properly formatted. The correctAnswer should be the index (0-3) of the correct option in the options array.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean the response to extract JSON
    let jsonText = text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/, "").replace(/\n?```$/, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/, "").replace(/\n?```$/, "")
    }

    // Parse the JSON
    const questions = JSON.parse(jsonText)

    // Validate and ensure proper structure
    const validatedQuestions = questions.map((q: any, index: number) => ({
      id: q.id || `q_${Date.now()}_${index}`,
      question: q.question || "",
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
      correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
      explanation: q.explanation || "",
      difficulty: difficulty,
      subject: subject,
    }))

    return validatedQuestions.filter((q: Question) => q.question && q.options.length === 4 && q.explanation)
  } catch (error) {
    console.error("Error generating questions:", error)

    // Fallback questions if AI generation fails
    return generateFallbackQuestions(subject, difficulty, count)
  }
}

function generateFallbackQuestions(subject: string, difficulty: string, count: number): Question[] {
  const fallbackQuestions: Question[] = [
    {
      id: `fallback_1`,
      question: `What is a fundamental concept in ${subject}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "This is a basic concept that forms the foundation of the subject.",
      difficulty,
      subject,
    },
  ]

  return Array(count)
    .fill(null)
    .map((_, index) => ({
      ...fallbackQuestions[0],
      id: `fallback_${index + 1}`,
      question: `${subject} question ${index + 1} (${difficulty} level)`,
    }))
}

export class AIQuestionGenerator {
  static async generateQuestions(params: GenerateQuestionsParams): Promise<Question[]> {
    return generateQuestions(params)
  }
}
