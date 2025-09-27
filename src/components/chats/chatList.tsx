import { useChatList } from "./useChatList"

export default function ChatList({ currentUserId, onSelectChat }: { currentUserId: string, onSelectChat: (id: string) => void }) {
  const { chats } = useChatList(currentUserId)

  return (
    <div>
      {chats.map(chat => {
        const lastMessage = chat.messages[chat.messages.length-1]
        return (
          <div key={chat.id} className="p-3 border-b cursor-pointer hover:bg-gray-100" onClick={()=>onSelectChat(chat.id)}>
            <div className="font-bold">Chat with {chat.matchmaking_id}</div>
            {lastMessage && <div className="text-gray-600 text-sm truncate">{lastMessage.content}</div>}
          </div>
        )
      })}
    </div>
  )
}
