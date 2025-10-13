import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import SubjectEditor from "./subject-editor"
import SubjectViewer from "./subject-viewer"
import {endMatch} from "@/lib/match-table"
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
  const [selectedGrade, setSelectedGrade] = useState("1")
  const [matchedTutorId, setMatchedTutorId] = useState<string | null>(null)

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

      // Fetch subject ID
      const { data: subjects, error: subErr } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subject.toLowerCase())
        .single()

      if (subErr || !subjects) {
        console.error(`Subject "${subject}" not found`)
        return
      }

      if (profileData.role === "teacher") {
        // For teachers: check if they have content
        const { data: contentData } = await supabase
          .from("subject_content")
          .select("*")
          .eq("tutor_id", profileData.id)
          .eq("subject_id", subjects.id)
          .eq("grade_level", `Grade ${selectedGrade}`)
          .maybeSingle()

        if (contentData) setHasContent(true)
      } else {
        // For students: find their matched tutor for this subject and grade
        const subjectForMatch = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase()
        
        const { data: matchData } = await supabase
          .from("matches")
          .select("tutor_id")
          .eq("student_id", profileData.id)
          .eq("subject", subjectForMatch)
          .in("grade_level", [`Grade ${selectedGrade}`, selectedGrade, "unspecified"])
          .eq("status", "active")
          .maybeSingle()

        if (matchData) {
          setMatchedTutorId(matchData.tutor_id)
          
          // Check if matched tutor has content
          const { data: contentData } = await supabase
            .from("subject_content")
            .select("*")
            .eq("tutor_id", matchData.tutor_id)
            .eq("subject_id", subjects.id)
            .eq("grade_level", `Grade ${selectedGrade}`)
            .maybeSingle()

          if (contentData) setHasContent(true)
        }
      }
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
        .eq("name", subject.toLowerCase())
        .single()

      if (!subjects) throw new Error(`Subject "${subject}" not found`)

      await supabase.from("subject_content").insert({
        tutor_id: profile.id,
        subject_id: subjects.id,
        grade_level: `Grade ${selectedGrade}`, // Use "Grade 5" format for subject_content
        content: "",
      })

      setHasContent(true)
    } catch (err) {
      console.error("Error creating subject content:", err)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!profile) return <p>Please login to access this material</p>

  return (
    <div className="p-4">
      <h1>{subject.toUpperCase()}</h1>

      {/* Debug info
      <div style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        marginBottom: '10px', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <strong>Debug Info:</strong><br />
        Role: {profile.role}<br />
        Selected Grade: {selectedGrade}<br />
        Matched Tutor: {matchedTutorId || 'None'}<br />
        Has Content: {hasContent ? 'Yes' : 'No'}<br />
        Subject: {subject}
      </div> */}

      {profile.role === "teacher" ? (
        <div>
          <p>Welcome, {profile.display_name}</p>

          {/* Grade selector - now using DB format */}
          <label className="mr-2">Select Grade:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border px-2 py-1 rounded mb-2"
          >
            <option value="1">Grade 1</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
          </select>

          {/* Create content button */}
          {!hasContent && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleCreateContent}
            >
              Create Subject Content
            </button>
          )}

          {/* Show editor if content exists */}
          {hasContent && (
            <SubjectEditor
              subjectName={subject}
              gradeLevel={`Grade ${selectedGrade}`} // Pass "Grade 5" format
              tutorId={profile.id}
            />
          )}
        </div>
      ) : (
        <div>
          <p>Welcome, {profile.display_name} (Student)</p>
          
          {/* Grade selector for students - now using DB format */}
          <label className="mr-2">Select Grade:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border px-2 py-1 rounded mb-2"
          >
            <option value="1">Grade 1</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
          </select>

          {!matchedTutorId ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p>No tutor assigned for {subject.toUpperCase()} - Grade {selectedGrade}.</p>
            </div>
          ) : !hasContent ? (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <p>Your tutor hasn't created content for {subject} - Grade {selectedGrade} yet.</p>
              <p>Please check back later or contact your tutor.</p>
            </div>
          ) : (
            <SubjectViewer 
              subjectId={subject} 
              gradeLevel={`Grade ${selectedGrade}`}
            />
          )}
          {matchedTutorId && (
            <button
              className="bg-black-500 text-black px-4 py-2 rounded mt-2"
              onClick={async () => {
                try {
                  const { data: match } = await supabase
                    .from("matches")
                    .select("id")
                    .eq("student_id", profile.id)
                    .eq("tutor_id", matchedTutorId)
                    .single()

                  if (match) {
                    await endMatch(match.id)
                    setMatchedTutorId(null)
                    setHasContent(false)
                  }
                } catch (err) {
                  console.error("Error ending match:", err)
                }
              }}
            >
              End Match
            </button>
          )}
        </div>
      )}
    </div>
  )
}