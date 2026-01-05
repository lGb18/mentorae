import { useEffect, useState } from "react"
import ReactQuill from "react-quill"
import { supabase } from "@/lib/supabaseClient"

type SubjectEditorProps = {
  subjectName: string
  gradeLevel: string
  tutorId: string
  lessonId: string
}

export default function SubjectEditor({ lessonId }: SubjectEditorProps) {
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  }

  useEffect(() => {
    const loadLesson = async () => {
      const { data, error } = await supabase
        .from("subject_lessons")
        .select("content_html")
        .eq("id", lessonId)
        .single()

      if (!error && data) {
        setContent(data.content_html || "")
      }
    }

    loadLesson()
  }, [lessonId])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("Saving...")

    const { error } = await supabase
      .from("subject_lessons")
      .update({
        content_html: content,
        updated_at: new Date(),
      })
      .eq("id", lessonId)

    if (error) {
      console.error(error)
      setSaveStatus("Error saving")
    } else {
      setSaveStatus("Saved")
    }

    setIsSaving(false)
    setTimeout(() => setSaveStatus(""), 2000)
  }

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
          className={`px-4 py-2 rounded text-white ${
            isSaving ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSaving ? "Saving..." : "Save Lesson"}
        </button>

        {saveStatus && <span className="text-sm">{saveStatus}</span>}
      </div>
    </div>
  )
}
