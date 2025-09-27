import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type SubjectViewerProps = {
  subjectId: string
  gradeLevel: string
}

export default function SubjectViewer({ subjectId, gradeLevel }: SubjectViewerProps) {
  const [content, setContent] = useState("")

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("subject_content")
        .select("content")
        .eq("subject_id", subjectId)
        .eq("grade_level", gradeLevel)
        .single()

      if (error) {
        console.error("Error loading content:", error)
      } else {
        setContent(data?.content || "")
      }
    }
    fetchContent()
  }, [subjectId, gradeLevel])

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
