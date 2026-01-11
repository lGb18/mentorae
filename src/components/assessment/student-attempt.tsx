import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { AssessmentRunner } from "@/components/assessment/assess-runner"
import { AssessmentAttemptsPanel } from "@/components/assessment/attempts-panel"

type Props = {
  assessment: any
  studentId: string
}

export function StudentAssessmentAttemptBlock({
  assessment,
  studentId,
}: Props) {
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAttempts() {
      setLoading(true)

      const { data, error } = await supabase
        .from("assessment_attempts")
        .select("*")
        .eq("assessment_id", assessment.id)
        .eq("student_id", studentId)
        .order("completed_at", { ascending: false })

      if (error) {
        console.error("Failed to load attempts", error)
      }

      setAttempts(data ?? [])
      setLoading(false)
    }

    loadAttempts()
  }, [assessment.id, studentId])

  if (loading) {
    return <p className="text-sm text-gray-500">Loading attempts…</p>
  }

  const attemptLimit = assessment.attempt_limit
  const attemptsUsed = attempts.length

  const canAttempt =
    attemptLimit == null || attemptsUsed < attemptLimit

  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((a) => a.percentage ?? 0))
      : null

  return (
    <div className="space-y-4">
      {/* Best score */}
      {bestScore != null && (
        <div className="text-sm text-gray-700">
          Best score:{" "}
          <span className="font-semibold">
            {Math.round(bestScore)}%
          </span>
        </div>
      )}

      {/* Attempt runner */}
      <AssessmentRunner
        assessmentId={assessment.id}
        studentId={studentId}
        schema={assessment.survey_schema}
        passingScore={assessment.passing_score}
        canAttempt={canAttempt}
        attemptLimit={attemptLimit}
        attemptsUsed={attemptsUsed}
        onSubmitted={() => {
          // reload attempts after submit
          supabase
            .from("assessment_attempts")
            .select("*")
            .eq("assessment_id", assessment.id)
            .eq("student_id", studentId)
            .order("completed_at", { ascending: false })
            .then(({ data }) => setAttempts(data ?? []))
        }}
      />

      {/* Attempts history */}
      <AssessmentAttemptsPanel
        assessmentId={assessment.id}
        schema={assessment.survey_schema}
        role="student"
        studentId={studentId}
      />
    </div>
  )
}
