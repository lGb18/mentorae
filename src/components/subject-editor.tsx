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
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"]
  ]
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: subject } = await supabase
          .from("subjects")
          .select("id")
          .eq("name", subjectName)
          .eq("tutor_id", tutorId)
          .maybeSingle()
        setSubjectId(subject?.id || null)

        const { data: existing } = await supabase
          .from("subject_content")
          .select("*")
          .eq("tutor_id", tutorId)
          .eq("subject_id", subject?.id)
          .eq("grade_level", gradeLevel)
          .maybeSingle()
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
  if (!subjectId) return;
  
  setIsSaving(true);
  setSaveStatus('Saving...');
  
  try {
    const { error } = await supabase
      .from("subject_content")
      .upsert({
        id: contentId || undefined,
        tutor_id: tutorId,
        subject_id: subjectId,
        grade_level: gradeLevel,
        content,
        updated_at: new Date(),
      });
    
    if (error) {
      console.error("Error saving:", error);
      setSaveStatus('Error saving content');
    } else {
      setSaveStatus('Saved successfully!');
    }
  } catch (error) {
    console.error("Error saving:", error);
    setSaveStatus('Error saving content');
  } finally {
    setIsSaving(false);
    // Clear status message after 3 seconds
    setTimeout(() => setSaveStatus(''), 3000);
  }
};

return (
  <div>
    <ReactQuill value={content} onChange={setContent} modules={modules} theme="snow" />
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
          saveStatus.includes('Error') ? 'text-red-500' : 'text-black-500'
        }`}>
          {saveStatus}
        </span>
      )}
    </div>
  </div>
)

}
