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
        .contains("subjects", [payload.subjects[0]]) // <-- safer array match
      // .ilike('subjects', `%${payload.subjects[0]}%`)
      .limit(1)
      .single()

    //If found, create a match
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
      console.log("Polling matches for user:", p.id, "→ found:", matchData)

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

  //  ACCEPT MATCH
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
    useEffect(() => {
    if (!match?.id) return
    const channel = supabase
      .channel(`match-updates-${match.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${match.id}` },
        (payload) => {
          const updated = payload.new
          setMatch(updated)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [match?.id])
  // 🔁 AUTO-REDIRECT WHEN CONFIRMED
  useEffect(() => {
    if (isConfirmed && match) {
      const timer = setTimeout(() => {
        navigate(`/video/${match.id}`)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isConfirmed, match, navigate])
  const [hasActiveMatch, setHasActiveMatch] = useState(false);

const checkActiveMatches = async () => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
    .eq("status", "active")
    .eq("student_confirmed", true)
    .eq("tutor_confirmed", true);

  setHasActiveMatch(!!matches && matches.length > 0);
};

useEffect(() => {
  checkActiveMatches();
}, [match]);

const shouldShowFindMatch = () => {
  return !loading && !hasActiveMatch;
};

const getCurrentMatchStatus = () => {
  if (hasActiveMatch) {
    return {
      status: "has_active_match",
      message: "You currently have an active match",
      showActions: false
    };
  }
  
  if (match && match.status === 'active') {
    if (match.student_confirmed && match.tutor_confirmed) {
      return {
        status: "confirmed",
        message: "Match confirmed! Redirecting to meeting...",
        showActions: false
      };
    } else {
      const needsConfirmation = profile?.role === 'student' 
        ? !match.student_confirmed 
        : !match.tutor_confirmed;
      
      return {
        status: "pending_confirmation",
        message: needsConfirmation ? "Please confirm the match" : "Waiting for partner confirmation",
        showActions: needsConfirmation
      };
    }
  } else if (match && match.status === 'completed') {
    return {
      status: "completed",
      message: "Match completed",
      showActions: false
    };
  } else if (match && match.status === 'cancelled') {
    return {
      status: "cancelled", 
      message: "Match was cancelled",
      showActions: false
    };
  }
  
  return {
    status: "no_match",
    message: "No active matches",
    showActions: false
  };
};

const currentStatus = getCurrentMatchStatus();

return (
  <div className="flex flex-col items-center gap-6 p-6">
    {shouldShowFindMatch() && (
      <button
        onClick={findMatch}
        className="bg-black px-8 py-4 text-white hover:bg-gray-800 border-2 border-black font-medium text-lg"
      >
        Find a Match
      </button>
    )}

    {loading && !hasActiveMatch && (
      <div className="flex flex-col items-center gap-4">
        <div className="border-2 border-black p-6 bg-white text-center">
          <p className="text-gray-700 text-lg mb-4">Searching for a match...</p>
          <div className="animate-pulse">🔍</div>
        </div>
        <button
          onClick={cancelMatch}
          className="bg-white px-6 py-3 text-black hover:bg-gray-100 border-2 border-black font-medium"
        >
          Cancel Search
        </button>
      </div>
    )}

    <div className="border-2 border-black p-6 w-full max-w-md bg-white">
      <h2 className="font-bold text-xl mb-4 border-b-2 border-black pb-2">
        Current Status
      </h2>
      
      {hasActiveMatch ? (
        <div className="space-y-4">
          <div className="p-3 border-2 border-green-600 bg-green-50">
            <p className="text-green-800 font-large text-center">
              You have an active match
            </p>
          </div>
          <div className="text-center">
            
            <button
              onClick={() => navigate(`/video/${match?.id}`)}
              className="bg-black px-6 py-2 text-white hover:bg-gray-800 border-2 border-black font-medium"
            >
              Go to Session
            </button>
          </div>
        </div>
      ) : match && match.status === 'active' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p><span className="font-medium">Subject:</span> {match.subject}</p>
            <p><span className="font-medium">Grade Level:</span> {match.grade_level}</p>
            <p><span className="font-medium">Match Status:</span> {match.status}</p>
            <p><span className="font-medium">Student Confirmed:</span> {match.student_confirmed ? '✅' : '❌'}</p>
            <p><span className="font-medium">Tutor Confirmed:</span> {match.tutor_confirmed ? '✅' : '❌'}</p>
            <p><span className="font-medium">Your Role:</span> {profile?.role}</p>
          </div>

          <div className={`p-3 border-2 ${
            currentStatus.status === "confirmed" ? "border-green-600 bg-green-50" :
            "border-yellow-600 bg-yellow-50"
          }`}>
            <p className={`font-medium ${
              currentStatus.status === "confirmed" ? "text-green-800" : "text-yellow-800"
            }`}>
              {currentStatus.message}
            </p>
          </div>

          {currentStatus.showActions && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={acceptMatch}
                className="bg-black px-6 py-2 text-white hover:bg-gray-800 border-2 border-black font-medium flex-1"
              >
                Accept Match
              </button>
              <button
                onClick={cancelMatch}
                className="bg-white px-6 py-2 text-black hover:bg-gray-100 border-2 border-black font-medium flex-1"
              >
                Cancel Match
              </button>
            </div>
          )}
        </div>
      ) : match ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p><span className="font-medium">Subject:</span> {match.subject}</p>
            <p><span className="font-medium">Grade Level:</span> {match.grade_level}</p>
            <p><span className="font-medium">Match Status:</span> {match.status}</p>
          </div>

          <div className={`p-3 border-2 ${
            match.status === 'completed' ? 'border-gray-600 bg-gray-50' :
            'border-red-600 bg-red-50'
          }`}>
            <p className={`font-medium ${
              match.status === 'completed' ? 'text-gray-800' : 'text-red-800'
            }`}>
              {match.status === 'completed' ? '✅ Match completed' : '❌ Match cancelled'}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600">No active matches found.</p>
          <p className="text-sm text-gray-500 mt-2">
            {profile?.role === "student" 
              ? "Click 'Find a Match' to search for a tutor."
              : "Click 'Find a Match' to search for a student."
            }
          </p>
        </div>
      )}
    </div>
  </div>
)
}
