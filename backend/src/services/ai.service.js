import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatMistralAI } from "@langchain/mistralai"

import { HumanMessage, SystemMessage } from "langchain"

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
})

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
})

export async function generateResponse(message) {
  const response = await geminiModel.invoke([
    new HumanMessage(message)
  ])

  return response
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(
      `Generate a concise and descriptive title for the following conversation:
      User will provide a message, and you will generate a title that captures the essence of the conversation in 2-4 words. 
      The title should be catchy and relevant to the content of the message.`
    ),
    new HumanMessage(
      `Generate a title for chat conversation based on the following first message: "${message}"`
    )
  ])

  return response.text
}
