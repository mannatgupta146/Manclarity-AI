import React, { use, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"
// Removed useState, using Redux-managed state from useChat
import { useNavigate } from "react-router-dom"
import { useChat } from "../hooks/useChat"
import { setCurrentChatId, setChats } from "../chat.slice"
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
    handleOpenChat,
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
      {/* Sidebar - fixed, always visible */}
      <aside className="dashboard-sidebar flex flex-col justify-between bg-(--color-card) border-r border-(--color-border) text-(--color-text) z-20 min-w-0 w-75 pb-6 fixed left-0 top-0 h-screen max-w-full">
        <div>
          <div className="flex items-center gap-3 px-7 pt-7 pb-2.5">
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
              className="w-full py-2 px-3.5 rounded-lg border border-(--color-border) bg-(--color-chat-search-bg) text-(--color-chat-search-text) text-[15px] mb-2 outline-none box-border"
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
              className="w-full mb-2 py-2 rounded-lg bg-(--color-accent) text-white font-bold text-[16px] border-none cursor-pointer flex items-center justify-center gap-2 shadow transition-all duration-150"
              title="Add Chat"
            >
              <span className="text-[20px] font-black leading-none">+</span> Add
              Chat
            </button>
          </div>
          {/* Chat list in fixed-height, scrollable area with custom scrollbar */}
          <div className="px-7 pb-2.5 overflow-y-auto max-h-80 chat-list-scrollbar">
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
                    onClick={() => handleOpenChat(chat.id || chat._id)}
                    className={
                      `rounded-lg py-2 px-3.5 mb-2 cursor-pointer font-semibold text-[15px] transition-all duration-150 ` +
                      (currentChatId === (chat.id || chat._id)
                        ? "bg-(--color-accent) text-white border-2 border-(--color-accent)"
                        : "bg-(--color-chat-item-bg) text-(--color-chat-item-text) border border-(--color-border)")
                    }
                  >
                    {chat.title}
                  </div>
                ))
            )}
          </div>
        </div>
        {/* Bottom: user info, logout (ThemeToggleButton moved out) */}
        <div className="px-7">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-(--color-accent) text-white flex items-center justify-center font-bold text-[20px] uppercase shadow border-2 border-(--color-border)">
              {user?.name?.[0] || "U"}
            </div>
            <span className="font-bold text-[16px] text-(--color-chat-user-text)">
              {user?.name || "User"}
            </span>
          </div>
          <button
            className="w-full bg-(--color-error-bg) text-(--color-error-text) border border-(--color-error-border) rounded-lg py-2 font-bold text-[15px] cursor-pointer mb-1 mt-1 transition-all duration-150"
            onClick={() => {
              /* TODO: implement logout */
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      {/* Main chat area - margin left for sidebar, scrollable */}
      <main className="dashboard-main flex flex-col flex-1 min-h-screen bg-(--color-bg) text-(--color-text) z-10 ml-75">
        {/* Chat area and input fixed layout */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Theme toggle at top right of main chat area, fixed */}
          <div className="fixed right-0 top-0 z-30 p-6 pr-8">
            <ThemeToggleButton />
          </div>
          {/* Chat messages area, scrollable, fills all space above input */}
          <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-8 gap-2 flex-1 justify-start overflow-y-auto min-h-0 max-h-none hide-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <h1 className="text-[32px] font-bold text-(--color-accent) mb-4 tracking-[0.2px]">
                  How can I help you today?
                </h1>
                <div className="flex gap-3 flex-wrap mb-8">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-(--color-card) border border-(--color-border) text-(--color-secondary) rounded-lg py-2 px-5 font-bold text-[15px] cursor-pointer transition-all duration-150"
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
                      <div className="px-4 py-2 rounded-2xl shadow border border-transparent wrap-break-word whitespace-pre-line max-w-120 bg-(--color-chat-user-bg) text-(--color-chat-user-text)">
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2 max-w-200">
                      <img
                        src="/brand.png"
                        alt="AI"
                        className="w-6 h-6 rounded-md shadow select-none"
                      />
                      <div className="max-w-[85%] px-5 py-4 rounded-2xl shadow-md border border-(--color-border) bg-(--color-card) text-(--color-primary)">
                        
                        <ReactMarkdown
                          components={{
                            h1: ({children}) => (
                              <h1 className="text-xl font-bold mt-3 mb-2">{children}</h1>
                            ),
                            h2: ({children}) => (
                              <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>
                            ),
                            h3: ({children}) => (
                              <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>
                            ),

                            p: ({children}) => (
                              <p className="mb-2 leading-relaxed">{children}</p>
                            ),

                            ul: ({children}) => (
                              <ul className="list-disc ml-5 mb-2">{children}</ul>
                            ),

                            ol: ({children}) => (
                              <ol className="list-decimal ml-5 mb-2">{children}</ol>
                            ),

                            li: ({children}) => (
                              <li className="mb-1">{children}</li>
                            ),

                            strong: ({children}) => (
                              <strong className="font-bold">{children}</strong>
                            ),

                            code({inline, children}) {
                              return inline ? (
                                <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm">
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-black text-white p-3 rounded-lg overflow-x-auto my-2">
                                  <code>{children}</code>
                                </pre>
                              )
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>

                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        {/* Chat input fixed at bottom */}
        <div className="w-full flex justify-center box-border sticky bottom-0 bg-(--color-bg) z-10 pb-8 pt-2">
          <form
            className="w-full max-w-3xl flex gap-2.5 box-border"
            onSubmit={handleSend}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input ?? ""}
              onChange={handleInputChange}
              className="flex-1 py-3 px-4 rounded-lg border border-(--color-border) bg-(--color-chat-input-bg) text-(--color-chat-input-text) text-[16px] outline-none box-border"
            />
            <button
              type="submit"
              className="bg-(--color-accent) text-white border-none rounded-lg px-7 font-bold text-[16px] cursor-pointer shadow transition-all duration-150"
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
