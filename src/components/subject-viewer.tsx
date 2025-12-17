import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

type SubjectViewerProps = {
  subjectId: string
  gradeLevel: string
}

export default function SubjectViewer({ subjectId, gradeLevel }: SubjectViewerProps) {
  const [content, setContent] = useState("")
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const isMounted = useRef(true)

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // ✅ Memoize resolver
  const resolveSubjectId = useCallback(async () => {
    if (subjectId.includes("-")) {
      if (isMounted.current) {
        setResolvedId(subjectId)
      }
    } else {
      const { data, error } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subjectId)
        .single()
      
      if (!error && data && isMounted.current) {
        setResolvedId(data.id)
      }
    }
  }, [subjectId])

  useEffect(() => {
    resolveSubjectId()
  }, [resolveSubjectId])

  // ✅ Memoize fetch
  const fetchContent = useCallback(async () => {
    if (!resolvedId) return

    const { data, error } = await supabase
      .from("subject_content")
      .select("content")
      .eq("subject_id", resolvedId)
      .eq("grade_level", gradeLevel)
      .single()

    if (!isMounted.current) return

    if (error) {
      if (error.code === "PGRST116") {
        setContent("No tutor has been assigned yet.")
      } else {
        console.error("Error loading content:", error)
      }
    } else {
      setContent(data?.content || "")
    }
  }, [resolvedId, gradeLevel])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])
  
  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}