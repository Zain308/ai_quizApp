import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Copy } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Setup Guide</h1>
          <p className="text-gray-600">Follow these steps to configure your Quiz Generator</p>
        </div>

        <div className="grid gap-6">
          {/* Step 1: Supabase Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Create Supabase Project
              </CardTitle>
              <CardDescription>Set up your database and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Go to{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Create a new project</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Go to Settings → API to get your credentials</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 2: Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Configure Environment Variables
              </CardTitle>
              <CardDescription>Create a .env.local file in your project root</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Copy this template:</span>
                  <Button size="sm" variant="outline" className="h-6 px-2 bg-transparent">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="text-gray-700">
                  {`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here`}
                </pre>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Note:</strong> Replace the placeholder values with your actual credentials from Supabase and
                  Google AI Studio.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Database Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Set Up Database
              </CardTitle>
              <CardDescription>Run the SQL script to create necessary tables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Go to your Supabase project dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Navigate to SQL Editor</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Run the SQL script from <code>scripts/schema.sql</code>
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 4: Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </span>
                Test Your Setup
              </CardTitle>
              <CardDescription>Verify everything is working correctly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Link href="/login">
                  <Button>Test Login Page</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
