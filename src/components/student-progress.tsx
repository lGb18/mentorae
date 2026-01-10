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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="border border-white/20 rounded-2xl p-8 max-w-md text-center space-y-3">
          <p className="text-sm text-gray-200">
            Invalid progress page
          </p>
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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="border border-white/30 rounded-2xl p-8 max-w-sm text-center space-y-3">
          <p className="text-sm text-gray-300">
            Loading student progress…
          </p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-full max-w-xl border border-white/20 rounded-3xl p-8 space-y-4">
          <p className="text-sm text-gray-300">
            Student not found or no longer enrolled.
          </p>
          <button
            onClick={() => navigate("/tutor/progress")}
            className="text-sm text-black underline underline-offset-2 hover:text-black-200 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
    
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        <div className="bg-black/70 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold leading-snug">
                {student.display_name}
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Grade {gradeLevel}
              </p>
            </div>
            <button
              onClick={() => navigate("/tutor/progress")}
              className="text-sm text-gray-300 hover:text-white transition"
            >
              ← Back to Dashboard
            </button>
          </header>

          <section className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleEndMatch}
              disabled={hasActiveExtension}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                hasActiveExtension
                  ? "border-black-500 text-gray-500 cursor-not-allowed bg-white/5"
                  : "border-black/20 text-black hover:bg-white/10"
              } transition`}
            >
              End Match
            </button>
            {hasActiveExtension && (
              <span className="text-xs text-amber-400">
                An extension is currently active.
              </span>
            )}
          </section>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <p className="text-sm text-gray-300">
              No active subjects for this student.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {subjects.map((row) => {
              const subject = row.subjects[0]
              if (!subject) return null

              return (
                <div
                  key={subject.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 shadow-inner"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold">
                      {subject.name}
                    </h2>
                    <SendClassReminderButton
                      studentId={student.id}
                      subjectName={subject.name}
                      tutorName={""}
                    />
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
        )}
      </div>
    </div>
  )
}