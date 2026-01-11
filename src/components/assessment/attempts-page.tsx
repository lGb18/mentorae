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
  console.log("✅ AssessmentAttemptsPage MOUNTED")


  console.log("🧪 assessmentId param", assessmentId)
  useEffect(() => {
    if (!assessmentId) return
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const [{ data: assessmentData }, { data: profileData }, { data: attemptsData }] =
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

          supabase
            .from("assessment_attempts")
            .select("id, student_id")
            .eq("assessment_id", assessmentId),
        ])

      setAssessment(assessmentData)
      setProfile(profileData)
      setAttempts(attemptsData ?? [])
      setLoading(false)
      console.log("🔎 AssessmentAttemptsPage render", {
        assessmentId,
        type: typeof assessmentId,
      })
    }

    load()
  }, [assessmentId])
  console.log("🧮 Attempt calculation", {
  role: profile?.role,
  totalAttemptsLoaded: attempts.length,
  studentAttempts: attempts.filter(a => a.student_id === profile?.id).length,
  attemptLimit: assessment?.attempt_limit,
})

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
      />
    </div>
  )
}

