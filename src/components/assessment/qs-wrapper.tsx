import { useParams, useNavigate } from "react-router-dom"
import QuizScoreboard from "@/components/assessment/quiz-scoreboard"

export default function QuizScoreboardWrapper() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()

  if (!quizId) return null

  return (
    <QuizScoreboard
      quizId={quizId}
      onBack={() => navigate("../quizzes")}
    />
  )
}
