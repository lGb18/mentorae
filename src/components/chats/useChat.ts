import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useChat(chatId: string, currentUserId: string, pageSize = 50) {
  const [messages, setMessages] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchMessages = async (initial = false) => {
    if (!hasMore && !initial) return
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .range(offset, offset + pageSize - 1)
    if (data && data.length > 0) {
      setMessages((prev) => (initial ? data : [...data, ...prev]))
      setOffset(offset + data.length)
      if (data.length < pageSize) setHasMore(false)
    } else {
      setHasMore(false)
    }
  }

  useEffect(() => {
    fetchMessages(true)
  }, [chatId])

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe()
    
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])

  const sendMessage = async (content: string) => {
    await supabase.from("messages").insert({ chat_id: chatId, sender_id: currentUserId, content })
  }

  return { messages, sendMessage, fetchMessages, hasMore }
}