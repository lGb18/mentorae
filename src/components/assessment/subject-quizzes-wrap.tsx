import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import SubjectQuizzesTab from "@/components/assessment/subject-quizzes-tab"
import { useAuth } from "@/hooks/useAuth"

export default function SubjectQuizzesTabWrapper() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  
  const isTutor = profile?.role === "teacher"
  
  if (!subjectId || !user) {
    return <div className="p-6">Access denied</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Button>
      
      <SubjectQuizzesTab
        subjectId={subjectId}
        isTutor={isTutor}
      />
    </div>
  )
}