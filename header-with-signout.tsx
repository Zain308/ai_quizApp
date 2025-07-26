"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, LogOut, Settings, Trophy, Brain, Zap } from "lucide-react"

export default function HeaderWithSignout() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      // Clear any local storage data
      localStorage.clear()

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">QuizMaster Pro</h1>
            <p className="text-xs text-purple-200">Adaptive Learning Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-white hover:text-purple-200 hover:bg-white/10"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="ghost" className="text-white hover:text-purple-200 hover:bg-white/10">
            <Zap className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
        </nav>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-purple-400">
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white/10 backdrop-blur-sm border-white/20 text-white" align="end">
            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
              <Trophy className="mr-2 h-4 w-4" />
              <span>Achievements</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={isLoading}
              className="hover:bg-red-500/20 cursor-pointer text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoading ? "Signing out..." : "Sign out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
