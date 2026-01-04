import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function SidebarUser() {
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // fetch current user
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()
        setUserName(profile?.full_name || user.email)
      } else {
        setUserName(null)
      }
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!userName) return null

  return (
    <div className="text-sm text-gray-700 px-2 py-2 border-t border-gray-100">
      Logged in as <span className="font-semibold">{userName}</span>
    </div>
  )
}
