"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EnvStatus {
  supabaseUrl: boolean
  supabaseAnonKey: boolean
  geminiApiKey: boolean
}

export function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<EnvStatus>({
    supabaseUrl: false,
    supabaseAnonKey: false,
    geminiApiKey: false,
  })

  useEffect(() => {
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      geminiApiKey: !!process.env.GEMINI_API_KEY,
    })
  }, [])

  const allConfigured = Object.values(envStatus).every(Boolean)

  if (allConfigured) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            Environment Configuration Required
          </CardTitle>
          <CardDescription className="text-slate-400">
            Some environment variables are missing. Please configure them to use the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {envStatus.supabaseUrl ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-slate-300">NEXT_PUBLIC_SUPABASE_URL</span>
            </div>

            <div className="flex items-center gap-3">
              {envStatus.supabaseAnonKey ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-slate-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            </div>

            <div className="flex items-center gap-3">
              {envStatus.geminiApiKey ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-slate-300">GEMINI_API_KEY</span>
            </div>
          </div>

          <Alert className="border-blue-500/50 bg-blue-500/10">
            <AlertDescription className="text-blue-300">
              <strong>Setup Instructions:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Create a Supabase project and get your URL and anon key</li>
                <li>Run the database setup script in your Supabase SQL editor</li>
                <li>Add your Gemini API key for AI question generation</li>
                <li>Create a .env.local file with these variables</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Supabase Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://makersuite.google.com/app/apikey", "_blank")}
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get Gemini API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
