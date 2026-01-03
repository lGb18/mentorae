import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  studentId: string
  subjectId: string
  gradeLevel: string
}

export function LessonProgressViewer({
  studentId,
  subjectId,
  gradeLevel,
}: Props) {
  const [lessons, setLessons] = useState<any[]>([])
  const [completed, setCompleted] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [{ data: lessonsData }, { data: progressData }] =
        await Promise.all([
          supabase
            .from("lessons")
            .select("id, title")
            .eq("subject_id", subjectId)
            .eq("grade_level", gradeLevel)
            .order("id"),

          supabase
            .from("lesson_progress")
            .select("lesson_id, completed_at")
            .eq("student_id", studentId)
            .eq("subject_id", subjectId),
        ])

      const completedMap: Record<string, string> = {}

      progressData?.forEach((p) => {
        completedMap[p.lesson_id] = p.completed_at
      })

      setLessons(lessonsData ?? [])
      setCompleted(completedMap)
      setLoading(false)
    }

    load()
  }, [studentId, subjectId, gradeLevel])

  if (loading) {
    return (
      <p className="text-xs text-gray-500">Loading lesson progress…</p>
    )
  }

  if (lessons.length === 0) {
    return (
      <p className="text-xs text-gray-500">
        No lessons found for this subject.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Lesson Progress</h4>

      <ul className="space-y-1">
        {lessons.map((lesson) => {
          const done = completed[lesson.id]

          return (
            <li
              key={lesson.id}
              className="flex items-center justify-between border rounded px-3 py-2 text-sm"
            >
              <span>{lesson.title}</span>

              {done ? (
                <span className="text-green-600 text-xs">
                  ✔ Completed{" "}
                  <span className="text-gray-400">
                    ({new Date(done).toLocaleDateString()})
                  </span>
                </span>
              ) : (
                <span className="text-gray-400 text-xs">
                  Not completed
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
