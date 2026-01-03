import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function StudentExtensionsPanel({ studentId }: { studentId: string }) {
  const [extensions, setExtensions] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from("tutor_extensions")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "pending")
      .then(({ data }) => setExtensions(data ?? []))
  }, [studentId])

  async function respond(id: string, accepted: boolean) {
    await supabase
      .from("tutor_extensions")
      .update({ status: accepted ? "accepted" : "declined" })
      .eq("id", id)

    setExtensions((e) => e.filter((x) => x.id !== id))
    toast.success(accepted ? "Extension accepted" : "Extension declined")
  }

  if (extensions.length === 0) return null

  return (
    <div className="space-y-3">
      {extensions.map((e) => (
        <div key={e.id} className="border rounded p-3">
          <p className="text-sm">{e.reason}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => respond(e.id, true)}
              className="text-sm px-3 py-1 border rounded"
            >
              Accept
            </button>
            <button
              onClick={() => respond(e.id, false)}
              className="text-sm px-3 py-1 border rounded"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
