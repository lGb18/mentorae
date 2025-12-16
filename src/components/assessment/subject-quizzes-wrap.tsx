import { useParams } from "react-router-dom"
import SubjectQuizzesTab from "@/components/assessment/subject-quizzes-tab"
import { useAuth } from "@/hooks/useAuth"

export default function SubjectQuizzesTabWrapper() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { user, profile } = useAuth()
  const userRole = profile?.role
  if (!subjectId || !user) return null

  return (
    <SubjectQuizzesTab
      subjectId={subjectId}
      isTutor={userRole === "teacher"}
    />
  )
}
