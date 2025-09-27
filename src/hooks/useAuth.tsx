import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { login, signUp, updateProfile, type Role } from "@/lib/auth"

type Profile = {
  id: string
  email: string
  role: Role
  display_name: string
  bio?: string | null
}

export function useAuth() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // fetch user + profile once on mount
  useEffect(() => {
    let mounted = true

    const init = async () => {
      setLoading(true)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(currentUser)

      if (currentUser?.id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()
        if (mounted) setProfile(p)
      }
      setLoading(false)
    }

    init()

    // listen to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)

      if (u?.id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single()
        setProfile(p)
      } else {
        setProfile(null)
      }
    })

    return () => {
      sub.subscription.unsubscribe()
      mounted = false
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  return {
    user,
    profile,
    loading,
    signUp,
    login,
    updateProfile,
    signOut,
  }
}

export default useAuth
