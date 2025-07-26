// Demo mode check
export const isDemoMode = typeof window !== "undefined" && localStorage.getItem("demoMode") === "true"

// Fallback demo credentials for development/demo
const DEMO_SUPABASE_URL = "https://demo.supabase.co"
const DEMO_SUPABASE_ANON_KEY = "demo-key-for-development"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEMO_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEMO_SUPABASE_ANON_KEY

// Mock Supabase client for demo mode
const createMockClient = () => ({
  auth: {
    getUser: async () => ({
      data: { user: { id: "demo-user", email: "demo@example.com" } },
      error: null,
    }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === "demo@example.com" && password === "demo123") {
        return {
          data: { user: { id: "demo-user", email: "demo@example.com" } },
          error: null,
        }
      }
      return {
        data: { user: null },
        error: { message: "Invalid credentials. Try demo@example.com / demo123" },
      }
    },
    signUp: async ({ email, password }: { email: string; password: string }) => ({
      data: { user: { id: "demo-user", email } },
      error: null,
    }),
    signInWithOAuth: async ({ provider }: { provider: string }) => ({
      data: { user: { id: "demo-user", email: "demo@example.com" } },
      error: null,
    }),
    signOut: async () => ({
      error: null,
    }),
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Mock auth state change
      setTimeout(() => {
        callback("SIGNED_IN", { user: { id: "demo-user", email: "demo@example.com" } })
      }, 100)

      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }
    },
  },
})

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  if (isDemoMode) {
    return createMockClient()
  }

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
