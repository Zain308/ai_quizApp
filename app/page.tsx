import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Trophy, Users, ArrowRight, Play, Sparkles, Target, Clock, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">AI Quiz Master</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:text-purple-300">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Learning Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Any Subject with
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              AI Quizzes
            </span>
          </h1>

          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Experience personalized learning with AI-generated quizzes that adapt to your knowledge level. Track
            progress, compete with friends, and master subjects faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Try Demo Now
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-white/60 mt-4">🚀 No signup required for demo • Full access to all features</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose AI Quiz Master?</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Our AI-powered platform revolutionizes learning with personalized quizzes and intelligent feedback
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">AI-Generated Questions</CardTitle>
              <CardDescription className="text-white/70">
                Get unlimited, unique questions powered by advanced AI that adapts to your learning style
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <Target className="h-12 w-12 text-green-400 mb-4" />
              <CardTitle className="text-white">Adaptive Difficulty</CardTitle>
              <CardDescription className="text-white/70">
                Questions automatically adjust to your skill level for optimal learning progression
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <Trophy className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Progress Tracking</CardTitle>
              <CardDescription className="text-white/70">
                Detailed analytics and insights to monitor your learning journey and achievements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <Clock className="h-12 w-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">Timed Challenges</CardTitle>
              <CardDescription className="text-white/70">
                Test your knowledge under pressure with customizable time limits and instant feedback
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <Users className="h-12 w-12 text-pink-400 mb-4" />
              <CardTitle className="text-white">Social Learning</CardTitle>
              <CardDescription className="text-white/70">
                Compete with friends, share achievements, and learn together in a social environment
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <Award className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle className="text-white">Achievements</CardTitle>
              <CardDescription className="text-white/70">
                Unlock badges, maintain streaks, and celebrate milestones in your learning journey
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8">
            <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
            <div className="text-white/70">Questions Generated</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8">
            <div className="text-4xl font-bold text-green-400 mb-2">500+</div>
            <div className="text-white/70">Active Learners</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8">
            <div className="text-4xl font-bold text-blue-400 mb-2">15+</div>
            <div className="text-white/70">Subject Areas</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8">
            <div className="text-4xl font-bold text-pink-400 mb-2">95%</div>
            <div className="text-white/70">Success Rate</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/10">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already mastering new subjects with AI Quiz Master. Start your journey
            today!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Try Demo (No Signup)
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 text-lg"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Brain className="h-6 w-6 text-purple-400" />
            <span className="text-lg font-semibold text-white">AI Quiz Master</span>
          </div>
          <div className="text-white/60 text-sm">© 2024 AI Quiz Master. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
