import { tavily as Tavily } from "@tavily/core"

const tavily = Tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function searchInternet(query) {
    return await tavily.search(query, {
        maxResults: 5,
        includeSummaries: true,
        searchDepth: "advanced",
    });
}