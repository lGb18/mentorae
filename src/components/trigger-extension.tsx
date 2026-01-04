import { supabase } from "@/lib/supabaseClient"
import { useState } from "react"
import { toast } from "sonner"
export function TriggerExtensionPanel({
  studentId,
  subjectId,
  gradeLevel,
}: {
  studentId: string
  subjectId: string
  gradeLevel: string
}) {
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit() {
    setSaving(true)

    const { error } = await supabase
      .from("tutor_extensions")
      .insert({
        student_id: studentId,
        subject_id: subjectId,
        grade_level: gradeLevel,
        reason,
        status: "pending",
      })

    setSaving(false)

    if (error) {
      toast.error("Failed to trigger extension")
      return
    }

    toast.success("Extension request sent")
    setReason("")
  }

  return (
    <div className="border-t pt-3">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for extension"
        className="w-full border rounded p-2 text-sm"
      />

      <button
        onClick={submit}
        disabled={saving || !reason}
        className="mt-2 text-sm px-3 py-1 border rounded"
      >
        Request Extension
      </button>
    </div>
  )
}
