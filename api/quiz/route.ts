import { type NextRequest, NextResponse } from "next/server"
import { AdaptiveLearning, type Question } from "@/lib/adaptive-learning"

// Sample quiz data with gamified elements
const quizData: Record<string, Question[]> = {
  javascript: [
    {
      id: "js1",
      category: "javascript",
      question: "What is the correct way to declare a variable in JavaScript ES6?",
      options: ['var name = "John"', 'let name = "John"', 'const name = "John"', "All of the above"],
      correct_answer: 3,
      difficulty: "beginner",
      explanation: "All three are valid ways to declare variables in JavaScript, each with different scoping rules.",
      points: 10,
    },
    {
      id: "js2",
      category: "javascript",
      question: "Which method is used to add an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correct_answer: 0,
      difficulty: "beginner",
      explanation: "The push() method adds one or more elements to the end of an array.",
      points: 10,
    },
    {
      id: "js3",
      category: "javascript",
      question: 'What does the "this" keyword refer to in JavaScript?',
      options: [
        "The current function",
        "The global object",
        "The object that owns the method",
        "It depends on the context",
      ],
      correct_answer: 3,
      difficulty: "intermediate",
      explanation:
        'The "this" keyword refers to different objects depending on how it is used and the context in which it appears.',
      points: 15,
    },
    {
      id: "js4",
      category: "javascript",
      question: "What is a closure in JavaScript?",
      options: [
        "A function inside another function",
        "A way to close a program",
        "A function that has access to outer scope variables",
        "A method to hide variables",
      ],
      correct_answer: 2,
      difficulty: "advanced",
      explanation:
        "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.",
      points: 20,
    },
    {
      id: "js5",
      category: "javascript",
      question: "Which of the following is NOT a primitive data type in JavaScript?",
      options: ["string", "number", "object", "boolean"],
      correct_answer: 2,
      difficulty: "beginner",
      explanation:
        "Object is not a primitive data type. The primitive types are: string, number, boolean, undefined, null, symbol, and bigint.",
      points: 10,
    },
  ],
  react: [
    {
      id: "react1",
      category: "react",
      question: "What is JSX in React?",
      options: ["A JavaScript library", "A syntax extension for JavaScript", "A CSS framework", "A database"],
      correct_answer: 1,
      difficulty: "beginner",
      explanation:
        "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.",
      points: 10,
    },
    {
      id: "react2",
      category: "react",
      question: "Which hook is used to manage state in functional components?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correct_answer: 1,
      difficulty: "beginner",
      explanation: "useState is the primary hook for managing state in functional components.",
      points: 10,
    },
    {
      id: "react3",
      category: "react",
      question: "What is the purpose of useEffect hook?",
      options: ["To manage state", "To handle side effects", "To create components", "To style components"],
      correct_answer: 1,
      difficulty: "intermediate",
      explanation:
        "useEffect is used to handle side effects like API calls, subscriptions, or manually changing the DOM.",
      points: 15,
    },
    {
      id: "react4",
      category: "react",
      question: "What is the virtual DOM?",
      options: ["A real DOM element", "A JavaScript representation of the real DOM", "A CSS framework", "A database"],
      correct_answer: 1,
      difficulty: "intermediate",
      explanation:
        "The virtual DOM is a JavaScript representation of the real DOM that React uses to optimize rendering.",
      points: 15,
    },
    {
      id: "react5",
      category: "react",
      question: "How do you pass data from parent to child component?",
      options: ["Using state", "Using props", "Using context", "Using refs"],
      correct_answer: 1,
      difficulty: "beginner",
      explanation: "Props are used to pass data from parent components to child components.",
      points: 10,
    },
  ],
  python: [
    {
      id: "py1",
      category: "python",
      question: "Which of the following is the correct way to create a list in Python?",
      options: ["list = []", "list = ()", "list = {}", "All of the above"],
      correct_answer: 0,
      difficulty: "beginner",
      explanation:
        "Square brackets [] are used to create lists in Python. () creates tuples and {} creates dictionaries.",
      points: 10,
    },
    {
      id: "py2",
      category: "python",
      question: "What is the output of print(type([]))?",
      options: ['<class "list">', '<class "array">', '<class "tuple">', '<class "dict">'],
      correct_answer: 0,
      difficulty: "beginner",
      explanation:
        'The type() function returns the class type of the object. [] creates a list, so it returns <class "list">.',
      points: 10,
    },
    {
      id: "py3",
      category: "python",
      question: "What is a lambda function in Python?",
      options: ["A named function", "An anonymous function", "A class method", "A built-in function"],
      correct_answer: 1,
      difficulty: "intermediate",
      explanation:
        "Lambda functions are anonymous functions that can have any number of arguments but can only have one expression.",
      points: 15,
    },
    {
      id: "py4",
      category: "python",
      question: "What is the difference between a list and a tuple?",
      options: [
        "Lists are mutable, tuples are immutable",
        "Lists are immutable, tuples are mutable",
        "No difference",
        "Lists are faster",
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      explanation: "Lists are mutable (can be changed) while tuples are immutable (cannot be changed after creation).",
      points: 15,
    },
    {
      id: "py5",
      category: "python",
      question: 'What does the "self" parameter represent in Python classes?',
      options: ["The class itself", "The instance of the class", "A global variable", "A function parameter"],
      correct_answer: 1,
      difficulty: "intermediate",
      explanation:
        'The "self" parameter refers to the instance of the class and is used to access variables and methods of that instance.',
      points: 15,
    },
  ],
  nodejs: [
    {
      id: "node1",
      category: "nodejs",
      question: "What is Node.js?",
      options: ["A JavaScript framework", "A JavaScript runtime environment", "A database", "A web browser"],
      correct_answer: 1,
      difficulty: "beginner",
      explanation: "Node.js is a JavaScript runtime environment that allows you to run JavaScript on the server side.",
      points: 10,
    },
    {
      id: "node2",
      category: "nodejs",
      question: "Which module is used to create a web server in Node.js?",
      options: ["fs", "http", "path", "url"],
      correct_answer: 1,
      difficulty: "beginner",
      explanation: "The http module is used to create HTTP servers and clients in Node.js.",
      points: 10,
    },
    {
      id: "node3",
      category: "nodejs",
      question: "What is npm?",
      options: ["Node Package Manager", "Node Programming Module", "Node Process Manager", "Node Project Manager"],
      correct_answer: 0,
      difficulty: "beginner",
      explanation:
        "npm stands for Node Package Manager and is used to install and manage packages for Node.js projects.",
      points: 10,
    },
    {
      id: "node4",
      category: "nodejs",
      question: "What is the purpose of package.json?",
      options: [
        "To store user data",
        "To configure the project and manage dependencies",
        "To store passwords",
        "To create databases",
      ],
      correct_answer: 1,
      difficulty: "intermediate",
      explanation:
        "package.json contains metadata about the project and manages dependencies, scripts, and other project configurations.",
      points: 15,
    },
    {
      id: "node5",
      category: "nodejs",
      question: "What is middleware in Express.js?",
      options: [
        "A database layer",
        "Functions that execute during the request-response cycle",
        "A templating engine",
        "A routing system",
      ],
      correct_answer: 1,
      difficulty: "intermediate",
      explanation:
        "Middleware functions are functions that have access to the request and response objects and can execute code during the request-response cycle.",
      points: 15,
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty") as "beginner" | "intermediate" | "advanced" | null
    const count = Number.parseInt(searchParams.get("count") || "10")

    if (!category || !quizData[category]) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    let questions = quizData[category]

    // Apply adaptive learning if difficulty is specified
    if (difficulty) {
      questions = AdaptiveLearning.selectQuestions(questions, difficulty, count)
    } else {
      // Default selection
      questions = AdaptiveLearning.shuffleArray(questions).slice(0, count)
    }

    return NextResponse.json({
      questions,
      category,
      total: questions.length,
    })
  } catch (error) {
    console.error("Quiz API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers, category, timeSpent } = body

    if (!answers || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const questions = quizData[category] || []
    let correctAnswers = 0
    const results = []

    for (let i = 0; i < answers.length; i++) {
      const question = questions[i]
      const userAnswer = answers[i]
      const isCorrect = userAnswer === question?.correct_answer

      if (isCorrect) correctAnswers++

      results.push({
        questionId: question?.id,
        question: question?.question,
        userAnswer,
        correctAnswer: question?.correct_answer,
        isCorrect,
        explanation: question?.explanation,
        points: isCorrect ? question?.points || 10 : 0,
      })
    }

    const accuracy = correctAnswers / answers.length
    const totalPoints = results.reduce((sum, result) => sum + result.points, 0)

    // Calculate time bonus
    const averageTimePerQuestion = timeSpent / answers.length
    const timeBonus = averageTimePerQuestion < 30 ? Math.round((30 - averageTimePerQuestion) * 2) : 0

    const finalScore = totalPoints + timeBonus

    return NextResponse.json({
      results,
      summary: {
        correctAnswers,
        totalQuestions: answers.length,
        accuracy: Math.round(accuracy * 100),
        totalPoints,
        timeBonus,
        finalScore,
        timeSpent,
        grade: accuracy >= 0.8 ? "A" : accuracy >= 0.6 ? "B" : accuracy >= 0.4 ? "C" : "D",
      },
    })
  } catch (error) {
    console.error("Quiz submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
