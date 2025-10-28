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
  const [error, setError] = useState<string | null>(null)

  // Fetch user profile data
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: p, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
      
      if (profileError) throw profileError
      return p
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load user profile')
      return null
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const init = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Get current session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Authentication error')
          return
        }

        if (session?.user) {
          setUser(session.user)
          const userProfile = await fetchUserProfile(session.user.id)
          if (mounted && userProfile) {
            setProfile(userProfile)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error('Auth init error:', err)
        if (mounted) {
          setError('Failed to initialize authentication')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    init()

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser?.id) {
          const userProfile = await fetchUserProfile(currentUser.id)
          if (mounted) {
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
      mounted = false
    }
  }, [fetchUserProfile])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (err) {
      console.error('Sign out error:', err)
      setError('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    login,
    updateProfile,
    signOut,
  }
}

export default useAuth