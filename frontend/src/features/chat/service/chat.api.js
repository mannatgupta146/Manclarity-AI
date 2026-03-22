import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
})

export const sendMessageApi = async ({ message, chat }) => {
  const response = await api.post("/api/chats/message", { message, chat })
  return response.data
}

export const getChatsApi = async () => {
  const response = await api.get("/api/chats")
  return response.data
}

export const getChatMessagesApi = async (chatId) => {
  const response = await api.get(`/api/chats/${chatId}/messages`)
  return response.data
}

export const deleteChatApi = async (chatId) => {
  const response = await api.delete(`/api/chat/delete/${chatId}`)
  return response.data
}
