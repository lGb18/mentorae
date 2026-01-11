import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { AssessmentAttemptsPanel } from "@/components/assessment/attempts-panel"
import { LessonProgressViewer } from "@/components/course-progress"
import { toast } from "sonner"
import { profile } from "node:console"
import { SendClassReminderButton } from "./notifications/reminder-button"
import { endMatch } from "@/hooks/end-match"

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
  const [hasActiveExtension, setHasActiveExtension] = useState(false)

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [loading, setLoading] = useState(true)

  async function handleEndMatch() {
    if (!studentId) return
    if (hasActiveExtension) return

    const { error } = await supabase
      .from("matches")
      .update({ status: "completed" })
      .eq("student_id", studentId)
      .eq("grade_level", gradeLevel)
      .eq("status", "active")

    if (error) {
      console.error(error)
      alert("Failed to end match")
      return
    }

    alert("Match ended successfully")
    navigate("/tutor/progress")
  }

  if (!studentId || !gradeLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="border border-gray-200 rounded-lg p-8 max-w-md text-center bg-white">
          <p className="text-sm text-gray-500">Invalid progress page</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: extension } = await supabase
        .from("tutor_extensions")
        .select("id")
        .eq("student_id", studentId)
        .eq("grade_level", gradeLevel)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle()

      setHasActiveExtension(!!extension)

      const { data: studentData } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .eq("id", studentId)
        .maybeSingle()

      setStudent(studentData)

      if (!studentData) {
        setSubjects([])
        setLoading(false)
        return
      }

      const { data: matches } = await supabase
        .from("matches")
        .select("subject")
        .eq("student_id", studentId)
        .eq("grade_level", gradeLevel)
        .eq("status", "active")

      if (!matches || matches.length === 0) {
        setSubjects([])
        setLoading(false)
        return
      }

      const subjectNames = matches.map((m) => m.subject)

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("id, name")
        .in("name", subjectNames)

      const rows: SubjectRow[] =
        subjectsData?.map((s) => ({
          subject_id: s.id,
          subjects: [s],
        })) ?? []

      setSubjects(rows)
      setLoading(false)
    }

    load()
  }, [studentId, gradeLevel])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="border border-gray-200 rounded-lg p-8 max-w-sm text-center bg-white">
          <div className="inline-block h-5 w-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Loading student progress…</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md border border-gray-200 rounded-lg p-8 bg-white space-y-4">
          <div className="text-center">
            <div className="text-gray-300 text-4xl mb-3">∅</div>
            <p className="text-sm text-gray-500">
              Student not found or no longer enrolled.
            </p>
          </div>
          <button
            onClick={() => navigate("/tutor/progress")}
            className="w-full text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        {/* Header Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {student.display_name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Grade {gradeLevel}</p>
            </div>

            <button
              onClick={() => navigate("/tutor/progress")}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
          </header>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleEndMatch}
                disabled={hasActiveExtension}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                  hasActiveExtension
                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                End Match
              </button>

              {hasActiveExtension && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  Extension active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        {subjects.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg p-10 text-center bg-white">
            <div className="text-gray-300 text-3xl mb-3">📚</div>
            <p className="text-sm text-gray-500">
              No active subjects for this student.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">
              Subjects
            </h2>

            {subjects.map((row) => {
              const subject = row.subjects[0]
              if (!subject) return null

              return (
                <div
                  key={subject.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
                    <h3 className="text-base font-medium text-gray-900">
                      {subject.name}
                    </h3>

                    <SendClassReminderButton
                      studentId={student.id}
                      subjectName={subject.name}
                      tutorName={""}
                    />
                  </div>

                  <div className="p-5">
                    {/* <LessonProgressViewer
                      studentId={student.id}
                      subjectId={subject.id}
                      gradeLevel={gradeLevel}
                    /> */}
                    <p className="text-sm text-gray-400 text-center py-4">
                      
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
