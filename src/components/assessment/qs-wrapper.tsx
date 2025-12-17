import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import QuizScoreboard from "@/components/assessment/quiz-scoreboard"

export default function QuizScoreboardWrapper() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()

  if (!quizId) return null

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <QuizScoreboard
        quizId={quizId}
        onBack={() => navigate(-1)}
      />
    </div>
  )
}