import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import SubjectEditor from "./subject-editor"
import SubjectViewer from "./subject-viewer"

type Course = {
  id: string
  title: string
  description: string
  teacher_id: string
}

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
  const { id: courseId } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // get session user
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (error) throw error
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        // get course
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single()

        if (courseError) throw courseError
        setCourse(courseData)
      } catch (err) {
        console.error("Error loading course:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  if (loading) return <p>Loading...</p>
  if (!course) return <p>Course not found</p>

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>

      {profile ? (
        profile.role === "teacher" && profile.id === course.teacher_id ? (
          <>
            <p>Welcome, {profile.display_name} (Teacher)</p>
            <SubjectEditor
              subjectId={subject}
              gradeLevel="default" // 🔹 placeholder until grade logic is added
              tutorId={profile.id}
            />
          </>
        ) : (
          <>
            <p>Welcome, {profile.display_name} (Student)</p>
            <SubjectViewer
              subjectId={subject}
              gradeLevel="default" // 🔹 same placeholder
            />
          </>
        )
      ) : (
        <p>
          <Link to="/login">Login</Link> to access this course
        </p>
      )}
    </div>
  )
}
