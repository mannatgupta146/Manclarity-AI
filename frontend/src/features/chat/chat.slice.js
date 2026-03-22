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
      const { chatId, content, role } = action.payload

      if (state.chats[chatId]) {
        state.chats[chatId].messages.push({
          content,
          role,
          timestamp: new Date().toISOString(),
        })
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
} = chatSlice.actions
export default chatSlice.reducer
