"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  BookOpen,
  Calculator,
  Code,
  Database,
  Globe,
  Brain,
  Microscope,
  Clock,
  MapPin,
  Cpu,
  Monitor,
  Star,
  Filter,
  X,
} from "lucide-react"

interface Subject {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  popularity: number
  gradient: string
  hoverGradient: string
  prerequisites?: string[]
  topics: string[]
}

const subjects: Subject[] = [
  {
    id: "english",
    name: "English",
    description: "Grammar, literature, writing skills, and language comprehension",
    icon: BookOpen,
    category: "Language Arts",
    difficulty: "Beginner",
    popularity: 95,
    gradient: "from-blue-500 to-indigo-500",
    hoverGradient: "from-blue-600 to-indigo-600",
    topics: ["Grammar", "Literature", "Writing", "Reading Comprehension"],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Algebra, geometry, calculus, and mathematical problem solving",
    icon: Calculator,
    category: "STEM",
    difficulty: "Intermediate",
    popularity: 90,
    gradient: "from-green-500 to-emerald-500",
    hoverGradient: "from-green-600 to-emerald-600",
    topics: ["Algebra", "Geometry", "Calculus", "Statistics"],
  },
  {
    id: "data-structures",
    name: "Data Structures",
    description: "Arrays, linked lists, trees, graphs, and algorithmic thinking",
    icon: Database,
    category: "Computer Science",
    difficulty: "Advanced",
    popularity: 85,
    gradient: "from-purple-500 to-violet-500",
    hoverGradient: "from-purple-600 to-violet-600",
    prerequisites: ["Programming Basics"],
    topics: ["Arrays", "Trees", "Graphs", "Hash Tables"],
  },
  {
    id: "algorithms",
    name: "Algorithms",
    description: "Sorting, searching, optimization, and computational complexity",
    icon: Code,
    category: "Computer Science",
    difficulty: "Advanced",
    popularity: 80,
    gradient: "from-orange-500 to-red-500",
    hoverGradient: "from-orange-600 to-red-600",
    prerequisites: ["Data Structures"],
    topics: ["Sorting", "Searching", "Dynamic Programming", "Graph Algorithms"],
  },
  {
    id: "web-development",
    name: "Web Development",
    description: "HTML, CSS, JavaScript, React, and modern web technologies",
    icon: Globe,
    category: "Technology",
    difficulty: "Intermediate",
    popularity: 88,
    gradient: "from-cyan-500 to-blue-500",
    hoverGradient: "from-cyan-600 to-blue-600",
    topics: ["HTML/CSS", "JavaScript", "React", "Node.js"],
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    description: "Neural networks, deep learning, AI algorithms, and data science",
    icon: Brain,
    category: "AI & Data Science",
    difficulty: "Advanced",
    popularity: 75,
    gradient: "from-pink-500 to-rose-500",
    hoverGradient: "from-pink-600 to-rose-600",
    prerequisites: ["Mathematics", "Programming"],
    topics: ["Neural Networks", "Deep Learning", "Classification", "Regression"],
  },
  {
    id: "database-systems",
    name: "Database Systems",
    description: "SQL, NoSQL, database design, and data management principles",
    icon: Database,
    category: "Computer Science",
    difficulty: "Intermediate",
    popularity: 70,
    gradient: "from-teal-500 to-cyan-500",
    hoverGradient: "from-teal-600 to-cyan-600",
    topics: ["SQL", "NoSQL", "Database Design", "Transactions"],
  },
  {
    id: "operating-systems",
    name: "Operating Systems",
    description: "Process management, memory allocation, and system architecture",
    icon: Monitor,
    category: "Computer Science",
    difficulty: "Advanced",
    popularity: 65,
    gradient: "from-slate-500 to-gray-500",
    hoverGradient: "from-slate-600 to-gray-600",
    prerequisites: ["Computer Architecture"],
    topics: ["Processes", "Memory Management", "File Systems", "Concurrency"],
  },
  {
    id: "science",
    name: "Science",
    description: "Physics, chemistry, biology, and scientific methodology",
    icon: Microscope,
    category: "Natural Sciences",
    difficulty: "Intermediate",
    popularity: 78,
    gradient: "from-emerald-500 to-teal-500",
    hoverGradient: "from-emerald-600 to-teal-600",
    topics: ["Physics", "Chemistry", "Biology", "Scientific Method"],
  },
  {
    id: "history",
    name: "History",
    description: "World history, historical events, and cultural developments",
    icon: Clock,
    category: "Social Studies",
    difficulty: "Beginner",
    popularity: 72,
    gradient: "from-amber-500 to-orange-500",
    hoverGradient: "from-amber-600 to-orange-600",
    topics: ["World History", "Ancient Civilizations", "Modern History", "Cultural Studies"],
  },
  {
    id: "geography",
    name: "Geography",
    description: "Countries, capitals, physical features, and global awareness",
    icon: MapPin,
    category: "Social Studies",
    difficulty: "Beginner",
    popularity: 68,
    gradient: "from-lime-500 to-green-500",
    hoverGradient: "from-lime-600 to-green-600",
    topics: ["World Geography", "Physical Geography", "Political Geography", "Climate"],
  },
  {
    id: "computer-architecture",
    name: "Computer Architecture",
    description: "CPU design, memory systems, and hardware-software interaction",
    icon: Cpu,
    category: "Computer Science",
    difficulty: "Advanced",
    popularity: 60,
    gradient: "from-indigo-500 to-purple-500",
    hoverGradient: "from-indigo-600 to-purple-600",
    topics: ["CPU Design", "Memory Hierarchy", "Instruction Sets", "Performance"],
  },
]

