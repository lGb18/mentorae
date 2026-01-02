import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { AssessmentAttemptsPanel } from "@/components/assessment/attempts-panel"
import { AssessmentRunner } from "./assess-runner"

export function AssessmentAttemptsPage() {
  const { assessmentId } = useParams()
  const [assessment, setAssessment] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const [{ data: assessmentData }, { data: profileData }] =
        await Promise.all([
          supabase
            .from("assessments")
            .select("id, title, survey_schema, attempt_limit, passing_score")
            .eq("id", assessmentId)
            .single(),

          supabase
            .from("profiles")
            .select("id, role")
            .eq("id", user.id)
            .single(),
        ])

      setAssessment(assessmentData)
      setProfile(profileData)
      setLoading(false)
    }

    load()
  }, [assessmentId])

  if (loading) {
    return <p className="text-sm text-gray-500">Loading assessment…</p>
  }

  if (!assessment || !profile) {
    return <p>Assessment not found</p>
  }

  const attemptLimit = assessment.attempt_limit

  const studentAttempts =
    profile.role === "student"
      ? attempts.filter((a) => a.student_id === profile.id)
      : []

  const canAttempt =
    profile.role === "student" &&
    (attemptLimit == null || studentAttempts.length < attemptLimit)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">
        {assessment.title} — Attempts
      </h1>

      {profile.role === "student" && (
        <AssessmentRunner
          assessmentId={assessment.id}
          studentId={profile.id}
          schema={assessment.survey_schema}
          passingScore={assessment.passing_score}
          canAttempt={canAttempt}
          attemptLimit={attemptLimit}
          attemptsUsed={studentAttempts.length}
        />
      )}

      <AssessmentAttemptsPanel
        assessmentId={assessment.id}
        schema={assessment.survey_schema}
        role={profile.role}
        studentId={profile.role === "student" ? profile.id : undefined}
        onLoaded={setAttempts}
      />
    </div>
  )
}

