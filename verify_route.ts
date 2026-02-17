import { gateway } from "./src/lib/ai/client";
import { generateObject, streamText } from "ai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Mock prompts to avoid importing the whole file if it has dependencies
const getExtractorPrompt = (kg: any) => "Extract information.";
const getConsultantPrompt = (kg: any, stage: string) => "You are a helpful consultant.";

// Mock Schema (simplified version of what's in route.ts)
const extractionSchema = z.object({
    core_inputs: z.object({
        context_type: z.enum(["new_idea", "existing_business", "new_product", "pivot"]).nullable(),
        business_idea: z.string().nullable(),
    }).nullable(),
    refinements: z.object({}).nullable(),
    validation_evidence: z.object({}).nullable(),
    red_flags: z.array(z.object({
        id: z.string(),
        type: z.string(),
        message: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        suggestion: z.string().nullable(),
    })).nullable(),
    should_reset: z.boolean().nullable(),
});

async function main() {
    console.log("Starting verification...");

    // 1. Test Extraction
    try {
        console.log("Testing generateObject (Extraction)...");
        const extraction = await generateObject({
            model: gateway("gpt-4o-mini"),
            schema: extractionSchema,
            prompt: "My business idea is a coffee shop.",
        });
        console.log("Extraction success:", extraction.object);
    } catch (e) {
        console.error("Extraction failed:", e);
    }

    // 2. Test Stream
    try {
        console.log("Testing streamText (Consultant)...");
        const result = streamText({
            model: gateway("gpt-4o"),
            system: "You are a helpful assistant.",
            messages: [{ role: "user", content: "Hello" }],
        });

        let text = "";
        for await (const chunk of result.textStream) {
            process.stdout.write(chunk);
            text += chunk;
        }
        console.log("\nStream success. Total length:", text.length);
    } catch (e) {
        console.error("Stream failed:", e);
    }
}

main().catch(console.error);
