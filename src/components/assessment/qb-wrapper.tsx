import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import QuizBuilder from "@/components/assessment/quiz-builder"
import { useAuth } from "@/hooks/useAuth"

export default function QuizBuilderWrapper() {
  const { subjectId, quizId } = useParams<{ subjectId: string; quizId?: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!subjectId || !user) return null

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
      
      <QuizBuilder
        tutorId={user.id}
        subjectId={subjectId}
        gradeLevel="Grade 1"
        quizId={quizId}
        onSaved={() => navigate(-1)}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}