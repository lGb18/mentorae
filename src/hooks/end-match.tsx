import { supabase } from "@/lib/supabaseClient"

export async function endMatch(matchId: string, studentId: string, subjectId: string, gradeLevel: string) {
  // 🔒 Check extension
  const { data: extension } = await supabase
    .from("tutor_extensions")
    .select("id")
    .eq("student_id", studentId)
    .eq("subject_id", subjectId)
    .eq("grade_level", gradeLevel)
    .gt("expires_at", new Date().toISOString())

    .maybeSingle()

  if (extension) {
    throw new Error("Cannot end match while extension is active")
  }

  // ✅ Safe to end match
  return supabase
    .from("matches")
    .update({ status: "ended" })
    .eq("id", matchId)
}
