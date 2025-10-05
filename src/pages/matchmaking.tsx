import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useNavigate } from "react-router-dom"

export default function Matchmaking() {
  const [loading, setLoading] = useState(false)
  const [match, setMatch] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const navigate = useNavigate()

  // 🔍 MAIN MATCH FUNCTION
  const findMatch = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      setLoading(false)
      return
    }

    const { data: p, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, grade_level, subjects_needed, subjects_taught")
      .eq("id", user.id)
      .single()

    if (profileError || !p) {
      console.error("Profile fetch error:", profileError)
      setLoading(false)
      return
    }

    setProfile(p)

    // Determine subjects based on role
    let subjects: string[] = []
    if (p.role === "student" && Array.isArray(p.subjects_needed)) {
      subjects = p.subjects_needed.filter(Boolean)
    } else if (p.role === "teacher" && Array.isArray(p.subjects_taught)) {
      subjects = p.subjects_taught.filter(Boolean)
    }

    // Safe insert payload
    const payload = {
      user_id: p.id,
      role: p.role,
      subjects: subjects.length ? subjects : ["General"],
      grade_level: p.grade_level ?? "unspecified",
      status: "searching",
    }

    console.log("Insert payload:", payload)

    const { data: req, error } = await supabase
      .from("match_requests")
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error("Insert error:", error)
      setLoading(false)
      return
    }

    setRequestId(req.id)
    const { data: existing } = await supabase
      .from("match_requests")
      .select("*")
      .eq("status", "searching")
      .eq("role", p.role === "student" ? "teacher" : "student")
      .ilike('subjects', `%${payload.subjects[0]}%`)
      .limit(1)
      .single()

    // If found, create a match
    if (existing) {
      const subject =
        Array.isArray(subjects) && subjects.length > 0 ? subjects[0] : "General"

      const { error: matchError } = await supabase.from("matches").insert([
        {
          student_id: p.role === "student" ? p.id : existing.user_id,
          tutor_id: p.role === "teacher" ? p.id : existing.user_id,
          subject, // ✅ singular column
          grade_level: p.grade_level ?? "unspecified",
          status: "active",
        },
      ])

      if (matchError) console.error("Match creation error:", matchError)

      // Update both to matched
      await supabase
        .from("match_requests")
        .update({ status: "matched" })
        .in("id", [req.id, existing.id])
    }
    // Poll for matches every 3s
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

  // ❌ CANCEL MATCH
  const cancelMatch = async () => {
    if (requestId) {
      await supabase
        .from("match_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId)
      setRequestId(null)
    }
    if (match) {
      await supabase
        .from("matches")
        .update({ status: "cancelled" })
        .eq("id", match.id)
      setMatch(null)
    }
    setLoading(false)
  }

  // ✅ ACCEPT MATCH
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

  // 🔁 AUTO-REDIRECT WHEN CONFIRMED
  useEffect(() => {
    if (isConfirmed && match) {
      const timer = setTimeout(() => {
        navigate(`/video/${match.id}`)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isConfirmed, match, navigate])

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
              ✅ Match confirmed! Redirecting to meeting...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
