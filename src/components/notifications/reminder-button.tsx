import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  studentId: string
  subjectName: string
  tutorName: string
}

export function SendClassReminderButton({
  studentId,
  subjectName,
  tutorName,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const defaultMessage = `Hi,

This is a reminder for your ${subjectName} class with ${tutorName}.
Please make sure you're ready for the session.

— Mentorae`

  const [message, setMessage] = useState(defaultMessage)

  async function send() {
  setLoading(true)

  const { data, error } = await supabase.functions.invoke(
  "send-notification-email",
  {
    body: {
      type: "class_reminder",
      studentId,
      subjectName,
      tutorName,
      message,
    },
  }
)

if (error) {
  console.error("Edge Function error:", error)

  const res = error.context
  if (res) {
    const text = await res.text()
    console.error("Edge Function response body:", text)
  }

  alert("Failed to send reminder (check console)")
  return
}

console.log("Success:", data)
alert("Reminder sent")

}


  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-1 rounded border"
      >
        Send Class Reminder
      </button>

      {open && (
        <div className="border rounded p-3 bg-gray-50 space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full text-sm border rounded p-2"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={send}
              disabled={loading}
              className="text-sm px-3 py-1 rounded border bg-white"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
