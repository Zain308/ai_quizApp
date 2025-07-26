"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy } from "lucide-react"

interface EnvStatus {
  supabaseUrl: {
    exists: boolean
    valid: boolean
    isPlaceholder: boolean
    value: string
  }
  supabaseKey: {
    exists: boolean
    valid: boolean
    isPlaceholder: boolean
    value: string
  }
  geminiKey: {
    exists: boolean
    valid: boolean
    isPlaceholder: boolean
    value: string
  }
}

export function SetupStatus() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    const geminiKey = process.env.GEMINI_API_KEY || ""

    const placeholderValues = [
      "your_supabase_project_url_here",
      "your_supabase_anon_key_here",
      "your-project-id.supabase.co",
      "https://your-project-id.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here",
      "AIzaSyYour-Gemini-API-Key-Here",
      "your-gemini-api-key-here",
    ]

    const isPlaceholder = (value: string) =>
      placeholderValues.some((placeholder) => value.includes(placeholder) || placeholder.includes(value))

    const isValidSupabaseUrl = (url: string) => {
      try {
        const urlObj = new URL(url)
        return urlObj.protocol === "https:" && urlObj.hostname.includes("supabase.co")
      } catch {
        return false
      }
    }

    setEnvStatus({
      supabaseUrl: {
        exists: !!supabaseUrl,
        valid: isValidSupabaseUrl(supabaseUrl),
        isPlaceholder: isPlaceholder(supabaseUrl),
        value: supabaseUrl,
      },
      supabaseKey: {
        exists: !!supabaseKey,
        valid: supabaseKey.length > 50 && supabaseKey.startsWith("eyJ"),
        isPlaceholder: isPlaceholder(supabaseKey),
        value: supabaseKey,
      },
      geminiKey: {
        exists: !!geminiKey,
        valid: geminiKey.startsWith("AIzaSy") && geminiKey.length > 30,
        isPlaceholder: isPlaceholder(geminiKey),
        value: geminiKey,
      },
    })
  }, [])

  if (!envStatus) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const getStatusBadge = (item: { exists: boolean; valid: boolean; isPlaceholder: boolean }) => {
    if (!item.exists) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Missing
        </Badge>
      )
    }
    if (item.isPlaceholder) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Placeholder
        </Badge>
      )
    }
    if (item.valid) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Valid
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Invalid
      </Badge>
    )
  }

  const allConfigured =
    envStatus.supabaseUrl.valid &&
    envStatus.supabaseKey.valid &&
    envStatus.geminiKey.valid &&
    !envStatus.supabaseUrl.isPlaceholder &&
    !envStatus.supabaseKey.isPlaceholder &&
    !envStatus.geminiKey.isPlaceholder

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className={allConfigured ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            Environment Configuration Status
          </CardTitle>
          <CardDescription>
            {allConfigured
              ? "All environment variables are properly configured!"
              : "Some environment variables need to be configured."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <span className="font-medium">Supabase URL</span>
                <div className="text-sm text-gray-500 font-mono">{envStatus.supabaseUrl.value || "Not set"}</div>
              </div>
              {getStatusBadge(envStatus.supabaseUrl)}
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <span className="font-medium">Supabase Anon Key</span>
                <div className="text-sm text-gray-500 font-mono">
                  {envStatus.supabaseKey.value ? `${envStatus.supabaseKey.value.substring(0, 20)}...` : "Not set"}
                </div>
              </div>
              {getStatusBadge(envStatus.supabaseKey)}
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <span className="font-medium">Gemini API Key</span>
                <div className="text-sm text-gray-500 font-mono">
                  {envStatus.geminiKey.value ? `${envStatus.geminiKey.value.substring(0, 20)}...` : "Not set"}
                </div>
              </div>
              {getStatusBadge(envStatus.geminiKey)}
            </div>
          </div>

          {!allConfigured && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Quick Setup Instructions:</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-blue-700 mb-2">
                    1. Create/update your <code>.env.local</code> file:
                  </p>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm relative">
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 h-6 px-2 bg-transparent"
                      onClick={() =>
                        copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here`)
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <pre className="text-gray-700 pr-16">
                      {`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here`}
                    </pre>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700 mb-2">2. Get Supabase credentials:</p>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                        Open Supabase Dashboard <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm text-blue-700 mb-2">3. Get Gemini API key:</p>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                        Get Gemini API Key <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-blue-700">4. Restart your development server after updating the file.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