const categories = [
  "All",
  "Computer Science",
  "STEM",
  "Language Arts",
  "Natural Sciences",
  "Social Studies",
  "Technology",
  "AI & Data Science",
]

interface SubjectSelectorProps {
  selectedSubject: string
  onSubjectSelect: (subject: string) => void
}

export function SubjectSelector({ selectedSubject, onSubjectSelect }: SubjectSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.topics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "All" || subject.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 blur-3xl rounded-full"></div>
          <div className="relative flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl shadow-lg animate-pulse">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Choose Your Subject
            </h2>
          </div>
        </div>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select from popular subjects or search for your custom topic
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search subjects, topics, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-12 h-14 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 text-lg"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`
                transition-all duration-300 hover:scale-105
                ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent shadow-lg"
                    : "border-slate-600 text-slate-300 hover:border-violet-400 hover:text-white bg-slate-800/30"
                }
              `}
            >
              <Filter className="h-3 w-3 mr-1" />
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {(searchTerm || selectedCategory !== "All") && (
        <div className="text-center">
          <p className="text-slate-400">
            Found {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? "s" : ""}
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>
      )}

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredSubjects.map((subject, index) => {
          const Icon = subject.icon
          const isSelected = selectedSubject === subject.id

          return (
            <Card
              key={subject.id}
              className={`
                group relative overflow-hidden cursor-pointer transition-all duration-500 ease-out
                ${
                  isSelected
                    ? `bg-gradient-to-br ${subject.gradient} shadow-2xl scale-105 border-transparent`
                    : "bg-slate-800/40 hover:bg-slate-700/60 border-slate-600/30 hover:border-slate-500/50 hover:scale-105"
                }
                hover:shadow-2xl backdrop-blur-sm min-h-[320px]
              `}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: `fadeInUp 0.6s ease-out ${index * 100}ms both`,
              }}
              onClick={() => onSubjectSelect(subject.id)}
            >
              {/* Background Effects */}
              <div
                className={`
                  absolute inset-0 bg-gradient-to-br ${subject.gradient} 
                  ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-10"} 
                  transition-opacity duration-500
                `}
              />

              {/* Animated Border */}
              <div
                className={`
                  absolute inset-0 rounded-lg bg-gradient-to-r ${subject.gradient} 
                  opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500
                `}
              />

              <CardContent className="relative p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`
                      p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12
                      ${isSelected ? "bg-white/20 shadow-xl" : `bg-gradient-to-br ${subject.gradient} shadow-lg`}
                    `}
                  >
                    <Icon
                      className={`
                        h-6 w-6 transition-all duration-500
                        ${isSelected ? "text-white" : "text-white"}
                      `}
                    />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={`
                        text-xs transition-all duration-300
                        ${isSelected ? "border-white/30 text-white/80" : "border-slate-500/50 text-slate-400"}
                      `}
                    >
                      {subject.difficulty}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className={`text-xs ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                        {subject.popularity}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-3 mb-4 flex-1">
                  <h3
                    className={`
                      text-xl font-bold transition-all duration-300 line-clamp-1
                      ${isSelected ? "text-white" : "text-slate-200 group-hover:text-white"}
                    `}
                  >
                    {subject.name}
                  </h3>

                  <p
                    className={`
                      text-sm leading-relaxed transition-all duration-300 line-clamp-3
                      ${isSelected ? "text-white/90" : "text-slate-400 group-hover:text-slate-300"}
                    `}
                  >
                    {subject.description}
                  </p>
                </div>

                {/* Prerequisites */}
                {subject.prerequisites && (
                  <div className="mb-4">
                    <p className={`text-xs mb-2 ${isSelected ? "text-white/70" : "text-slate-500"}`}>Prerequisites:</p>
                    <div className="flex flex-wrap gap-1">
                      {subject.prerequisites.map((prereq, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className={`
                            text-xs transition-all duration-300
                            ${
                              isSelected
                                ? "bg-white/10 text-white/80 border-white/20"
                                : "bg-slate-700/50 text-slate-400 border-slate-600"
                            }
                          `}
                        >
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics */}
                <div className="space-y-2">
                  <p className={`text-xs font-medium ${isSelected ? "text-white/70" : "text-slate-500"}`}>
                    Topics covered:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {subject.topics.slice(0, 4).map((topic, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={`
                          text-xs transition-all duration-300
                          ${
                            isSelected
                              ? "border-white/30 text-white/80"
                              : "border-slate-500/50 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-300"
                          }
                        `}
                      >
                        {topic}
                      </Badge>
                    ))}
                    {subject.topics.length > 4 && (
                      <Badge
                        variant="outline"
                        className={`
                          text-xs transition-all duration-300
                          ${isSelected ? "border-white/30 text-white/80" : "border-slate-500/50 text-slate-400"}
                        `}
                      >
                        +{subject.topics.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mt-4 pt-3 border-t border-slate-600/30">
                  <Badge
                    className={`
                      text-xs transition-all duration-300
                      ${isSelected ? "bg-white/10 text-white/80" : "bg-slate-700/50 text-slate-400"}
                    `}
                  >
                    {subject.category}
                  </Badge>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-bounce">
                      <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
                    </div>
                  </div>
                )}

                {/* Hover Effect */}
                <div
                  className={`
                    absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
                  `}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Results */}
      {filteredSubjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No subjects found</h3>
          <p className="text-slate-400 mb-4">Try adjusting your search terms or category filter</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("All")
            }}
            className="border-slate-600 text-slate-300 hover:border-violet-400 hover:text-white"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
