import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage } from "langchain"
import { searchInternet } from "./internet.service.js"

// ---------------- MODELS ----------------
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.3, // lower = more factual, less hallucination
})

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
})

// ---------------- RESPONSE FUNCTION ----------------
export async function generateResponse(messages) {
  const lastMsg = messages[messages.length - 1]

  // 🔥 STEP 1: ALWAYS SEARCH
  const result = await searchInternet(lastMsg.content)

  if (!result?.results || result.results.length === 0) {
    return "No relevant results found."
  }

  // 🔥 STEP 2: FILTER JUNK LINKS
  const filtered = result.results.filter(r =>
    !r.url.includes("olx") &&
    !r.url.includes("quikr") &&
    !r.url.includes("indiamart")
  )

  // 🔥 STEP 3: STRUCTURE DATA (SOURCE OF TRUTH)
  const context = filtered.map((r, i) => `
Source ${i + 1}:
Title: ${r.title}
Snippet: ${r.snippet}
URL: ${r.url}
`).join("\n")

  // 🔥 STEP 4: FORCE LLM TO USE ONLY THIS DATA
  const response = await geminiModel.invoke([
    new SystemMessage(`
You are an AI assistant that answers ONLY using provided search results.

STRICT RULES:
- DO NOT use your own knowledge.
- DO NOT guess or assume anything.
- DO NOT add information not present in sources.
- If information is unclear or missing → say "Not clearly stated in sources".
- NEVER say "I cannot access real-time data".

RESPONSE REQUIREMENTS:
- Minimum 150-250 words
- Use headings and bullet points
- Include dates if available
- Clearly explain the answer
- Keep it factual and grounded in sources

STRICTLY FORBIDDEN:
- Hallucinating facts
- Adding external knowledge
- Correcting sources using your own memory
`),

    new HumanMessage(`
Question:
${lastMsg.content}

Search Results (ONLY SOURCE OF TRUTH):
${context}

Instructions:
- Extract facts from sources
- Combine and summarize clearly
- Do NOT add anything extra
`)
  ])

  // 🔥 STEP 5: ADD SOURCES (LIKE PERPLEXITY)
  const sources = filtered
    .slice(0, 3)
    .map(r => `- ${r.url}`)
    .join("\n")

  return `${response.text}\n\nSources:\n${sources}`
}

// ---------------- TITLE GENERATION ----------------
export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`Generate a short 2-4 word title.`),
    new HumanMessage(message)
  ])

  return response.text.trim()
}