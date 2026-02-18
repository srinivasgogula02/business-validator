// Ensure we have the Vercel AI Gateway key available in the environment
// The AI SDK automatically looks for AI_GATEWAY_API_KEY for 'openai/*' models if configured on Vercel
// Ensure we have the Vercel AI Gateway key available in the environment
// The AI SDK automatically looks for AI_GATEWAY_API_KEY for 'openai/*' models if configured on Vercel
if (!process.env.AI_GATEWAY_API_KEY && process.env.AI_API_KEY) {
    process.env.AI_GATEWAY_API_KEY = process.env.AI_API_KEY;
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

import { openai } from "@ai-sdk/openai";

export const getSearchTool = () => {
    return openai.tools.webSearch({});
};
