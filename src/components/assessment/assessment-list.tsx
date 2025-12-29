import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function AssessmentList({
  subjectId,
  tutorId,
  gradeLevel,
  onSelect,
  refreshKey,
}: {
  subjectId: string
  tutorId?: string
  gradeLevel?: string
  onSelect: (a: any) => void
  refreshKey?: number
}) {

  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)

    let query = supabase
      .from("assessments")
      .select("*")
      .eq("subject_id", subjectId)

    if (!tutorId) {
      query = query.eq("is_published", true)
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    })

    if (error) console.error(error)
    setAssessments(data ?? [])
    setLoading(false)
  }

  async function createAssessment() {
    if (!tutorId || !gradeLevel) return

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        tutor_id: tutorId,
        subject_id: subjectId,
        grade_level: gradeLevel,
        title: "New Assessment",
        schema: { elements: [] },
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    await load()
    onSelect(data)
  }

  useEffect(() => {
    load()
  }, [subjectId, refreshKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 text-sm">Loading assessments…</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {assessments.length} {assessments.length === 1 ? "assessment" : "assessments"}
        </p>

        {tutorId && (
          <button
            onClick={createAssessment}
            className="inline-flex items-center gap-1 bg-black hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded"
          >
            <span>+</span>
            <span>Create Assessment</span>
          </button>
        )}
      </div>

      {/* Empty state */}
      {assessments.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-500 text-sm">No assessments yet.</p>
          {tutorId && (
            <p className="text-gray-400 text-xs mt-1">
              Click "Create Assessment" to get started.
            </p>
          )}
        </div>
      )}

      {/* Assessment list */}
      {assessments.length > 0 && (
        <div className="flex flex-col gap-2">
          {assessments.map((a) => (
            <div
              key={a.id}
              onClick={() => onSelect(a)}
              className="flex items-center justify-between border border-gray-200 bg-white hover:bg-gray-50 rounded-lg p-4 cursor-pointer transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-black">{a.title}</span>
                {!a.is_published && (
                  <span className="inline-flex w-fit text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Draft
                  </span>
                )}
              </div>

              <div className="text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}