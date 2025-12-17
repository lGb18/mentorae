import { useParams, Outlet, useLocation } from "react-router-dom"
import CoursePage from "@/components/course-page"

export default function CoursePageWrapper() {
  const { subjectName, subjectId } = useParams<{ subjectName: string; subjectId: string }>()
  const location = useLocation()
  
  // Check if we're on a nested route
  const isNestedRoute = location.pathname.includes('/quizzes')

  if (!subjectName || !subjectId) return <p>Invalid subject</p>

  return (
    <>
      {/* Only show main content when NOT on nested routes */}
      {!isNestedRoute && (
        <CoursePage subject={subjectName} subjectId={subjectId} />
      )}
      
      {/* Nested routes render here */}
      <Outlet />
    </>
  )
}