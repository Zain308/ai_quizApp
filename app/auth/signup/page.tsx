"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Loader2, Check, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const supabase = createClient()

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    Object.values(checks).forEach((check) => {
      if (check) strength += 20
    })

    return { strength, checks }
  }

  const { strength, checks } = getPasswordStrength(password)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (strength < 60) {
      setError("Password is too weak. Please meet the requirements.")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
        toast.error(error.message)
      } else {
        toast.success("Account created! Please check your email to verify your account.")
        router.push("/auth/login")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error("Failed to sign up with Google")
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-red-500"
    if (strength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength < 40) return "Weak"
    if (strength < 80) return "Medium"
    return "Strong"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">Create Account</CardTitle>
          <CardDescription>Join AI Quiz Master and start learning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 glass"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 glass"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 glass"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Password strength</span>
                    <span
                      className={`font-medium ${strength >= 80 ? "text-green-400" : strength >= 40 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {getStrengthText(strength)}
                    </span>
                  </div>
                  <Progress value={strength} className={`h-1 ${getStrengthColor(strength)}`} />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`flex items-center space-x-1 ${checks.length ? "text-green-400" : "text-slate-400"}`}
                    >
                      {checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${checks.uppercase ? "text-green-400" : "text-slate-400"}`}
                    >
                      {checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Uppercase</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${checks.lowercase ? "text-green-400" : "text-slate-400"}`}
                    >
                      {checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Lowercase</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${checks.number ? "text-green-400" : "text-slate-400"}`}
                    >
                      {checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 glass"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            <Button type="submit" className="w-full btn-hover" disabled={loading || strength < 60}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={handleGoogleSignUp} className="w-full glass bg-transparent">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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

          <div className="text-center text-sm">
            <span className="text-slate-400">Already have an account? </span>
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
