// Ensure we have the Vercel AI Gateway key available in the environment
// The AI SDK automatically looks for AI_GATEWAY_API_KEY for 'openai/*' models if configured on Vercel
if (!process.env.AI_GATEWAY_API_KEY && process.env.VERCEL_API_KEY) {
    process.env.AI_GATEWAY_API_KEY = process.env.VERCEL_API_KEY;
}

// Model mapping using string identifiers, matching the 'vercel ai/demo' pattern
export const getModel = (useCase: "fast" | "quality"): string => {
    return useCase === "fast"
        ? "openai/gpt-4o-mini"
        : "openai/gpt-4o";
};

// Legacy gateway wrapper that now returns string identifiers
export const gateway = (modelId: string): string => {
    // Attempt to map requesting model ID to the active provider's equivalent
    if (modelId.includes("mini")) return getModel("fast");
    return getModel("quality");
};

import { tool } from "ai";
import { z } from "zod";

export const getSearchTool = () => {
    // Placeholder for web search. 
    // Ideally, this would use a search provider like Tavily or Exa, 
    // or Vercel AI Gateway's tools if available.
    // Vercel AI Gateway's tools if available.
    const params = z.object({ query: z.string() });
    return tool({
        description: "Search the web for real-time information. Use this when the user asks for current events or specific data not in your knowledge base.",
        parameters: params,
        execute: (async ({ query }: any) => {
            // Check if we can use Vercel's search (if it were working)
            // For now, return a message to the model so it knows search failed gracefully.
            return `[Search functionality is currently disabled. Please ignore this or ask the user to provide the information directly.]`;
        }) as any,
    });
};
