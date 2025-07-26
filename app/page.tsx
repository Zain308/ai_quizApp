"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Trophy, Users, Zap, ArrowRight, Star, Target, BookOpen } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export default function HomePage() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if Supabase is configured
    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "" && supabaseAnonKey !== "") {
      setIsConfigured(true)

      // Create Supabase client and check for user
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
      })
    }
  }, [])

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-2">🔧 Setup Required</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Please configure your environment variables to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-red-200 font-semibold mb-2">Missing Configuration:</h3>
              <ul className="text-red-100 space-y-1">
                <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>• GEMINI_API_KEY</li>
              </ul>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-200 font-semibold mb-2">Setup Steps:</h3>
              <ol className="text-blue-100 space-y-2 list-decimal list-inside">
                <li>
                  Create a <code className="bg-black/30 px-2 py-1 rounded">.env.local</code> file in your project root
                </li>
                <li>Add your Supabase project URL and anon key</li>
                <li>Add your Gemini API key</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">AI-Powered Learning</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Master Any Subject with
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                AI Quizzes
              </span>
            </h1>

            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Experience personalized learning with AI-generated quizzes that adapt to your knowledge level. Track
              progress, earn achievements, and unlock new challenges as you master over 30+ subjects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Continue Learning
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Learning Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}

              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose AI Quiz Master?</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Our advanced AI creates personalized learning experiences that adapt to your unique learning style and pace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <Brain className="w-12 h-12 text-purple-400 mb-4" />
              <CardTitle className="text-white text-xl">AI-Generated Questions</CardTitle>
              <CardDescription className="text-white/70">
                Fresh, unique questions generated by advanced AI for every quiz session
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <Target className="w-12 h-12 text-blue-400 mb-4" />
              <CardTitle className="text-white text-xl">Adaptive Learning</CardTitle>
              <CardDescription className="text-white/70">
                Difficulty adjusts based on your performance to optimize learning
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <BookOpen className="w-12 h-12 text-green-400 mb-4" />
              <CardTitle className="text-white text-xl">30+ Subjects</CardTitle>
              <CardDescription className="text-white/70">
                From mathematics to history, master any subject you're passionate about
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white text-xl">Gamification</CardTitle>
              <CardDescription className="text-white/70">
                Earn XP, unlock achievements, and compete on leaderboards
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <Users className="w-12 h-12 text-pink-400 mb-4" />
              <CardTitle className="text-white text-xl">Progress Tracking</CardTitle>
              <CardDescription className="text-white/70">
                Detailed analytics and insights into your learning journey
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <Star className="w-12 h-12 text-orange-400 mb-4" />
              <CardTitle className="text-white text-xl">Instant Feedback</CardTitle>
              <CardDescription className="text-white/70">
                Get immediate explanations and learn from every question
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-white/70">Questions Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">30+</div>
              <div className="text-white/70">Subject Areas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-white/70">Learning Improvement</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">Ready to Transform Your Learning?</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Join thousands of learners who have already discovered the power of AI-driven education.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 AI Quiz Master. Powered by advanced AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
