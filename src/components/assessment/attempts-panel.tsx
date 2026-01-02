import { useEffect, useState } from "react"
import { Survey } from "survey-react"
import Papa from "papaparse"
import { supabase } from "@/lib/supabaseClient"
type Props = {
  assessmentId: string
  schema: any
  role: "teacher" | "student"
  studentId?: string
  onLoaded?: (attempts: any[]) => void
}

export function AssessmentAttemptsPanel({
  assessmentId,
  schema,
  role,
  studentId,
  onLoaded,
}: Props) {
  const [attempts, setAttempts] = useState<any[]>([])
  const [activeAttempt, setActiveAttempt] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setActiveAttempt(null)
  }, [assessmentId])

  useEffect(() => {
    async function load() {
      setLoading(true)

      let query = supabase
        .from("assessment_attempts")
        .select(`
          id,
          score,
          percentage,
          passed,
          completed_at,
          student_id,
          answers,
          profiles (
            display_name,
            email
          )
        `)
        .eq("assessment_id", assessmentId)
        .order("completed_at", { ascending: false })

      if (role === "student" && studentId) {
        query = query.eq("student_id", studentId)
      }

      const { data, error } = await query

      if (error) console.error(error)

      setAttempts(data ?? [])
      onLoaded?.(data ?? [])
      setLoading(false)
    }

    load()
  }, [assessmentId, role, studentId])

  function exportCSV() {
    if (!attempts.length) return

    const rows = attempts.map((a) => ({
      student_name:
        a.profiles?.display_name || a.profiles?.email || "Unknown",
      student_id: a.student_id,
      completed_at: new Date(a.completed_at).toLocaleString(),
      score: a.score,
      percentage: a.percentage,
      passed: a.passed ? "Yes" : "No",
    }))

    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "assessment-attempts.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <p className="text-xs text-gray-500">Loading attempts…</p>
  }

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">
          {role === "teacher" ? "Attempts" : "Your Attempts"}
        </h3>

        {role === "teacher" && attempts.length > 0 && (
          <button
            onClick={exportCSV}
            className="text-sm px-3 py-1 rounded border"
          >
            Export CSV
          </button>
        )}
      </div>

      {loading && (
        <p className="text-xs text-gray-500">Loading attempts…</p>
      )}

      {!loading && attempts.length === 0 && (
        <p className="text-xs text-gray-500">No attempts yet</p>
      )}

      <div className="space-y-2">
        {attempts.map((a) => (
          <div
            key={a.id}
            className="flex justify-between items-center border rounded px-3 py-2 text-sm"
          >
            <span>
              {a.profiles?.display_name ||
                a.profiles?.email ||
                "Student"}
            </span>

            <span className={a.passed ? "text-green-600" : "text-red-600"}>
              {a.percentage?.toFixed(0)}%
            </span>

            <button
              onClick={() => setActiveAttempt(a)}
              className="text-xs text-blue-600 hover:underline"
            >
              Review
            </button>
          </div>
        ))}
      </div>

      {activeAttempt && (
        <div className="mt-4 border-t pt-3">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Review Attempt</span>
            <button
              onClick={() => setActiveAttempt(null)}
              className="text-xs text-gray-600"
            >
              Close
            </button>
          </div>

          <Survey
            json={schema}
            data={activeAttempt.answers}
            mode="display"
            showCompletedPage={false}
            showNavigationButtons={false}
            onAfterRenderQuestion={(
              _survey: any,
              options: { question: any }
            ) => {
              if (options.question.correctAnswer !== undefined) {
                options.question.readOnly = true
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
