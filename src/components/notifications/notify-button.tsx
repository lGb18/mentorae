import { supabase } from "@/lib/supabaseClient"
import { useState } from "react"

type Props = {
  studentId: string
  subjectName: string
  gradeLevel: string
}

export function NotifyStudentButton({
  studentId,
  subjectName,
  gradeLevel,
}: Props) {
  const [sending, setSending] = useState(false)

  async function notify() {
    setSending(true)

    const { error } = await supabase.functions.invoke(
      "send-progress-warning",
      {
        body: {
          studentId,
          subjectName,
          gradeLevel,
        },
      }
    )

    setSending(false)

    if (error) {
      alert("Failed to notify student")
      console.error(error)
    } else {
      alert("Student notified successfully")
    }
  }

  return (
    <button
      onClick={notify}
      disabled={sending}
      className="text-xs px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
    >
      {sending ? "Sending…" : "Notify Student"}
    </button>
  )
}
