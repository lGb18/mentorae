import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import SubjectEditor from "./subject-editor"
import SubjectViewer from "./subject-viewer"

type Profile = {
  id: string
  email: string
  role: "student" | "teacher"
  display_name: string
}

type CoursePageProps = {
  subject: string
}

export default function CoursePage({ subject }: CoursePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasContent, setHasContent] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState("Grade 7") // default grade

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setProfile(null)
          return
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) throw error
        setProfile(profileData)

        // fetch subject table id
        const { data: subjects, error: subErr } = await supabase
          .from("subjects")
          .select("id")
          .eq("name", subject)
          .single()

        if (subErr || !subjects) {
          console.error(`Subject "${subject}" not found`)
          return
        }

        // check if content exists for this tutor + subject + grade
        const { data: contentData } = await supabase
          .from("subject_content")
          .select("*")
          .eq("tutor_id", profileData.id)
          .eq("subject_id", subjects.id)
          .eq("grade_level", selectedGrade)
          .single()

        if (contentData) setHasContent(true)
      } catch (err) {
        console.error("Error loading profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [subject, selectedGrade])

  const handleCreateContent = async () => {
    if (!profile) return
    try {
      const { data: subjects } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subject)
        .single()

      if (!subjects) throw new Error(`Subject "${subject}" not found`)

      await supabase.from("subject_content").insert({
        tutor_id: profile.id,
        subject_id: subjects.id,
        grade_level: selectedGrade,
        content: "",
      })

      setHasContent(true)
    } catch (err) {
      console.error("Error creating subject content:", err)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!profile) return <p>Please login to access this course</p>

  return (
    <div className="p-4">
      <h1>{subject.toUpperCase()}</h1>

      {profile.role === "teacher" ? (
        <div>
          <p>Welcome, {profile.display_name}</p>

          {/* grade selector */}
          <label className="mr-2">Select Grade:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border px-2 py-1 rounded mb-2"
          >
            <option>Grade 1</option>
            <option>Grade 2</option>
            <option>Grade 3</option>
            <option>Grade 4</option>
            <option>Grade 5</option>
            <option>Grade 6</option>
          </select>

          {/* create content button */}
          {!hasContent && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleCreateContent}
            >
              Create Subject Content
            </button>
          )}

          {/* show editor if content exists */}
          {hasContent && (
            <SubjectEditor
              subjectName={subject}
              gradeLevel={selectedGrade}
              tutorId={profile.id}
            />
          )}
        </div>
      ) : (
        <div>
          <p>Welcome, {profile.display_name} (Student)</p>
          <SubjectViewer subjectId={subject} gradeLevel={selectedGrade} />
        </div>
      )}
    </div>
  )
}


