"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

export async function summarizeNote(content: string): Promise<string> {
  try {
    // Validate input
    if (!content || content.trim().length < 50) {
      throw new Error("Content is too short to summarize")
    }

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.")
    }

    // Initialize the Google Generative AI client with the API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Truncate content if it's too long (Gemini has token limits)
    const truncatedContent = content.length > 30000 ? content.substring(0, 30000) + "..." : content

    // Create a prompt for summarization
    const prompt = `
      Please summarize the following text in a concise way. 
      Focus on the key points and main ideas. 
      Format the summary with markdown, using bullet points for key takeaways.
      
      TEXT TO SUMMARIZE:
      ${truncatedContent}
    `

    // Generate the summary using Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(prompt)
    const response = result.response
    const summary = response.text()

    return summary
  } catch (error) {
    console.error("Error summarizing note:", error)
    if (error instanceof Error) {
      if (error.message.includes("403") || error.message.includes("API Key")) {
        throw new Error("Authentication error with Gemini API. Please check your API key configuration.")
      }
      throw new Error(error.message)
    }
    throw new Error("Failed to generate summary")
  }
}
