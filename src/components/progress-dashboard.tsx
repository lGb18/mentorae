import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { TriggerExtensionButton } from "@/components/trigger-extension-button"

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

  useEffect(() => {
    async function load() {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

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

        const avgScore =
          attempts && attempts.length > 0
            ? attempts.reduce((a, b) => a + b.percentage, 0) / attempts.length
            : 0

        progressMap[s.student_id] =
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
        {students.map((s) => {
          const pct = progress[s.student_id] ?? 0
          const lowProgress = pct < 60

          return (
            <div
              key={`${s.student_id}-${s.subject_id}`}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {s.display_name} — {s.subject_name}
                </p>
                <p className="text-xs text-gray-500">
                  Grade {s.grade_level}
                </p>
                <p
                  className={`text-sm ${
                    lowProgress ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Progress: {pct}%
                </p>
              </div>

              {lowProgress && (
                <TriggerExtensionButton
                  studentId={s.student_id}
                  subjectId={s.subject_id}
                  gradeLevel={s.grade_level}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
