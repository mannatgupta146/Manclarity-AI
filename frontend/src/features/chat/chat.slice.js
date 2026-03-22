import { createSlice, current } from "@reduxjs/toolkit"

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload
    },
    setInput: (state, action) => {
      state.input = action.payload
    },
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload
      state.chats[chatId] = {
        id: chatId,
        title,
        messages: [],
        lastUpdated: new Date().toISOString(),
      }
    },
    addNewMessage: (state, action) => {
      const { chatId, content, role, loading } = action.payload
      if (state.chats[chatId]) {
        const msg = {
          content,
          role,
          timestamp: new Date().toISOString(),
        }
        if (loading !== undefined) msg.loading = loading
        state.chats[chatId].messages.push(msg)
        state.chats[chatId].lastUpdated = new Date().toISOString()
      }
    },
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload
      state.chats[chatId].messages.push(...messages)
    },
    setChats: (state, action) => {
      state.chats = action.payload
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    replaceLoadingWithAI: (state, action) => {
      const { chatId, aiContent } = action.payload
      if (state.chats[chatId]) {
        const msgs = state.chats[chatId].messages
        const idx = msgs.findIndex(
          (msg) => msg.role === "ai" && msg.content === "..." && msg.loading,
        )
        if (idx !== -1) {
          msgs[idx] = {
            content: aiContent,
            role: "ai",
            timestamp: new Date().toISOString(),
          }
        } else {
          // fallback: just add AI message at the end
          msgs.push({
            content: aiContent,
            role: "ai",
            timestamp: new Date().toISOString(),
          })
        }
        // Remove any lingering loading messages (animation) if present
        state.chats[chatId].messages = msgs.filter(
          (msg) => !(msg.role === "ai" && msg.content === "..." && msg.loading),
        )
        state.chats[chatId].lastUpdated = new Date().toISOString()
      }
    },
  },
  search: "",
  input: "",
})

export const {
  createNewChat,
  addNewMessage,
  addMessages,
  setChats,
  setCurrentChatId,
  setIsLoading,
  setError,
  setSearch,
  setInput,
  replaceLoadingWithAI,
} = chatSlice.actions
export default chatSlice.reducer
