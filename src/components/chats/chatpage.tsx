import { useState } from "react"
import ChatList from "./chatList"
import ChatBox from "./chatbox"

export default function ChatPage({ currentUserId }: { currentUserId: string }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  return (
    <div className="flex h-screen">
      {/* Left: Chat List */}
      <div className="w-1/3 border-r overflow-y-auto">
        <ChatList currentUserId={currentUserId} onSelectChat={setActiveChatId}/>
      </div>

      {/* Right: ChatBox */}
      <div className="flex-1">
        {activeChatId ? <ChatBox chatId={activeChatId} currentUserId={currentUserId}/> :
          <div className="flex items-center justify-center h-full text-gray-500">Select a chat to start messaging</div>
        }
      </div>
    </div>
  )
}
