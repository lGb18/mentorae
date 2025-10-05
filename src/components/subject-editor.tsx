import { useEffect, useState } from "react"
import ReactQuill from "react-quill"
import { supabase } from "@/lib/supabaseClient"

type SubjectEditorProps = {
  subjectName: string // e.g., "Math"
  gradeLevel: string
  tutorId: string
}

export default function SubjectEditor({ subjectName, gradeLevel, tutorId }: SubjectEditorProps) {
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [contentId, setContentId] = useState<string | null>(null)
  const [content, setContent] = useState("")

  const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"], // <- enables image button
    ["clean"]
  ]
};

<ReactQuill
  value={content}
  onChange={setContent}
  modules={modules}
  theme="snow"
/>
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: subject } = await supabase
          .from("subjects")
          .select("id")
          .eq("name", subjectName)
          .single()
        setSubjectId(subject?.id || null)

        const { data: existing } = await supabase
          .from("subject_content")
          .select("*")
          .eq("tutor_id", tutorId)
          .eq("subject_id", subject?.id)
          .eq("grade_level", gradeLevel)
          .single()
        if (existing) {
          setContentId(existing.id)
          setContent(existing.content)
        }
      } catch (err) {
        console.error("Error loading content:", err)
      }
    }
    fetchData()
  }, [subjectName, gradeLevel, tutorId])

  const handleSave = async () => {
    if (!subjectId) return
    const { error } = await supabase
      .from("subject_content")
      .upsert({
        id: contentId || undefined,
        tutor_id: tutorId,
        subject_id: subjectId,
        grade_level: gradeLevel,
        content,
        updated_at: new Date(),
      })
    if (error) console.error("Error saving:", error)
  }

  return (
    <div>
      <ReactQuill value={content} onChange={setContent} modules={modules} theme="snow" />
      <button
        onClick={handleSave}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {contentId ? "Save Changes" : "Create Content"}
      </button>
    </div>
  )
}
