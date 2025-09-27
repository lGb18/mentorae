import { useState } from "react"
import ReactQuill from "react-quill"
import { supabase } from "@/lib/supabaseClient"

type SubjectEditorProps = {
  subjectId: string
  gradeLevel: string
  tutorId: string
}
export default function SubjectEditor({ subjectId, gradeLevel, tutorId }: SubjectEditorProps) {
  const [content, setContent] = useState("")

  const handleSave = async () => {
    const { error } = await supabase
      .from("subject_content")
      .upsert({
        tutor_id: tutorId,
        subject_id: subjectId,
        grade_level: gradeLevel,
        content: content,
        updated_at: new Date(),
      })

    if (error) console.error("Error saving:", error)
  }

  return (
    <div>
      <ReactQuill value={content} onChange={setContent} />
      <button onClick={handleSave} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
        Save
      </button>
    </div>
  )
}
