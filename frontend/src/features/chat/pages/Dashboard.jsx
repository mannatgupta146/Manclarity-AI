import React, { use, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism"
import ThemeToggleButton from "../../../theme/ThemeToggleButton"
// Removed useState, using Redux-managed state from useChat
import { useNavigate } from "react-router-dom"
import { useChat } from "../hooks/useChat"
import { setCurrentChatId, setChats } from "../chat.slice"
import { logout as logoutAction } from "../../auth/auth.slice"
import { logoutApi } from "../../auth/services/auth.api"
import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user)
  const isLoading = useSelector((state) => state.chat.isLoading)
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
  // On mount, load chats and restore selected chat from localStorage
  useEffect(() => {
    async function loadAndRestore() {
      await loadChats()
      const savedChatId = localStorage.getItem("currentChatId")
      if (savedChatId) {
        dispatch(setCurrentChatId(savedChatId))
      }
    }
    loadAndRestore()
  }, [])

  // After chats and currentChatId are set, load messages for selected chat if needed
  useEffect(() => {
    const savedChatId = localStorage.getItem("currentChatId")
    if (
      savedChatId &&
      chats[savedChatId] &&
      (!chats[savedChatId].messages || chats[savedChatId].messages.length === 0)
    ) {
      handleOpenChat(savedChatId)
    }
  }, [chats, currentChatId])

  // Handle sending a message
  // Persist currentChatId to localStorage when it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("currentChatId", currentChatId)
    }
  }, [currentChatId])

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
    "Ask Anything",
    "Fix a Problem",
    "Learn Something",
    "Explore Ideas",
  ]

  // Ref for chat messages area
  const messagesEndRef = React.useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, currentChatId])

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
                // Only reset currentChatId to null to start a new chat
                dispatch(setCurrentChatId(null))
              }}
              className="w-full mb-2 py-2 rounded-lg bg-(--color-accent) text-white font-bold text-[16px] border-none cursor-pointer flex items-center justify-center gap-2 shadow transition-all duration-150"
              title="Add Chat"
            >
              <span className="text-[20px] font-black leading-none">+</span> Add
              Chat
            </button>
          </div>
          {/* Chat list in fixed-height, scrollable area with custom scrollbar */}
          <div className="px-7 pb-2.5 overflow-y-auto h-85 chat-list-scrollbar overscroll-contain">
            {(() => {
              const filteredChats = Object.values(chats).filter(
                (chat) =>
                  typeof chat.title === "string" &&
                  chat.title
                    .toLowerCase()
                    .includes((search ?? "").toLowerCase()),
              )
              if (Object.keys(chats).length === 0) {
                return (
                  <div className="text-(--color-secondary) text-center mt-5">
                    No chats yet
                  </div>
                )
              } else if (filteredChats.length === 0) {
                return (
                  <div className="text-(--color-secondary) text-center mt-5">
                    No chats found for "
                    <span className="font-semibold">{search}</span>"
                  </div>
                )
              } else {
                return filteredChats
                  .sort((a, b) => {
                    // 'New Chat' (temp) always at top
                    const isATemp = a.id?.toString().startsWith("temp")
                    const isBTemp = b.id?.toString().startsWith("temp")
                    if (isATemp && !isBTemp) return -1
                    if (!isATemp && isBTemp) return 1
                    // Otherwise, sort by lastUpdated desc
                    const aTime = a.lastUpdated
                      ? new Date(a.lastUpdated).getTime()
                      : 0
                    const bTime = b.lastUpdated
                      ? new Date(b.lastUpdated).getTime()
                      : 0
                    return bTime - aTime
                  })
                  .map((chat) => {
                    // Format lastUpdated as HH:mm or fallback to blank
                    let time = ""
                    if (chat.lastUpdated) {
                      const d = new Date(chat.lastUpdated)
                      time = d.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    // Show 'New Chat' for temp chats
                    const isTemp = chat.id?.toString().startsWith("temp")
                    const displayTitle = isTemp ? "New Chat" : chat.title
                    return (
                      <div
                        key={chat.id || chat._id}
                        onClick={() => {
                          // Prevent reloading if already selected
                          if ((chat.id || chat._id) !== currentChatId) {
                            handleOpenChat(chat.id || chat._id)
                          }
                        }}
                        className={
                          `rounded-lg py-2 px-3.5 mb-2 cursor-pointer font-semibold text-[15px] transition-all duration-150 flex items-center justify-between ` +
                          (currentChatId === (chat.id || chat._id)
                            ? "border-2 border-(--color-accent) bg-(--color-accent-bg-selected,rgba(245,158,11,0.10)) text-(--color-accent)"
                            : "bg-(--color-chat-item-bg) text-(--color-chat-item-text) border border-(--color-border)")
                        }
                      >
                        <span>{displayTitle}</span>
                        <span className="ml-2 text-xs text-(--color-secondary) font-normal">
                          {time}
                        </span>
                      </div>
                    )
                  })
              }
            })()}
          </div>
        </div>
        {/* Bottom: user info, logout (ThemeToggleButton moved out) */}
        <div className="px-7">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-full bg-(--color-accent) text-white flex items-center justify-center font-bold text-[18px] uppercase shadow border-2 border-(--color-border)">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="font-bold text-[16px] text-(--color-chat-user-text)">
              {user?.username ? user.username : "User"}
            </span>
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 bg-red-400 text-white border-none rounded-lg py-2.5 font-semibold text-[15px] cursor-pointer mb-1 mt-1 hover:bg-red-500 active:bg-red-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2"
            onClick={async () => {
              // Call backend to clear cookie, then clear local state and redirect
              try {
                await logoutApi()
              } catch (e) {}
              localStorage.clear()
              dispatch(logoutAction())
              dispatch(setCurrentChatId(null))
              dispatch(setChats({}))
              navigate("/login")
            }}
            title="Logout from your account"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-2 opacity-90"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
      {/* Main chat area - margin left for sidebar, scrollable */}
      <main className="dashboard-main flex flex-col flex-1 min-h-screen bg-(--color-bg) text-(--color-text) z-10 ml-75 overscroll-contain">
        {/* Chat area and input fixed layout */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Theme toggle at top right of main chat area, fixed */}
          <div className="fixed right-0 top-0 z-30 p-6 pr-8">
            <ThemeToggleButton />
          </div>
          {/* Chat messages area, scrollable, fills all space above input */}
          <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-8 gap-2 flex-1 justify-start overflow-y-auto min-h-0 max-h-none hide-scrollbar">
            {currentChatId === null || messages.length === 0 ? (
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
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-(--color-accent) text-white font-bold text-md shadow select-none">
                        {(user?.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="px-4 py-2 rounded-2xl shadow border border-transparent wrap-break-word whitespace-pre-line max-w-120 bg-(--color-chat-user-bg) text-(--color-chat-user-text)">
                        <span className="block text-xs font-semibold text-(--color-secondary) mb-1">
                          {user?.username ? user.username : "User"}
                        </span>
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
                        {msg.content === "..." ? (
                          <span className="inline-block animate-pulse text-lg font-semibold text-(--color-secondary)">
                            ...
                          </span>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-sky-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-sky-300 font-medium transition-colors"
                                >
                                  {children}
                                </a>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-xl font-bold mt-3 mb-2">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-lg font-semibold mt-3 mb-2">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-semibold mt-2 mb-1">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-2 leading-relaxed">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc ml-5 mb-2">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal ml-5 mb-2">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="mb-1">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold">
                                  {children}
                                </strong>
                              ),
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-4 rounded-xl border border-(--color-border) bg-(--color-card)">
                                  <table className="w-full text-sm text-left border-collapse">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => (
                                <thead className="bg-(--color-card) text-(--color-primary)">
                                  {children}
                                </thead>
                              ),
                              th: ({ children }) => (
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="px-4 py-3 border-t border-(--color-border) align-top">
                                  {children}
                                </td>
                              ),
                              tr: ({ children, ...props }) => (
                                <tr className="even:bg-[rgba(0,0,0,0.03)] hover:bg-(--color-table-row-hover) transition">
                                  {children}
                                </tr>
                              ),
                              code({ inline, className, children, ...props }) {
                                const [copied, setCopied] = useState(false)
                                const codeString = children.join
                                  ? children.join("")
                                  : String(children)
                                let lang = ""
                                if (
                                  className &&
                                  className.startsWith("language-")
                                ) {
                                  lang = className.replace("language-", "")
                                }
                                if (inline) {
                                  return (
                                    <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-300">
                                      {children}
                                    </code>
                                  )
                                }
                                return (
                                  <div className="relative my-3 group">
                                    <button
                                      type="button"
                                      className={`absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 bg-gray-700 text-white text-xs px-2 py-1 rounded shadow hover:bg-gray-900 transition font-semibold ${copied ? "bg-green-600" : ""}`}
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          codeString,
                                        )
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 1200)
                                      }}
                                      title="Copy code"
                                    >
                                      {copied ? "Copied!" : "Copy"}
                                    </button>
                                    <SyntaxHighlighter
                                      language={lang || undefined}
                                      style={codeTheme}
                                      customStyle={{
                                        borderRadius: "0.5rem",
                                        fontSize: "0.97em",
                                        padding: "1.2em",
                                        background: "#18181b",
                                        border: "1px solid #333",
                                        margin: 0,
                                      }}
                                      wrapLongLines={true}
                                    >
                                      {codeString}
                                    </SyntaxHighlighter>
                                  </div>
                                )
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {/* Always scroll to bottom */}
            <div ref={messagesEndRef} />
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
              disabled={isLoading}
            />
            <button
              type="submit"
              className="send-btn-modern flex items-center justify-center gap-2 bg-(--color-accent) text-white border-none rounded-full px-5 py-2 font-bold text-[16px] shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-(--color-accent-hover) focus:ring-offset-2 hover:bg-(--color-accent-hover) active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                />
              </svg>
            </button>
          </form>
        </div>
      </main>
      {/* Responsive styles are now in index.css */}
    </div>
  )
}

export default Dashboard
