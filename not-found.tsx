import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-blue-600 mb-4">404</CardTitle>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>The page you're looking for doesn't exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
