import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { TriggerExtensionButton } from "@/components/trigger-extension-button"
import { NavLink } from "react-router-dom"
import { NotifyStudentButton } from "@/components/notifications/notify-button"
import { profile } from "console"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import Progress from "./update/Progress"
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

  const MAX_VIEWS = 10
  const Progress = ({ value, className }: { value?: number; className?: string }) => {
  const percentage = value ?? 0;
  return (
    <div className={`relative h-4 rounded-full bg-gray-200 overflow-hidden ${className || ""}`}>
      <div
        className="h-full bg-black transition-all duration-100 ease-out" 
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
};
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
        .select(
          `
          student_id,
          grade_level,
          subject,
          profiles!matches_student_id_fkey (display_name)
        `
        )
        .eq("tutor_id", user.id)
        .eq("status", "active")

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      const rows: StudentRow[] = []

      for (const m of matches || []) {
        const { data: subData } = await supabase
          .from("subjects")
          .select("id, name")
          .eq("name", m.subject)
          .eq("tutor_id", user.id)
          .single()

        rows.push({
          student_id: m.student_id,
          display_name: m.profiles?.[0]?.display_name,
          subject_id: subData?.id ?? "",
          subject_name: subData?.name ?? m.subject,
          grade_level: m.grade_level,
        })
      }

      setStudents(rows)

      const progressMap: Record<string, number> = {}

      for (const s of rows) {
        const key = `${s.student_id}:${s.subject_id}`

        const { count: viewCount } = await supabase
          .from("subject_views")
          .select("*", { count: "exact" })
          .eq("student_id", s.student_id)
          .eq("subject_id", s.subject_id)

        const viewPct = Math.min((viewCount ?? 0) / MAX_VIEWS, 1)

        const { data: attempts } = await supabase
          .from("assessment_attempts")
          .select(
            `
            percentage,
            assessments!inner(subject_id)
          `
          )
          .eq("student_id", s.student_id)
          .eq("assessments.subject_id", s.subject_id)

        const avgScore =
          attempts && attempts.length > 0
            ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
            : 0

        progressMap[key] =
          Math.round((viewPct * 60 + avgScore * 0.4) * 100) / 100
      }

      setProgress(progressMap)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="border border-gray-200 rounded-lg p-8 bg-white text-center">
          <div className="inline-block h-5 w-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Loading student progress…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Student Progress
          </h1>
          <p className="text-sm text-gray-500">{students.length} students</p>
        </header>

        {students.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-10 bg-white text-center space-y-4">
            <div className="text-gray-300 text-4xl">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                No student progress yet
              </p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Progress will appear here once a student is matched to you,
                <br />
                views their subject, or attempts assessments.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <NavLink to="/matchmaking">
                <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">
                  Find Students
                </button>
              </NavLink>

              <NavLink to="/create-subject">
                <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">
                  Manage Courses
                </button>
              </NavLink>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((s) => {
              const key = `${s.student_id}:${s.subject_id}`
              const pct = progress[key] ?? 0
              const lowProgress = pct < 60

              return (
                <div
                  key={key}
                  className="bg-white border border-gray-200 rounded-lg p-5 space-y-4"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {s.display_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {s.display_name}
                        </p>
                        <p className="text-xs text-gray-500">{s.subject_name}</p>
                      </div>
                    </div>

                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md w-fit">
                      Grade {s.grade_level}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span
                        className={`font-medium ${
                          lowProgress ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>

                    <Progress value={Math.min(pct, 100)} />

                    {lowProgress && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Needs attention
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100">
                    <NavLink
                      to={`/tutor/progress/${s.student_id}/${s.grade_level}`}
                      className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2 transition"
                    >
                      View details
                    </NavLink>

                    {lowProgress && (
                      <>
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
                      </>
                    )}
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