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
          subject,
          profiles!matches_student_id_fkey (display_name)
        `)
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

      // 4️⃣ Compute progress (ENGAGEMENT + ASSESSMENT)
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
          .select(`
            percentage,
            assessments!inner(subject_id)
          `)
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
      <div className="p-6 text-sm text-gray-500">
        Loading student progress…
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Student Progress Dashboard</h1>

      <div className="space-y-4">
        {students.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground p-8 text-center">
            <CardContent className="space-y-4">
              <p className="text-sm font-medium text-foreground">
                No student progress yet
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Progress will appear here once:
                <br />
                • A student is matched to you
                <br />
                • They view their subject
                <br />
                • Or attempt assessments
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <NavLink to="/matchmaking">
                  <Button variant="outline" size="sm">
                    Find Students
                  </Button>
                </NavLink>

                <NavLink to="/create-subject">
                  <Button variant="outline" size="sm">
                    Manage Courses
                  </Button>
                </NavLink>
              </div>
            </CardContent>
          </Card>
        )}

        {students.map((s) => {
          const key = `${s.student_id}:${s.subject_id}`
          const pct = progress[key] ?? 0
          const lowProgress = pct < 60

          return (
            <Card key={key}>
              <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <CardTitle className="text-sm sm:text-base">
                  {s.display_name} — {s.subject_name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-0">
                  Grade {s.grade_level}
                </p>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{pct}%</span>
                </div>

                <Progress
                  percent={Math.min(pct, 100)}
                 
                />

                {lowProgress && (
                  <p className="text-xs text-destructive">Needs attention</p>
                )}

                <NavLink
                  to={`/tutor/progress/${s.student_id}/${s.grade_level}`}
                  className="text-xs text-primary hover:underline"
                >
                  View details →
                </NavLink>

                {lowProgress && (
                  <div className="flex flex-wrap gap-2 mt-2">
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
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
