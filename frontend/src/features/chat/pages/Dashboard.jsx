import React, { useEffect } from "react"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"
import { useSelector } from "react-redux"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useChat } from "../hooks/useChat"

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const { initializeSocketConnection } = useChat()
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  // Dummy messages for demonstration
  const [messages, setMessages] = useState([
    { sender: "user", text: "Hello, AI!" },
    { sender: "ai", text: "Hello! How can I assist you today?" },
    { sender: "user", text: "Tell me a joke." },
    {
      sender: "ai",
      text: "Why did the developer go broke? Because he used up all his cache!",
    },
  ])
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const tags = [
    "Getting Started",
    "Account",
    "Billing",
    "Integrations",
    "Troubleshooting",
    "Feedback",
  ]
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])
  useEffect(() => {
    initializeSocketConnection()
  }, [])
  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
    setMessages([]) // Replace with fetched messages
  }
  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((prev) => [...prev, { sender: user?.name, text: input }])
    setInput("")
  }
  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  return (
    <div className="flex min-h-screen bg-(--color-bg) text-(--color-text) flex-row">
      {/* Sidebar */}
      <aside className="dashboard-sidebar flex flex-col justify-between bg-(--color-card) border-r-[1.5px] border-(--color-border) text-(--color-text) z-2 min-w-0 w-75 pb-4.5">
        <div>
          <div className="flex items-center gap-3 p-7 pt-7 pb-2.5">
            <img
              src="/brand.png"
              alt="Logo"
              className="w-7.5 h-7.5 rounded-lg shadow-[0_2px_8px_#f59e0b22]"
            />
            <span className="font-bold text-[22px] text-(--color-accent) tracking-[0.5px]">
              Manclarity AI
            </span>
          </div>
          {/* Search bar */}
          <div className="px-7 pb-2.5">
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={handleSearch}
              className="w-full p-[9px_14px] rounded-lg border-[1.5px] border-(--color-border) bg-(--color-chat-search-bg) text-(--color-chat-search-text) text-[15px] mb-2.5 outline-none box-border"
            />
          </div>
          {/* Chat list */}
          <div className="px-7 pb-2.5 flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="text-(--color-secondary) text-center mt-5">
                No chats yet
              </div>
            ) : (
              chats
                .filter((chat) =>
                  chat.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={
                      `rounded-lg p-[10px_14px] mb-2 cursor-pointer font-semibold text-[15px] transition-all duration-150 ` +
                      (selectedChat?.id === chat.id
                        ? "bg-(--color-accent) text-white border-2 border-(--color-accent)"
                        : "bg-(--color-chat-item-bg) text-(--color-chat-item-text) border-[1.5px] border-(--color-border)")
                    }
                  >
                    {chat.name}
                  </div>
                ))
            )}
            {/* Add chat button */}
            <button
              onClick={() => {
                // TODO: Implement add chat logic
                const newChat = {
                  id: Date.now(),
                  name: `New Chat ${chats.length + 1}`,
                }
                setChats([...chats, newChat])
              }}
              className="w-full mt-2.5 p-[10px_0] rounded-lg bg-(--color-accent) text-white font-bold text-[16px] border-none cursor-pointer flex items-center justify-center gap-2 shadow-[0_2px_8px_#f59e0b22] transition-all duration-150"
              title="Add Chat"
            >
              <span className="text-[20px] font-black leading-none">+</span> Add
              Chat
            </button>
          </div>
        </div>
        {/* Bottom: Theme toggle, user info, logout */}
        <div className="px-7">
          <div className="flex items-center gap-2.5 mb-4.5">
            <ThemeToggleButton />
          </div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-(--color-accent) text-white flex items-center justify-center font-bold text-[20px] uppercase shadow-[0_2px_x_#f59e0b22] border-2 border-(--color-border)">
              {user?.name?.[0] || "U"}
            </div>
            <span className="font-bold text-[16px] text-(--color-chat-user-text)">
              {user?.name || "User"}
            </span>
          </div>
          <button
            className="w-full bg-(--color-error-bg) text-(--color-error-text) border-[1.5px] border-(--color-error-border) rounded-lg p-[9px_0] font-bold text-[15px] cursor-pointer mb-0.5 mt-0.5 transition-all duration-150"
            onClick={() => {
              /* TODO: implement logout */
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="dashboard-main flex flex-col flex-1 min-h-screen bg-(--color-bg) text-(--color-text) z-1">
        {/* Welcome message and tags, only show if no chat messages */}
        <div className="flex-1 flex flex-col items-center min-w-0 w-full box-border px-2.5 z-0">
          <div
            className="flex flex-col w-full max-w-150 mx-auto px-4 py-8 gap-2 flex-1 justify-start overflow-y-auto"
            style={{ minHeight: 200 }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <h1 className="text-[32px] font-bold text-(--color-accent) mb-4.5 tracking-[0.2px]">
                  How can I help you today?
                </h1>
                <div className="flex gap-3 flex-wrap mb-7.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-(--color-card) border-[1.5px] border-(--color-border) text-(--color-secondary) dark:border-zinc-700 rounded-lg p-[7px_18px] font-bold text-[15px] cursor-pointer transition-all duration-150"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    "flex w-full mb-4 " +
                    (msg.sender === "user" ? "justify-end" : "justify-start")
                  }
                >
                  {msg.sender === "user" ? (
                    <div className="flex flex-row-reverse items-end gap-2 max-w-[70%]">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-(--color-accent) text-white font-bold text-sm shadow select-none">
                        {(user?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div
                        className="px-4 py-2 rounded-2xl shadow border border-transparent"
                        style={{
                          background: "var(--color-chat-user-bg)",
                          color: "var(--color-chat-user-text)",
                        }}
                      >
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2 max-w-[70%]">
                      <img
                        src="/brand.png"
                        alt="AI"
                        className="w-6 h-6 rounded-md shadow select-none"
                      />
                      <div className="px-4 py-2 rounded-2xl shadow border border-(--color-border) bg-(--color-card) text-(--color-primary)">
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        {/* Chat messages */}
        {/* Input bar */}
        <div className="w-full pb-8 flex justify-center box-border">
          <form
            className="w-full max-w-150 flex gap-2.5 box-border"
            onSubmit={handleSend}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-[13px_18px] rounded-[10px] border-[1.5px] border-(--color-border) bg-(--color-chat-input-bg) text-(--color-chat-input-text) text-[16px] outline-none box-border"
            />
            <button
              type="submit"
              className="bg-(--color-accent) text-white border-none rounded-[10px] p-[0_28px] font-bold text-[16px] cursor-pointer shadow-[0_2px_8px_#f59e0b22] transition-all duration-150"
            >
              Send
            </button>
          </form>
        </div>
      </main>
      {/* Responsive styles are now in index.css */}
    </div>
  )
}

export default Dashboard
