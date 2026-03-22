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
  replaceLoadingWithAI,
} from "../chat.slice.js"
import { useDispatch, useSelector } from "react-redux"

import { store } from "../../../app/app.store.js"

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
    let chatId = currentChatId
    let isNewChat = false
    let tempChatId = chatId
    if (!chatId) {
      isNewChat = true
      tempChatId = `temp-${Date.now()}`
      dispatch(
        createNewChat({
          chatId: tempChatId,
          title: `New Chat`,
        }),
      )
      dispatch(setCurrentChatId(tempChatId))
      // Add user message immediately
      dispatch(
        addNewMessage({
          chatId: tempChatId,
          content: input,
          role: "user",
        }),
      )
      // Add temporary AI loading message
      dispatch(
        addNewMessage({
          chatId: tempChatId,
          content: "...",
          role: "ai",
          loading: true,
        }),
      )
    } else {
      // Add user message immediately
      dispatch(
        addNewMessage({
          chatId: tempChatId,
          content: input,
          role: "user",
        }),
      )
      // Add temporary AI loading message
      dispatch(
        addNewMessage({
          chatId: tempChatId,
          content: "...",
          role: "ai",
          loading: true,
        }),
      )
    }
    dispatch(setInput(""))
    try {
      const data = await sendMessageApi({
        message: input,
        chat: isNewChat ? undefined : chatId,
      })
      const { chat, aiMessage } = data
      const resolvedChatId = chat?.id || chat?._id
      // Ensure aiMessage has role: 'ai' and log for debugging
      const safeAiMessage = {
        ...aiMessage,
        role: "ai",
      }
      console.log("[handleSendMessage] aiMessage:", safeAiMessage)
      if (isNewChat) {
        // ...existing code for new chat...
        const latestChats = store.getState().chat.chats
        const tempMessages = (latestChats[tempChatId]?.messages || []).filter(
          (msg) => !(msg.role === "ai" && msg.content === "..." && msg.loading),
        )
        const newChatObj = {
          ...latestChats,
          [resolvedChatId]: {
            id: resolvedChatId,
            title: chat.title,
            messages: [...tempMessages, safeAiMessage],
            lastUpdated: new Date().toISOString(),
          },
        }
        delete newChatObj[tempChatId]
        dispatch(setChats(newChatObj))
        dispatch(setCurrentChatId(resolvedChatId))
      } else {
        // For existing chat, replace the loading message with the real AI message
        dispatch(
          replaceLoadingWithAI({
            chatId: currentChatId,
            aiContent: safeAiMessage.content,
          }),
        )
      }
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
      // Convert array to object keyed by id, include lastUpdated
      const chatObj = {}
      for (const chat of chatArray) {
        const id = chat._id || chat.id
        chatObj[id] = {
          id,
          title: chat.title,
          lastUpdated: chat.lastUpdated || chat.updatedAt,
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
    // Clear previous messages before adding new ones
    dispatch(
      setChats({
        ...chats,
        [chatId]: {
          ...chats[chatId],
          messages: [],
        },
      }),
    )
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
