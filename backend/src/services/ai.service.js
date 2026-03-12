import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateResponse() {
    model.invoke("What is the capital of India?")
    .then((response) => {
        console.log("Response from Gemini:", response.text);
    }).catch((error) => {
        console.error("Error generating response:", error);
    });
}