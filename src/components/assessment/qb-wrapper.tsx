import { useParams, useNavigate } from "react-router-dom"
import QuizBuilder from "@/components/assessment/quiz-builder"
import { useAuth } from "@/hooks/useAuth"

export default function QuizBuilderWrapper() {
  const { subjectId, quizId } = useParams<{ subjectId: string; quizId?: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!subjectId || !user) return null

  return (
    <QuizBuilder
      tutorId={user.id}
      subjectId={subjectId}
      gradeLevel="Grade 1"
      quizId={quizId}
      onSaved={() => navigate("../quizzes")}
      onCancel={() => navigate("../quizzes")}
    />
  )
}
