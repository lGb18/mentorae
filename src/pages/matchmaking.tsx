import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Matchmaking() {
  const [loading, setLoading] = useState(false)
  const [match, setMatch] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  const findMatch = async () => {
    setLoading(true)
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const { data: p } = await supabase
      .from("profiles")
      .select("id, role, grade_level, subjects_needed, subjects_taught")
      .eq("id", user.id)
      .single()
    if (!p) return
    setProfile(p)

    const subjects = p.role === "student" ? p.subjects_needed : p.subjects_taught

    const { data: req, error } = await supabase
      .from("match_requests")
      .insert({
        user_id: p.id,
        role: p.role,
        subjects,
        grade_level: p.grade_level,
      })
      .select()
      .single()
    if (error) { console.error(error); setLoading(false); return }

    setRequestId(req.id)

    const interval = setInterval(async () => {
      const { data: matchData } = await supabase
        .from("matches")
        .select("*")
        .or(`student_id.eq.${p.id},tutor_id.eq.${p.id}`)
        .order("created_at", { ascending: false })
        .limit(1)

      if (matchData && matchData.length > 0) {
        setMatch(matchData[0])
        clearInterval(interval)
        setLoading(false)
      }
    }, 3000)
  }

  const cancelMatch = async () => {
    if (requestId) {
      await supabase.from("match_requests").update({ status: "cancelled" }).eq("id", requestId)
      setRequestId(null)
    }
    if (match) {
      await supabase.from("matches").update({ status: "cancelled" }).eq("id", match.id)
      setMatch(null)
    }
    setLoading(false)
  }

  const acceptMatch = async () => {
    if (!match || !profile) return

    const update = profile.role === "student" 
      ? { student_confirmed: true } 
      : { tutor_confirmed: true }

    const { data, error } = await supabase
      .from("matches")
      .update(update)
      .eq("id", match.id)
      .select()
      .single()
    if (error) console.error(error)
    else setMatch(data)
  }

  const isConfirmed = match?.student_confirmed && match?.tutor_confirmed

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {!loading && !match && (
        <button
          onClick={findMatch}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Find a Match
        </button>
      )}

      {loading && !match && (
        <div className="flex flex-col items-center gap-2">
          <p>Searching for a match...</p>
          <button
            onClick={cancelMatch}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      )}

      {match && (
        <div className="rounded border p-4 shadow w-full max-w-md">
          <h2 className="font-bold">Match Found!</h2>
          <p>Subject: {match.subject}</p>
          <p>Grade Level: {match.grade_level}</p>
          <p>Status: {match.status}</p>

          {!isConfirmed ? (
            <div className="mt-3 flex gap-2">
              <button
                onClick={acceptMatch}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={cancelMatch}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-2 text-green-600 font-semibold">
              ✅ Match confirmed!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
