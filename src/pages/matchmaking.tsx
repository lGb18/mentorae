// src/pages/matchmaking.tsx
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Matchmaking() {
  const [status, setStatus] = useState<"idle" | "searching" | "matched" | "error">("idle")
  const [match, setMatch] = useState<any>(null)

  async function fetchProfileAndRequest() {
    setStatus("searching")

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setStatus("error")
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      setStatus("error")
      return
    }

    
    const { data: request, error: reqError } = await supabase
      .from("match_requests")
      .insert([
        {
          user_id: profile.id,
          role: profile.role,
          subjects: profile.role === "student" ? profile.subjects_needed : profile.subjects_taught,
          grade_level: profile.grade_level,
        },
      ])
      .select()
      .single()

    if (reqError) {
      console.error(reqError)
      setStatus("error")
      return
    }

    
    pollForMatch(request.id)
  }

    async function pollForMatch(profileId: string) {
    const { data, error } = await supabase
        .from("matches")
        .select("*")
        .or(`student_id.eq.${profileId},tutor_id.eq.${profileId}`)

    if (error) {
        console.error("Error polling match:", error.message)
        return null
    }

    return data
    }


  return (
    <main className="flex flex-col items-center justify-center p-8">
      {status === "idle" && (
        <button
          onClick={fetchProfileAndRequest}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
        >
          Find a Match
        </button>
      )}

      {status === "searching" && <p>🔍 Searching for a match...</p>}

      {status === "matched" && match && (
        <div className="p-4 border rounded bg-green-100">
          <h2 className="font-bold">✅ Match Found!</h2>
          <p>Session ID: {match.id}</p>
          {/* Later: add "Join Session" button → video/chat page */}
        </div>
      )}

      {status === "error" && <p className="text-red-500">❌ Something went wrong.</p>}
    </main>
  )
}
