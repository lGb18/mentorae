import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { TriggerExtensionButton } from "@/components/trigger-extension-button"
import { NavLink } from "react-router-dom"
import { NotifyStudentButton } from "@/components/notifications/notify-button"
import { profile } from "console"
import { SendClassReminderButton } from "./notifications/reminder-button"
type StudentRow = {
  student_id: string
  display_name: string
  subject_id: string
  subject_name: string
  grade_level: string
}

export function TutorProgressDashboard() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [tutorName, setTutorName] = useState("")
  
  useEffect(() => {
    async function load() {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }
      const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()

      setTutorName(profile?.display_name ?? "Your Tutor")
      const { data: matches, error } = await supabase
        .from("matches")
        .select(`
          student_id,
          grade_level,
          subjects (
            id,
            name
          ),
          profiles!matches_student_id_fkey (
            display_name
          )
        `)
        .eq("tutor_id", user.id)
        .eq("status", "active")

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      const rows: StudentRow[] =
        matches?.map((m: any) => ({
          student_id: m.student_id,
          display_name: m.profiles.display_name,
          subject_id: m.subjects.id,
          subject_name: m.subjects.name,
          grade_level: m.grade_level,
        })) ?? []

      setStudents(rows)

      const progressMap: Record<string, number> = {}

      for (const s of rows) {
        const key = `${s.student_id}:${s.subject_id}`

        const { count: lessonsCompleted } = await supabase
          .from("lesson_progress")
          .select("*", { count: "exact", head: true })
          .eq("student_id", s.student_id)
          .eq("subject_id", s.subject_id)

        const { count: totalLessons } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("subject_id", s.subject_id)
          .eq("grade_level", s.grade_level)

        const lessonPct =
          totalLessons && totalLessons > 0
            ? (lessonsCompleted ?? 0) / totalLessons
            : 0

        const { data: attempts } = await supabase
          .from("assessment_attempts")
          .select("percentage")
          .eq("student_id", s.student_id)
          .eq("subject_id", s.subject_id)

        const avgScore =
          attempts && attempts.length > 0
            ? attempts.reduce((sum, a) => sum + a.percentage, 0) /
              attempts.length
            : 0

        progressMap[key] =
          Math.round((lessonPct * 60 + avgScore * 0.4) * 100) / 100
      }

      setProgress(progressMap)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading student progress…
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">
        Student Progress Dashboard
      </h1>
      
      <div className="space-y-3">
      {students.length === 0 && (
        <div className="rounded-lg border border-dashed bg-background p-10 text-center">
          <div className="mx-auto max-w-md space-y-2">
            <p className="text-sm font-medium text-foreground">
              No student progress yet
            </p>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Progress will appear here once:
              <br />
              • A student is matched to you
              <br />
              • Lessons are marked complete
              <br />
              • Or assessments are attempted
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <NavLink
                to="/matchmaking"
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Find Students
              </NavLink>

              <NavLink
                to="/create-subject"
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Manage Courses
              </NavLink>
            </div>
          </div>
        </div>
      )}

        {students.map((s) => {
          const key = `${s.student_id}:${s.subject_id}`
          const pct = progress[key] ?? 0
          const lowProgress = pct < 60

          return (
            <div
              key={key}
              className="border rounded p-4 flex justify-between items-center"
            >
              <SendClassReminderButton
              studentId={s.student_id}
              subjectName={s.subject_name}
              tutorName={tutorName} 
            />
              <div>
                <p className="font-medium">
                  {s.display_name} — {s.subject_name}
                </p>
                <p className="text-xs text-gray-500">
                  Grade {s.grade_level}
                </p>
                <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{pct}%</span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      lowProgress ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                {lowProgress && (
                  <p className="text-xs text-red-600">
                    Needs attention
                  </p>
                )}
              </div>


                <NavLink
                  to={`/tutor/progress/${s.student_id}/${s.grade_level}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View details →
                </NavLink>
              </div>

              {lowProgress && (
              <div className="flex items-center gap-2">
                <NotifyStudentButton
                  studentId={s.student_id}
                  subjectName={s.subject_name}
                  gradeLevel={s.grade_level}
                />

                <TriggerExtensionButton
                  studentId={s.student_id}
                  subjectId={s.subject_id}
                  gradeLevel={s.grade_level}
                />
              </div>
            )}

            </div>
          )
        })}
      </div>
    </div>
  )
}
