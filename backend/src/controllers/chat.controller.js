import { generateChatTitle, generateResponse } from "../services/ai.service.js"
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js"

export async function sendMessage(req, res) {
  const { message, chat: chatId } = req.body

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