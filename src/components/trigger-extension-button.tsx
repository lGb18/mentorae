import { supabase } from "@/lib/supabaseClient"

type Props = {
  studentId: string
  subjectId: string
  gradeLevel: string
}

export function TriggerExtensionButton({
  studentId,
  subjectId,
  gradeLevel,
}: Props) {
  async function trigger() {
    const { error } = await supabase.from("tutor_extensions").insert({
      student_id: studentId,
      subject_id: subjectId,
      grade_level: gradeLevel,
      reason: "Low progress detected",
    })

    if (error) {
      console.error(error)
      alert("Failed to trigger extension")
    } else {
      alert("Extension triggered")
    }
  }

  return (
    <button
      onClick={trigger}
      className="text-sm px-3 py-1 rounded border text-red-600 hover:bg-red-50"
    >
      Trigger Extension
    </button>
  )
}
