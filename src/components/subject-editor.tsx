import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import ReactQuill from "react-quill"
import { supabase } from "@/lib/supabaseClient"

type SubjectEditorProps = {
  subjectName: string
  gradeLevel: string
  tutorId: string
}

export default function SubjectEditor({ subjectName, gradeLevel, tutorId }: SubjectEditorProps) {
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [contentId, setContentId] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  
  // ✅ Ref to track if component is mounted
  const isMounted = useRef(true)
  
  // ✅ Memoize modules to prevent recreation
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"]
    ]
  }), [])

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // ✅ Memoize fetchData to prevent recreation
  const fetchData = useCallback(async () => {
    try {
      const { data: subject } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subjectName)
        .eq("tutor_id", tutorId)
        .maybeSingle()
      
      if (!isMounted.current) return
      setSubjectId(subject?.id || null)

      if (subject?.id) {
        const { data: existing } = await supabase
          .from("subject_content")
          .select("*")
          .eq("tutor_id", tutorId)
          .eq("subject_id", subject.id)
          .eq("grade_level", gradeLevel)
          .maybeSingle()
        
        if (isMounted.current && existing) {
          setContentId(existing.id)
          setContent(existing.content)
        }
      }
    } catch (err) {
      console.error("Error loading content:", err)
    }
  }, [subjectName, gradeLevel, tutorId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ✅ Memoize handleSave
  const handleSave = useCallback(async () => {
    if (!subjectId) return
    
    setIsSaving(true)
    setSaveStatus('Saving...')
    
    try {
      const { error } = await supabase
        .from("subject_content")
        .upsert({
          id: contentId || undefined,
          tutor_id: tutorId,
          subject_id: subjectId,
          grade_level: gradeLevel,
          content,
          updated_at: new Date().toISOString(),
        })
      
      if (!isMounted.current) return
      
      if (error) {
        console.error("Error saving:", error)
        setSaveStatus('Error saving content')
      } else {
        setSaveStatus('Saved successfully!')
      }
    } catch (error) {
      console.error("Error saving:", error)
      if (isMounted.current) {
        setSaveStatus('Error saving content')
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false)
        setTimeout(() => {
          if (isMounted.current) {
            setSaveStatus('')
          }
        }, 3000)
      }
    }
  }, [subjectId, contentId, tutorId, gradeLevel, content])

  return (
    <div>
      <ReactQuill 
        value={content} 
        onChange={setContent} 
        modules={modules} 
        theme="snow"
      />
      <div className="mt-2 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            isSaving 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isSaving && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isSaving ? 'Saving...' : (contentId ? "Save Changes" : "Create Content")}
        </button>
        
        {saveStatus && (
          <span className={`text-sm ${
            saveStatus.includes('Error') ? 'text-red-500' : 'text-green-600'
          }`}>
            {saveStatus}
          </span>
        )}
      </div>
    </div>
  )
  useEffect(() => {
  console.log("SubjectEditor rendered")
})
}