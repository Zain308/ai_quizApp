import { createServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user progress from database
    const { data: progress, error } = await supabase.from("user_progress").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
    }

    // If no progress exists, create default progress
    if (!progress) {
      const defaultProgress = {
        user_id: user.id,
        total_tests: 0,
        correct_answers: 0,
        average_score: 0,
        streak: 0,
        last_test_date: null,
      }

      const { data: newProgress, error: insertError } = await supabase
        .from("user_progress")
        .insert(defaultProgress)
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: "Failed to create progress" }, { status: 500 })
      }

      return NextResponse.json(newProgress)
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Progress API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { score, totalQuestions, timeSpent } = body

    // Update user progress
    const { data: currentProgress } = await supabase.from("user_progress").select("*").eq("user_id", user.id).single()

    const correctAnswers = Math.round((score / 100) * totalQuestions)
    const newTotalTests = (currentProgress?.total_tests || 0) + 1
    const newTotalCorrect = (currentProgress?.correct_answers || 0) + correctAnswers
    const newAverageScore = Math.round((newTotalCorrect / (newTotalTests * totalQuestions)) * 100)

    const updatedProgress = {
      total_tests: newTotalTests,
      correct_answers: newTotalCorrect,
      average_score: newAverageScore,
      last_test_date: new Date().toISOString(),
      streak: score >= 70 ? (currentProgress?.streak || 0) + 1 : 0,
    }

    const { data, error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: user.id,
        ...updatedProgress,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Progress update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
