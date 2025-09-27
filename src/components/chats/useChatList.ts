import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useChatList(currentUserId: string) {
  const [chats, setChats] = useState<any[]>([])

  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await supabase
        .from("chats")
        .select(`
          id,
          match_id,
          messages!inner(id, content, created_at, sender_id)
        `)
        .order("created_at", { ascending: false })
      if(data) setChats(data)
    }
    fetchChats()
  }, [currentUserId])

  return { chats }
}
