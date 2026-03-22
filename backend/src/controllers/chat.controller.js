import { generateChatTitle, generateResponse } from "../services/ai.service.js"
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js"

export async function sendMessage(req, res) {
  const { message, chat: chatId } = req.body

  if (!req.user || !req.user.id) {
    return res.status(401).json({
      message: "Unauthorized: user not authenticated",
      success: false,
    })
  }

  let chat = null
  let title = null
  let currentChatId

  if (!chatId) {
    title = await generateChatTitle(message)

    chat = await chatModel.create({
      user: req.user.id,
      title,
    })

    currentChatId = chat._id
  } else {
    currentChatId = chatId
  }

  await messageModel.create({
    chat: currentChatId,
    content: message,
    role: "user",
  })

  const messages = await messageModel
    .find({ chat: currentChatId })
    .sort({ createdAt: 1 })

  const result = await generateResponse(messages)

  const aiMessage = await messageModel.create({
    chat: currentChatId,
    content: result,
    role: "ai",
  })

  res.status(201).json({
    title,
    chat,
    aiMessage,
  })
}

export async function getChats(req, res) {
  const user = req.user

  // Get chats with updatedAt field
  const chats = await chatModel.find({ user: user.id }).sort({ updatedAt: -1 })

  // Map to include lastUpdated for frontend
  const chatsWithLastUpdated = chats.map((chat) => ({
    id: chat._id,
    title: chat.title,
    lastUpdated: chat.updatedAt,
  }))

  res.status(200).json({
    message: "Chats retrieved successfully",
    success: true,
    chats: chatsWithLastUpdated,
  })
}

export async function getMessages(req, res) {
  const { chatId } = req.params

  const chat = await messageModel.find({
    chat: chatId,
    user: req.user.id,
  })

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
      success: false,
    })
  }

  const messages = await messageModel.find({ chat: chatId })

  res.status(200).json({
    message: "Chat messages retrieved successfully",
    success: true,
    messages,
  })
}

export async function deleteChat(req, res) {
  const { chatId } = req.params

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  })

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
      success: false,
    })
  }

  await messageModel.deleteMany({
    chat: chatId,
  })

  res.status(200).json({
    message: "Chat deleted successfully",
    success: true,
  })
}
