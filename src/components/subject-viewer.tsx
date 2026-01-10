import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type SubjectViewerProps = {
  subjectId: string
  gradeLevel: string
  tutorId: string
}

export default function SubjectViewer({
  subjectId,
  gradeLevel,
  tutorId,
}: SubjectViewerProps) {
  const [html, setHtml] = useState("")
  const hasTrackedView = useRef(false)
  

  console.log(" SubjectViewer render:", { subjectId, gradeLevel, tutorId });
  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase
        .from("subject_content")
        .select("content")
        .eq("subject_id", subjectId)
        .eq("tutor_id", tutorId)
        .in("grade_level", [
          gradeLevel,
          gradeLevel.replace("Grade ", ""),
          "unspecified",
        ])
        .maybeSingle()
      console.log("SubjectViewer fetch", { subjectId, tutorId, gradeLevel, data, error })
      if (error) {
        console.error("SubjectViewer error:", error)
        return
      }

      const raw = data?.content

      if (typeof raw === "string") {
        // backward compatibility (old rows)
        setHtml(raw)
      } else if (raw?.html) {
        setHtml(raw.html)
      } else {
        setHtml("")
      }
    }

    if (subjectId && tutorId) fetchContent()
  }, [subjectId, tutorId, gradeLevel])
  useEffect(() => {
  if (!subjectId || !tutorId) return
  if (hasTrackedView.current) return

  const trackView = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    hasTrackedView.current = true

    await supabase.from("subject_views").insert({
      student_id: user.id,
      subject_id: subjectId,
      tutor_id: tutorId,
    })
  }

  trackView()
}, [subjectId, tutorId])


  if (!html) {
    return (
      <p className="text-sm text-gray-500">
        No content available yet.
      </p>
    )
  }

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
