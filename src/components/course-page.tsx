import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import SubjectEditor from "./subject-editor";
import SubjectViewer from "./subject-viewer";
import { endMatch } from "@/lib/match-table";
import { useNavigate } from "react-router-dom";
import { AssessmentList } from "@/components/assessment/assessment-list"
import { AssessmentBuilder } from "@/components/assessment/assess-builder"
import { AssessmentRunner } from "@/components/assessment/assess-runner"
import { Survey } from "survey-react";

type Profile = {
  id: string;
  email: string;
  role: "student" | "teacher";
  display_name: string;
};

type CoursePageProps = {
  subject: string;
  subjectId: string;
};

export default function CoursePage({ subject, subjectId }: CoursePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("1");
  const [matchedTutorId, setMatchedTutorId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"content" | "assessments">("content")
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null)

  const [refreshAssessments, setRefreshAssessments] = useState(0)
  const [title, setTitle] = useState("")
  const [savingTitle, setSavingTitle] = useState(false)
  const [activeAttempt, setActiveAttempt] = useState<any | null>(null)

  
  useEffect(() => {
    if (selectedAssessment) {
      setTitle(selectedAssessment.title)
    }
  }, [selectedAssessment?.id])

  useEffect(() => {
    setSelectedAssessment(null)
   
    setRefreshAssessments((v) => v + 1)
  }, [selectedGrade, subjectId])
 
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

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>Please login to access this material</p>;

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

  return (
  <div className="max-w-4xl mx-auto p-6 space-y-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
        {subject.toUpperCase()}
      </h1>

      {/* Tabs */}
      <div className="inline-flex w-fit rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab("content")}
          className={
            activeTab === "content"
              ? "px-4 py-2 text-sm font-semibold bg-black text-white"
              : "px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          }
        >
          Content
        </button>

        <button
          onClick={() => setActiveTab("assessments")}
          className={
            activeTab === "assessments"
              ? "px-4 py-2 text-sm font-semibold bg-black text-white"
              : "px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          }
        >
          Assessments
        </button>
      </div>
    </div>

    {/* ================= CONTENT TAB ================= */}
    {activeTab === "content" && (
      <div className="space-y-6">
        {/* Teacher Panel */}
        {profile.role === "teacher" && (
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
            <div className="p-6 space-y-4 text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-black font-medium">
                  Welcome, {profile.display_name}
                </p>

                <div className="flex flex-wrap gap-3">
                  {!hasContent && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={handleCreateContent}
                    >
                      Create Subject Content
                    </button>
                  )}

                  <button
                    className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded"
                    onClick={handleDeleteSubject}
                  >
                    Delete Subject
                  </button>
                </div>
              </div>

              {/* Grade selector */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <label className="text-sm font-medium text-black">
                  Select Level:
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 rounded px-2 py-2 text-black bg-white"
                >
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                </select>
                
              </div>
            </div>
          </div>
        )}

        {/* Subject Editor */}
        {profile.role === "teacher" && hasContent && (
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-lg font-semibold text-black">
                  Subject Content
                </h2>
                <p className="text-sm text-gray-600">Grade {selectedGrade}</p>
              </div>
            </div>

            <div className="p-6">
              <SubjectEditor
                subjectName={subject}
                gradeLevel={`Grade ${selectedGrade}`}
                tutorId={profile.id}
              />
            </div>
          </div>
        )}
      </div>
    )}

    {/* ================= ASSESSMENTS TAB ================= */}
    {activeTab === "assessments" && (
      <div key={refreshAssessments}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 lg:col-span-1">
          <h2 className="text-lg font-semibold text-black mb-3">Assessments</h2>

             <AssessmentList
                subjectId={subjectId}
                tutorId={profile.role === "teacher" ? profile.id : undefined}
                gradeLevel={`Grade ${selectedGrade}`}
                onSelect={setSelectedAssessment}
                refreshKey={refreshAssessments}
                />

              </div>
              
              <div className="lg:col-span-2">
                {selectedAssessment && profile.role === "teacher" && (
                  <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
                    <h2 className="text-lg font-semibold text-black mb-3">
                      Edit Assessment
                    </h2>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={async () => {
                        if (title === selectedAssessment.title) return
                        setSavingTitle(true)

                        const { data, error } = await supabase
                          .from("assessments")
                          .update({ title })
                          .eq("id", selectedAssessment.id)
                          .select()
                          .single()

                        setSavingTitle(false)

                        if (!error) {
                          setSelectedAssessment(data)
                          setRefreshAssessments((v) => v + 1)
                        }
                      }}
                      className="text-lg font-semibold border rounded px-2 py-1 w-full"
                    />
                    <p className="text-xs text-gray-500 mb-2">
                      {selectedAssessment.grade_level}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      Status:{" "}
                      {selectedAssessment.is_published ? (
                        <span className="text-green-600 font-medium">Published</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Draft</span>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            .from("assessments")
                            .update({ is_published: !selectedAssessment.is_published })
                            .eq("id", selectedAssessment.id)

                          if (!error) {
                            setSelectedAssessment(null)
                            setRefreshAssessments((v) => v + 1)
                          }
                        }}
                        className="text-sm px-3 py-1 rounded border"
                      >
                        {selectedAssessment.is_published ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        onClick={async () => {
                          if (!confirm("Delete this assessment? This cannot be undone.")) return

                          const { error } = await supabase
                            .from("assessments")
                            .delete()
                            .eq("id", selectedAssessment.id)

                          if (!error) {
                            setSelectedAssessment(null)
                            setRefreshAssessments((v) => v + 1)
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-800 border px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

              <AssessmentBuilder
                key={selectedAssessment.id}
                tutorId={profile.id}
                assessmentId={selectedAssessment.id}
                initialSchema={selectedAssessment.schema}
                onSave={async (schema) => {
                  const { data, error } = await supabase
                    .from("assessments")
                    .update({ schema })
                    .eq("id", selectedAssessment.id)
                    .select()
                    .single()

                  if (error) {
                    console.error(error)
                    alert("Failed to save assessment")
                    return
                  }

                  setSelectedAssessment(data)
                  setRefreshAssessments((v) => v + 1)
                  alert("Assessment saved")
                }}
              />
              <button
              onClick={() =>
                navigate(`/assessments/${selectedAssessment.id}/attempts`)
              }
              className="text-sm px-3 py-1 rounded border"
            >
              View Attempts
            </button>

                  
            </div>
            
          )}
          {selectedAssessment && profile.role === "student" && (
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-black mb-3">
              {selectedAssessment.title}
            </h2>
            
            <AssessmentRunner
              assessmentId={selectedAssessment.id}
              studentId={profile.id}
              schema={selectedAssessment.schema}
              passingScore={selectedAssessment.passing_score}
            />
            
          </div>
        )}

        </div>
      </div>
    )}
  </div>
)

}