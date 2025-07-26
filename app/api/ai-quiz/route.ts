import { type NextRequest, NextResponse } from "next/server"
import { generateQuestions } from "@/lib/ai-question-generator"
import { getSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const supabase = await getSupabaseClient()

    // Get the quiz session
    const { data: session, error: sessionError } = await supabase
      .from("quiz_sessions")
      .select(`
        *,
        subjects (name, category)
      `)
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Quiz session not found" }, { status: 404 })
    }

    // Check if questions already exist
    if (session.questions && Array.isArray(session.questions) && session.questions.length > 0) {
      return NextResponse.json({ questions: session.questions })
    }

    // Generate new questions
    const questions = await generateQuestions({
      subject: session.subjects.name,
      difficulty: session.difficulty,
      count: session.total_questions,
    })

    // Update the session with generated questions
    const { error: updateError } = await supabase.from("quiz_sessions").update({ questions }).eq("id", sessionId)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ error: "Failed to save questions" }, { status: 500 })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error in AI quiz route:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
