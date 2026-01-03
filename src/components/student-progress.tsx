import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { AssessmentAttemptsPanel } from "@/components/assessment/attempts-panel"
import { LessonProgressViewer } from "@/components/course-progress"
import { toast } from "sonner"

export function TutorStudentProgressPage() {
  const { studentId, gradeLevel } = useParams()
  const navigate = useNavigate()

  const [student, setStudent] = useState<any | null>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!studentId || !gradeLevel) return

      setLoading(true)

      const [{ data: studentData }, { data: matches }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, email")
          .eq("id", studentId)
          .maybeSingle(),

        supabase
          .from("matches")
          .select(`
            subject_id,
            subjects (
              id,
              name
            )
          `)
          .eq("student_id", studentId)
          .eq("grade_level", gradeLevel)
          .eq("status", "active"),
      ])

      setStudent(studentData)
      setSubjects(matches ?? [])
      setLoading(false)
    }

    load()
  }, [studentId, gradeLevel])

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading student progress…
      </div>
    )
  }

  if (student === null) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <p className="text-sm text-gray-600 mb-2">
        Student not found or no longer enrolled.
      </p>

      <p className="text-xs text-gray-400 mb-4">
        Redirecting back to the course page…
      </p>

      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Course
      </button>
    </div>
  )
}


  if (!studentId || !gradeLevel) {
  return (
    <p className="text-sm text-gray-500">
      Invalid progress page
    </p>
  )
}

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {student.display_name}
          </h1>
          <p className="text-sm text-gray-600">
            Grade {gradeLevel}
          </p>
        </div>

        <button
          onClick={() => navigate("/tutor/progress")}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Subjects */}
      {subjects.length === 0 && (
        <p className="text-sm text-gray-500">
          No active subjects
        </p>
      )}

      {subjects.map((s) => (
        <div
          key={s.subjects.id}
          className="bg-white border rounded-lg p-4"
        >
          <h2 className="text-lg font-semibold mb-3">
            {s.subjects.name}
          </h2>
           <LessonProgressViewer
            studentId={studentId}
            subjectId={s.subjects.id}
            gradeLevel={gradeLevel}
          />
          
        </div>
      ))}
    </div>
  )
}
