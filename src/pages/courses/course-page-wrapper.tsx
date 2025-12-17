import { useParams, Outlet, useLocation, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import CoursePage from "@/components/course-page"

export default function CoursePageWrapper() {
  const { subjectName, subjectId } = useParams<{ subjectName: string; subjectId: string }>()
  const { profile } = useAuth()
  const location = useLocation()
  
  // Check if we're on a nested route
  const isNestedRoute = location.pathname.includes('/quizzes')

  if (!subjectName || !subjectId) {
    return <div className="p-6">Invalid subject</div>
  }

  // Check if user has access to this course
  // Teachers: can access their own subjects
  // Students: can access subjects from matched tutors
  const hasAccess = true // You should implement proper access check here

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <>
      {/* Only show main content when NOT on nested routes */}
      {!isNestedRoute && (
        <CoursePage 
          subject={subjectName} 
          subjectId={subjectId}
        />
      )}
      
      {/* Nested routes render here */}
      <Outlet />
    </>
  )
}