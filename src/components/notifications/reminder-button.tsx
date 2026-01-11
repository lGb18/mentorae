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

    setLoading(false)

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
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
      >
        Send Reminder
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Send Class Reminder
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {subjectName}
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full text-sm border border-gray-200 rounded-md p-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setOpen(false)}
                className="text-sm px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={send}
                disabled={loading}
                className="text-sm px-4 py-2 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Send Reminder"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}