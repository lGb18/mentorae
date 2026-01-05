import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { AssessmentAttemptsPanel } from "@/components/assessment/attempts-panel"
import { LessonProgressViewer } from "@/components/course-progress"
import { toast } from "sonner"
import { profile } from "node:console"
import { SendClassReminderButton } from "./notifications/reminder-button"

type SubjectRow = {
  subject_id: string
  subjects: {
    id: string
    name: string
  }[]
}

type StudentProfile = {
  id: string
  display_name: string
  email: string
}

export function TutorStudentProgressPage() {
  const { studentId, gradeLevel } = useParams<{
    studentId: string
    gradeLevel: string
  }>()

  const navigate = useNavigate()

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [loading, setLoading] = useState(true)

  // Guard: invalid route
  if (!studentId || !gradeLevel) {
    return (
      <p className="p-6 text-sm text-gray-500">
        Invalid progress page
      </p>
    )
  }

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [{ data: studentData }, { data: matches }] =
        await Promise.all([
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
      setSubjects((matches as SubjectRow[]) ?? [])
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

  // Student no longer exists / unmatched
  if (!student) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-sm text-gray-600 mb-3">
          Student not found or no longer enrolled.
        </p>

        <button
          onClick={() => navigate("/tutor/progress")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
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
          No active subjects for this student.
        </p>
      )}

      {subjects.map((row) => {
        const subject = row.subjects[0]
        if (!subject) return null

        return (
          <div
            key={subject.id}
            className="bg-white border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {subject.name}
              </h2>

              <SendClassReminderButton
                studentId={student.id}
                subjectName={subject.name} tutorName={""}              />
            </div>

            <LessonProgressViewer
              studentId={student.id}
              subjectId={subject.id}
              gradeLevel={gradeLevel}
            />
          </div>
        )
      })}
    </div>
  )
}