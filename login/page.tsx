"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, AlertCircle, Info, Brain, ArrowLeft, Play } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    localStorage.setItem("demoMode", "true")
    localStorage.setItem("demoAttempts", "5")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="floating-orb w-[400px] h-[400px] -top-40 -left-40 bg-gradient-to-br from-violet-500/20 to-purple-600/10 blur-3xl animate-float-slow"></div>
        <div
          className="floating-orb w-[300px] h-[300px] -bottom-20 -right-20 bg-gradient-to-br from-blue-500/20 to-indigo-600/10 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <ArrowLeft className="w-5 h-5 text-white" />
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">QuizMaster AI</h1>
                    <p className="text-xs text-purple-200">AI-Powered Learning Platform</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-md space-y-6">
            {/* Demo Info Card */}
            <Alert className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-amber-400/30 backdrop-blur-sm">
              <Info className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-200">
                <div className="space-y-1">
                  <p className="font-medium">Try Demo Mode</p>
                  <p className="text-sm">Use: demo@example.com / demo123 or click demo button</p>
                </div>
              </AlertDescription>
            </Alert>

            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-white">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-center text-purple-200">
                  {isSignUp ? "Sign up to start your learning journey" : "Sign in to continue your learning journey"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="bg-red-500/20 border-red-400/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Demo Mode Button */}
                <Button
                  onClick={handleDemoMode}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Try Demo Mode (5 Free Tests)
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gradient-to-br from-white/10 to-white/5 px-2 text-purple-200">
                      Or continue with account
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gradient-to-br from-white/10 to-white/5 px-2 text-purple-200">
                      Or with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-purple-200">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-300" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="demo@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-purple-300 focus:border-violet-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-purple-200">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-300" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="demo123"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-purple-300 focus:border-violet-400"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-purple-300 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    disabled={loading}
                  >
                    {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-violet-400 hover:text-violet-300 underline"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
