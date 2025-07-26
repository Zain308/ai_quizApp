interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: string
  topic: string
}

interface QuizConfig {
  subject: string
  topic: string
  difficulty: "easy" | "medium" | "hard"
  questionCount: number
}

export class AIQuestionGenerator {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateQuestions(config: QuizConfig): Promise<Question[]> {
    try {
      const prompt = this.buildPrompt(config)

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error("No content generated")
      }

      return this.parseQuestions(generatedText, config)
    } catch (error) {
      console.error("Error generating questions:", error)
      return this.getFallbackQuestions(config)
    }
  }

  private buildPrompt(config: QuizConfig): string {
    return `Generate ${config.questionCount} multiple choice questions about ${config.subject} - ${config.topic} at ${config.difficulty} difficulty level.

Format each question as JSON with this exact structure:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0,
  "explanation": "Brief explanation of the correct answer",
  "difficulty": "${config.difficulty}",
  "topic": "${config.topic}"
}

Return only a JSON array of questions, no additional text or formatting.`
  }

  private parseQuestions(text: string, config: QuizConfig): Question[] {
    try {
      // Clean the text to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("No JSON array found in response")
      }

      const questions = JSON.parse(jsonMatch[0])

      return questions.map((q: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        question: q.question || "Sample question",
        options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
        correct_answer: typeof q.correct_answer === "number" ? q.correct_answer : 0,
        explanation: q.explanation || "No explanation provided",
        difficulty: config.difficulty,
        topic: config.topic,
      }))
    } catch (error) {
      console.error("Error parsing questions:", error)
      return this.getFallbackQuestions(config)
    }
  }

  private getFallbackQuestions(config: QuizConfig): Question[] {
    const fallbackQuestions = [
      {
        id: "1",
        question: `What is a fundamental concept in ${config.subject}?`,
        options: ["Concept A", "Concept B", "Concept C", "Concept D"],
        correct_answer: 0,
        explanation: "This is a basic concept in the subject.",
        difficulty: config.difficulty,
        topic: config.topic,
      },
      {
        id: "2",
        question: `Which principle applies to ${config.topic}?`,
        options: ["Principle A", "Principle B", "Principle C", "Principle D"],
        correct_answer: 1,
        explanation: "This principle is commonly used in this topic.",
        difficulty: config.difficulty,
        topic: config.topic,
      },
    ]

    return fallbackQuestions.slice(0, config.questionCount)
  }
}

export async function generateQuestions(config: QuizConfig): Promise<Question[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const generator = new AIQuestionGenerator(apiKey)
  return generator.generateQuestions(config)
}
