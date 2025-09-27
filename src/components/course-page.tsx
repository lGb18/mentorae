import { useParams } from "react-router-dom"

interface CoursePageProps {
  subject: string
}

export default function CoursePage({ subject }: CoursePageProps) {
 
  const gradeLevel = "Grade 8"

  
  const hasContent = false

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{subject} - {gradeLevel}</h1>
      
      {hasContent ? (
        <div>
          {/* later: render fetched Quill content */}
          <p>subject content…</p>
        </div>
      ) : (
        <div className="text-gray-500 italic">
          No content available for this subject yet.
        </div>
      )}
    </div>
  )
}
