import { supabase } from "@/lib/supabaseClient"
import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"

export default function CreateSubject() {
  const [name, setName] = useState("")
  const [tutorId, setTutorId] = useState<string | null>(null)
  const [subjectsFromDB, setSubjectsFromDB] = useState<{ id: string; name: string }[]>([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  
  // ✅ Track mounted state
  const isMounted = useRef(true)

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // ✅ Fetch user and subjects once
  useEffect(() => {
    let mounted = true
    
    const getUserId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user?.id) {
          setTutorId(session.user.id)

          const { data, error } = await supabase
            .from("subjects")
            .select("id, name")
            .eq("tutor_id", session.user.id)
            .order("name", { ascending: true })
          
          if (!error && data && mounted) {
            setSubjectsFromDB(data)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        if (mounted) setInitialLoading(false)
      }
    }
    
    getUserId()
    
    return () => {
      mounted = false
    }
  }, [])

  // ✅ Memoize create handler
  const handleCreate = useCallback(async () => {
    if (!name.trim() || !tutorId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("subjects")
        .insert({ name: name.trim(), tutor_id: tutorId })
        .select()
        .single()
      
      if (error) throw error

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("subjects_taught")
        .eq("id", tutorId)
        .single()

      const current = Array.isArray(profileRow?.subjects_taught)
        ? profileRow.subjects_taught
        : []
      const updated = Array.from(new Set([...current, name.trim()]))

      await supabase
        .from("profiles")
        .update({ subjects_taught: updated })
        .eq("id", tutorId)

      if (isMounted.current) {
        setSubjectsFromDB((prev) => [...prev, { id: data.id, name: data.name }])
        setName("")
      }
    } catch (err) {
      console.error("Error creating subject:", err)
      alert("Failed to create subject. Check console for details.")
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [name, tutorId])

  if (initialLoading) {
    return (
      <div className="max-w-lg mx-auto mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-black mb-4">Create New Subject</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject Name"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          disabled={loading}
        />
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className={`px-4 py-2 rounded font-medium text-white ${
            loading || !name.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-black mb-2">Your Subjects</h3>
        {subjectsFromDB.length === 0 ? (
          <p className="text-gray-500 italic">No subjects created yet.</p>
        ) : (
          <ul className="space-y-2">
            {subjectsFromDB.map((subject) => (
              <li
                key={subject.id}
                className="px-3 py-2 bg-gray-100 rounded flex justify-between items-center"
              >
                <span className="text-black">{subject.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}