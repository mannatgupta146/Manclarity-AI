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
  const [messages, setMessages] = useState([])
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
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        flexDirection: "row",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 300,
          minWidth: 0,
          background: "var(--color-card)",
          borderRight: "1.5px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0 0 18px 0",
          color: "var(--color-text)",
          zIndex: 2,
        }}
        className="dashboard-sidebar"
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "28px 28px 10px 28px",
            }}
          >
            <img
              src="/brand.png"
              alt="Logo"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                boxShadow: "0 2px 8px #f59e0b22",
              }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "var(--color-accent)",
                letterSpacing: 0.5,
              }}
            >
              Manclarity AI
            </span>
          </div>
          {/* Search bar */}
          <div style={{ padding: "0 28px 10px 28px" }}>
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={handleSearch}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: 8,
                border: "1.5px solid var(--color-border)",
                background: "var(--color-chat-search-bg)",
                color: "var(--color-chat-search-text)",
                fontSize: 15,
                marginBottom: 10,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {/* Chat list */}
          <div
            style={{ padding: "0 28px 10px 28px", flex: 1, overflowY: "auto" }}
          >
            {chats.length === 0 ? (
              <div
                style={{
                  color: "var(--color-secondary)",
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
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
                    style={{
                      background:
                        selectedChat?.id === chat.id
                          ? "var(--color-accent)"
                          : "var(--color-chat-item-bg)",
                      color:
                        selectedChat?.id === chat.id
                          ? "#fff"
                          : "var(--color-chat-item-text)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 15,
                      border:
                        selectedChat?.id === chat.id
                          ? "2px solid var(--color-accent)"
                          : "1.5px solid var(--color-border)",
                      transition: "background 0.15s, color 0.15s, border 0.15s",
                    }}
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
              style={{
                width: "100%",
                marginTop: 10,
                padding: "10px 0",
                borderRadius: 8,
                background: "var(--color-accent)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 2px 8px #f59e0b22",
                transition: "background 0.15s",
              }}
              title="Add Chat"
            >
              <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                +
              </span>{" "}
              Add Chat
            </button>
          </div>
        </div>
        {/* Bottom: Theme toggle, user info, logout */}
        <div style={{ padding: "0 28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <ThemeToggleButton />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--color-accent)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 20,
                textTransform: "uppercase",
                boxShadow: "0 2px 8px #f59e0b22",
                border: "2px solid var(--color-border)",
              }}
            >
              {user?.name?.[0] || "U"}
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--color-chat-user-text)",
              }}
            >
              {user?.name || "User"}
            </span>
          </div>
          <button
            style={{
              width: "100%",
              background: "var(--color-error-bg)",
              color: "var(--color-error-text)",
              border: "1.5px solid var(--color-error-border)",
              borderRadius: 8,
              padding: "9px 0",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              marginBottom: 2,
              marginTop: 2,
              transition: "background 0.15s",
            }}
            onClick={() => {
              /* TODO: implement logout */
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      {/* Chat section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "var(--color-bg)",
          color: "var(--color-text)",
          zIndex: 1,
        }}
        className="dashboard-main"
      >
        {/* Chat area center */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
            padding: "0 10px",
          }}
        >
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "var(--color-accent)",
              marginBottom: 18,
              letterSpacing: 0.2,
            }}
          >
            How can I help you today?
          </h1>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 30,
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "var(--color-card)",
                  color: "var(--color-accent)",
                  border: "1.5px solid var(--color-accent)",
                  borderRadius: 8,
                  padding: "7px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {/* Input bar */}
        <div
          style={{
            width: "100%",
            padding: "0 0 32px 0",
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <form
            style={{
              width: "100%",
              maxWidth: 600,
              display: "flex",
              gap: 10,
              boxSizing: "border-box",
            }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "13px 18px",
                borderRadius: 10,
                border: "1.5px solid var(--color-border)",
                background: "var(--color-chat-input-bg)",
                color: "var(--color-chat-input-text)",
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "0 28px",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 2px 8px #f59e0b22",
                transition: "background 0.15s",
              }}
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
