import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import SubjectEditor from "./subject-editor";
import SubjectViewer from "./subject-viewer";
import SubjectQuizzesTab from "./assessment/subject-quizzes-tab";
import { endMatch } from "@/lib/match-table";
import { useNavigate } from "react-router-dom";

type Profile = {
  id: string;
  email: string;
  role: "student" | "teacher";
  display_name: string;
};

type CoursePageProps = {
  subject: string;
  subjectId: string;
  children?: React.ReactNode;
};

export default function CoursePage({ subject, subjectId, children }: CoursePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("1");
  const [matchedTutorId, setMatchedTutorId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setProfile(null);
          return;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (error) throw error;
        setProfile(profileData);

        // For teachers: check if they have content
        if (profileData.role === "teacher") {
          const { data: contentData } = await supabase
            .from("subject_content")
            .select("*")
            .eq("tutor_id", profileData.id)
            .eq("subject_id", subjectId)
            .eq("grade_level", `Grade ${selectedGrade}`)
            .maybeSingle();

          if (contentData) setHasContent(true);
        } else {
          // For students: find matched tutor
          const subjectForMatch = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
          const { data: matchData } = await supabase
            .from("matches")
            .select("tutor_id")
            .eq("student_id", profileData.id)
            .eq("subject", subjectForMatch)
            .in("grade_level", [`Grade ${selectedGrade}`, selectedGrade, "unspecified"])
            .eq("status", "active")
            .maybeSingle();

          if (matchData) {
            setMatchedTutorId(matchData.tutor_id);

            // Check if matched tutor has content
            const { data: contentData } = await supabase
              .from("subject_content")
              .select("*")
              .eq("tutor_id", matchData.tutor_id)
              .eq("subject_id", subjectId)
              .eq("grade_level", `Grade ${selectedGrade}`)
              .maybeSingle();

            if (contentData) setHasContent(true);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [subject, subjectId, selectedGrade]);

  const handleCreateContent = async () => {
    if (!profile) return;
    try {
      await supabase.from("subject_content").insert({
        tutor_id: profile.id,
        subject_id: subjectId,
        grade_level: `Grade ${selectedGrade}`,
        content: "",
      });
      setHasContent(true);
    } catch (err) {
      console.error("Error creating subject content:", err);
    }
  };

  const handleDeleteSubject = async () => {
    if (!subjectId) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${subject}"?`);
    if (!confirmed) return;

    try {
      // 1. Delete the subject
      const { error: deleteError } = await supabase
        .from("subjects")
        .delete()
        .eq("id", subjectId);

      if (deleteError) throw deleteError;

      // 2. Update subjects_taught in tutor profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Tutor session not found");
      const tutorId = session.user.id;

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("subjects_taught")
        .eq("id", tutorId)
        .single();

      const current = Array.isArray(profileRow?.subjects_taught) ? profileRow.subjects_taught : [];
      const updated = current.filter((s) => s !== subject);

      await supabase
        .from("profiles")
        .update({ subjects_taught: updated })
        .eq("id", tutorId);

      alert(`Subject "${subject}" deleted successfully.`);

      // 3. Navigate to Create Subject page
      navigate("/create-subject");
    } catch (err) {
      console.error("Failed to delete subject:", err);
      alert("Failed to delete subject. See console.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>Please login to access this material</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-black tracking-tight">{subject.toUpperCase()}</h1>

      {profile.role === "teacher" ? (
        <div className="space-y-6">
          {/* Teacher Section with grade selector and actions */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4 shadow-sm">
            <p className="text-black font-medium">Welcome, {profile.display_name}</p>

            {/* Grade selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-black">Select Level:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 focus:border-black focus:ring-black text-black"
              >
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
              </select>
            </div>

            {/* Content actions */}
            <div className="flex flex-wrap gap-3 mt-2">
              {!hasContent ? (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={handleCreateContent}
                >
                  Create Subject Content
                </button>
              ) : (
                <div className="w-full">
                  <SubjectEditor
                    subjectName={subject}
                    gradeLevel={`Grade ${selectedGrade}`}
                    tutorId={profile.id}
                  />
                </div>
              )}

              <button
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                onClick={handleDeleteSubject}
              >
                Delete Subject
              </button>
            </div>
          </div>

          {/* Quizzes Tab */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Quizzes</h3>
            <SubjectQuizzesTab subjectId={subjectId} isTutor />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Student Section */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4 shadow-sm">
            <p className="text-black font-medium">Welcome, {profile.display_name} (Student)</p>

            {/* Grade selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-black">Select Grade:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 focus:border-black focus:ring-black text-black"
              >
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
              </select>
            </div>

            {/* Status messages */}
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
                subjectId={subjectId}
                gradeLevel={`Grade ${selectedGrade}`}
              />
            )}

            {/* End Match button */}
            {matchedTutorId && profile?.id && (
              <button
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                onClick={async () => {
                  try {
                    const { data: matches, error } = await supabase
                      .from("matches")
                      .select("*")
                      .eq("student_id", profile.id)
                      .eq("tutor_id", matchedTutorId)
                      .eq("status", "active")
                      .order("created_at", { ascending: false })
                      .limit(1);

                    if (error) throw error;

                    if (matches && matches.length > 0) {
                      const match = matches[0];
                      await endMatch(match.id);
                      setMatchedTutorId(null);
                      setHasContent(false);
                    }
                  } catch (err) {
                    console.error("Error ending match:", err);
                  }
                }}
              >
                End Match
              </button>
            )}
          </div>

          {/* Student Quizzes */}
          {matchedTutorId && (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Available Quizzes</h3>
              <SubjectQuizzesTab subjectId={subjectId} />
            </div>
          )}
        </div>
      )}
      
      {/* Nested routes outlet */}
      {children}
    </div>
  );
}