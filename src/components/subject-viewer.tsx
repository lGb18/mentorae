import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type SubjectViewerProps = {
  subjectId: string // can be UUID or subject name
  gradeLevel: string
}

export default function SubjectViewer({ subjectId, gradeLevel }: SubjectViewerProps) {
  const [content, setContent] = useState("")
  const [resolvedId, setResolvedId] = useState<string | null>(null)

  useEffect(() => {
    
    const resolveSubjectId = async () => {
      if (subjectId.includes("-")) {
        
        setResolvedId(subjectId)
      } else {
        const { data, error } = await supabase
          .from("subjects")
          .select("id")
          .eq("name", subjectId)
          .single()
        if (!error && data) setResolvedId(data.id)
      }
    }
    resolveSubjectId()
  }, [subjectId])

  useEffect(() => {
    const fetchContent = async () => {
      if (!resolvedId) return
      const { data, error } = await supabase
        .from("subject_content")
        .select("content")
        .eq("subject_id", resolvedId)
        .eq("grade_level", gradeLevel)
        .single()

       if (error) {
        
        if (error.code === "PGRST116") {
          setContent("No tutor has been assigned yet.")
        } else {
          console.error("Error loading content:", error)
        }
      } else {
        setContent(data?.content || "")
      }
    }
    fetchContent()
  }, [resolvedId, gradeLevel])

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
