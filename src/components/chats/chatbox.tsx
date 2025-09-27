import { useState, useEffect, useRef } from "react"
import { useChat } from "./useChat"

export default function ChatBox({ chatId, currentUserId }: { chatId: string, currentUserId: string }) {
  const { messages, sendMessage, fetchMessages, hasMore } = useChat(chatId, currentUserId)
  const [input, setInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const handleScroll = () => {
    if(containerRef.current?.scrollTop===0 && hasMore) fetchMessages()
  }

  const handleSend = () => { sendMessage(input); setInput("") }

  return (
    <div className="flex flex-col h-full border rounded shadow">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-2" onScroll={handleScroll}>
        {messages.map(msg => (
          <div key={msg.id} className={`p-2 my-1 max-w-xs rounded ${msg.sender_id===currentUserId ? "bg-blue-500 text-white self-end":"bg-gray-200 self-start"}`}>
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef}/>
      </div>
      <div className="flex border-t p-2">
        <input className="flex-1 border rounded p-2" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleSend()} placeholder="Type a message..."/>
        <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}

