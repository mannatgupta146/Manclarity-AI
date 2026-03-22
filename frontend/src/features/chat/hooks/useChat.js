import { initializeSocketConnection } from "../service/chat.socket"
import {
  sendMessageApi,
  getChatsApi,
  getChatMessagesApi,
  deleteChatApi,
} from "../service/chat.api.js"
import {
  createNewChat,
  addNewMessage,
  addMessages,
  setChats,
  setCurrentChatId,
  setIsLoading,
  setError,
  setInput,
  setSearch,
} from "../chat.slice.js"
import { useDispatch, useSelector } from "react-redux"

export const useChat = () => {
  const dispatch = useDispatch()
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const input = useSelector((state) => state.chat.input)
  const search = useSelector((state) => state.chat.search)

  async function handleSendMessage() {
    console.log(
      "handleSendMessage called. Input:",
      input,
      "CurrentChatId:",
      currentChatId,
    )
    if (!input || !input.trim()) return
    dispatch(setIsLoading(true))
    try {
      let chatId = currentChatId
      // If no chat is selected, create a new chat first
      if (!chatId) {
        // Create a new chat on the backend (or generate a temp id if backend does not require)
        const newChatTitle = `New Chat ${Object.keys(chats).length + 1}`
        // Option 1: If backend requires chat creation, call API here (not shown)
        // Option 2: If sendMessageApi auto-creates chat, just call it with null/undefined chat
        // We'll call sendMessageApi with no chat id
        console.log(
          "No chat selected, creating new chat with title:",
          newChatTitle,
        )
      }
      console.log("Calling sendMessageApi with:", {
        message: input,
        chat: chatId,
      })
      const data = await sendMessageApi({ message: input, chat: chatId })
      console.log("API response:", data)
      const { chat, aiMessage } = data
      dispatch(
        createNewChat({
          chatId: chat.id,
          title: chat.title,
        }),
      )
      dispatch(setCurrentChatId(chat.id))
      // Add both user and AI messages to the new chat
      dispatch(
        addNewMessage({
          chatId: chat.id,
          content: input,
          role: "user",
        }),
      )
      dispatch(
        addNewMessage({
          chatId: chat.id,
          content: aiMessage.content,
          role: aiMessage.role,
        }),
      )
      dispatch(setInput(""))
    } catch (err) {
      console.error("Send message error:", err)
      dispatch(setError("Failed to send message"))
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  async function loadChats() {
    dispatch(setIsLoading(true))
    try {
      const response = await getChatsApi()
      // Support both {chats: [...]} and [...] response
      const chatArray = Array.isArray(response)
        ? response
        : response.chats || []
      // Convert array to object keyed by id
      const chatObj = {}
      for (const chat of chatArray) {
        const id = chat._id || chat.id
        chatObj[id] = {
          id,
          title: chat.title,
          messages: [],
        }
      }
      console.log("[loadChats] chatObj:", chatObj)
      dispatch(setChats(chatObj))
    } catch (err) {
      dispatch(setError("Failed to load chats"))
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  const handleInputChange = (e) => {
    dispatch(setInput(e.target.value))
  }

  const handleSearchChange = (e) => {
    dispatch(setSearch(e.target.value))
  }

  const handleOpenChat = async (chatId) => {
    const data = await getChatMessagesApi(chatId)
    const { messages } = data

    const formattedMessages = messages.map((msg) => ({
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
    }))
    dispatch(
      addMessages({
        chatId,
        messages: formattedMessages,
      }),
    )
    dispatch(setCurrentChatId(chatId))
  }

  return {
    initializeSocketConnection,
    handleSendMessage,
    input,
    handleInputChange,
    search,
    handleSearchChange,
    chats,
    currentChatId,
    loadChats,
    handleOpenChat,
  }
}
