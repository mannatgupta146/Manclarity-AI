import React, { use, useEffect } from "react"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"
// Removed useState, using Redux-managed state from useChat
import { useNavigate } from "react-router-dom"
import { useChat } from "../hooks/useChat"
import { setCurrentChatId } from "../chat.slice"
import { useDispatch, useSelector } from "react-redux"

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()

  // Debug: log currentChatId and chats on each render
  const chatState = useSelector((state) => state.chat)
  console.log(
    "[Dashboard render] currentChatId:",
    chatState.currentChatId,
    "chats:",
    chatState.chats,
  )

  // Remove local input/search state and handlers

  const dispatch = useDispatch()
  const chats = useSelector((state) => state.chat.chats)
  // Removed duplicate currentChatId, use from useChat()

  // Use chat actions from useChat hook
  const {
    handleSendMessage,
    input,
    handleInputChange,
    search,
    handleSearchChange,
    currentChatId,
    loadChats,
  } = useChat()

  // Fetch chats from backend on mount
  useEffect(() => {
    loadChats()
  }, [])

  // Handle sending a message
  const handleSend = (e) => {
    e.preventDefault()
    console.log(
      "Send button clicked. Input:",
      input,
      "CurrentChatId:",
      currentChatId,
    )
    if (!input || !input.trim()) return
    handleSendMessage()
  }

  // Get messages for the selected chat, or empty array if none
  const messages =
    currentChatId &&
    chats &&
    chats[currentChatId] &&
    chats[currentChatId].messages
      ? chats[currentChatId].messages
      : []

  const tags = [
    "Getting Started",
    "Account",
    "Billing",
    "Integrations",
    "Troubleshooting",
    "Feedback",
  ]

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
              value={search ?? ""}
              onChange={handleSearchChange}
              className="w-full p-[9px_14px] rounded-lg border-[1.5px] border-(--color-border) bg-(--color-chat-search-bg) text-(--color-chat-search-text) text-[15px] mb-2.5 outline-none box-border"
            />
            {/* Add chat button below search */}
            <button
              onClick={() => {
                const newId = Date.now().toString()
                const newChat = {
                  id: newId,
                  title: `New Chat ${Object.keys(chats).length + 1}`,
                  messages: [],
                }
                dispatch(
                  setChats({
                    ...chats,
                    [newId]: newChat,
                  }),
                )
                dispatch(setCurrentChatId(newId))
              }}
              className="w-full mb-2.5 p-[10px_0] rounded-lg bg-(--color-accent) text-white font-bold text-[16px] border-none cursor-pointer flex items-center justify-center gap-2 shadow-[0_2px_8px_#f59e0b22] transition-all duration-150"
              title="Add Chat"
            >
              <span className="text-[20px] font-black leading-none">+</span> Add
              Chat
            </button>
          </div>
          {/* Chat list in fixed-height, scrollable area with custom scrollbar */}
          <div
            className="px-7 pb-2.5 chat-list-scrollbar"
            style={{ maxHeight: "320px", overflowY: "auto" }}
          >
            {Object.keys(chats).length === 0 ? (
              <div className="text-(--color-secondary) text-center mt-5">
                No chats yet
              </div>
            ) : (
              Object.values(chats)
                .filter(
                  (chat) =>
                    typeof chat.title === "string" &&
                    chat.title
                      .toLowerCase()
                      .includes((search ?? "").toLowerCase()),
                )
                .map((chat) => (
                  <div
                    key={chat.id || chat._id}
                    onClick={() => {
                      dispatch(setCurrentChatId(chat.id || chat._id))
                    }}
                    className={
                      `rounded-lg p-[10px_14px] mb-2 cursor-pointer font-semibold text-[15px] transition-all duration-150 ` +
                      (currentChatId === (chat.id || chat._id)
                        ? "bg-(--color-accent) text-white border-2 border-(--color-accent)"
                        : "bg-(--color-chat-item-bg) text-(--color-chat-item-text) border-[1.5px] border-(--color-border)")
                    }
                  >
                    {chat.title}
                  </div>
                ))
            )}
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
            style={{
              minHeight: 200,
              maxHeight: "calc(100vh - 180px)",
              overflowY: "auto",
            }}
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
                    (msg.role === "user" ? "justify-end" : "justify-start")
                  }
                >
                  {msg.role === "user" ? (
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
                        <span>{msg.content}</span>
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
                        <span>{msg.content}</span>
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
              value={input ?? ""}
              onChange={handleInputChange}
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
