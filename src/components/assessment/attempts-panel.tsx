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
    if (!assessmentId) return
    async function load() {
      setLoading(true)

      let query = supabase
        .from("assessment_attempts")
        .select(
          `
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
        `
        )
        .eq("assessment_id", assessmentId)
        .order("completed_at", { ascending: false })

      if (role === "student" && studentId) {
        query = query.eq("student_id", studentId)
      }

      console.log("📥 Panel load", {
        assessmentId,
        role,
        studentId,
      })

      const { data, error } = await query

      if (error) console.error(error)

      setAttempts(data ?? [])
      onLoaded?.(data ?? [])
      setLoading(false)

      console.log("📊 Panel attempts result", {
        count: data?.length,
        studentOnly: role === "student",
        ids: data?.map((a) => a.id),
      })
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
    return (
      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-500">Loading attempts…</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .sv-review .sv_main {
          font-family: inherit;
        }

        .sv-review .sv_main .sv_container {
          padding: 0 !important;
          color: #0a0a0a;
        }

        .sv-review .sv_main .sv_body {
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
        }

        .sv-review .sv_main .sv_p_root {
          padding: 0 !important;
        }

        .sv-review .sv_main .sv_q {
          padding: 16px;
          margin-bottom: 12px;
          background: #fafafa;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .sv-review .sv_main .sv_q_title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #0a0a0a;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .sv-review .sv_main .sv_q_num {
          font-weight: 500;
          color: #71717a;
        }

        .sv-review .sv_main .sv_q_radiogroup {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sv-review .sv_main .sv_q_radiogroup_label {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #0a0a0a;
        }

        .sv-review .sv_main input[type="radio"]:checked + .sv_q_radiogroup_label,
        .sv-review .sv_main .sv_q_radiogroup_label.checked,
        .sv-review .sv_main .sv_q_radiogroup .checked {
          background: #f4f4f5;
          border-color: #0a0a0a;
        }

        .sv-review .sv_main .sv_q_radiogroup input[type="radio"] {
          accent-color: #0a0a0a;
        }

        .sv-review .sv_main .sv_header {
          display: none;
        }

        .sv-review .sv_main .sv_nav {
          display: none;
        }
      `}</style>

      <div className="mt-6 border-t border-gray-200 pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            {role === "teacher" ? "Attempts" : "Your Attempts"}
          </h3>

          {role === "teacher" && attempts.length > 0 && (
            <button
              onClick={exportCSV}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Export CSV
            </button>
          )}
        </div>

        {attempts.length === 0 && (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">No attempts yet</p>
          </div>
        )}

        {attempts.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">
                    {role === "teacher" ? "Student" : "Date"}
                  </th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600">
                    Score
                  </th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, idx) => (
                  <tr
                    key={a.id}
                    className={
                      idx !== attempts.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 text-gray-900">
                      {role === "teacher" ? (
                        <span>
                          {a.profiles?.display_name ||
                            a.profiles?.email ||
                            "Student"}
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          {new Date(a.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {a.percentage?.toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          a.passed
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {a.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActiveAttempt(a)}
                        className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeAttempt && (
          <div className="mt-5 border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  Review Attempt
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(activeAttempt.completed_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setActiveAttempt(null)}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sv-review">
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
          </div>
        )}
      </div>
    </>
  )
}