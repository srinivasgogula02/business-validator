import { gateway, getSearchTool } from "@/lib/ai/client";
import { streamText, generateObject } from "ai";
import { z } from "zod";
import { getExtractorPrompt, getConsultantPrompt } from "@/lib/ai/prompts";
import { KnowledgeGraph, getCompletionPercentage } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";

// ─── Extraction Schema ──────────────────────────────────────────
const extractionSchema = z.object({
    core_inputs: z
        .object({
            context_type: z
                .enum(["new_idea", "existing_business", "new_product", "pivot"])
                .nullable(),
            business_idea: z.string().nullable(),
            target_customer: z.string().nullable(),
            problem_statement: z.string().nullable(),
            solution_differentiation: z.string().nullable(),
            location: z.string().nullable(),
        })
        .nullable(),
    refinements: z
        .object({
            target_narrowed: z.string().nullable(),
            differentiation_clarified: z.string().nullable(),
            additional_context: z.string().nullable(),
            founder_market_fit: z.string().nullable(),
        })
        .nullable(),
    validation_evidence: z
        .object({
            interviews_conducted: z.boolean().nullable(),
            interview_count: z.number().nullable(),
            findings: z.string().nullable(),
            surveys: z.boolean().nullable(),
            pre_orders: z.boolean().nullable(),
            beta_testers: z.number().nullable(),
        })
        .nullable(),
    market_data: z
        .object({
            tam: z.string().nullable(),
            sam: z.string().nullable(),
            som: z.string().nullable(),
            competitors: z
                .array(
                    z.object({
                        name: z.string(),
                        type: z.enum(["global", "regional", "local"]),
                        description: z.string().nullable(),
                    })
                )
                .nullable(),
        })
        .nullable(),
    red_flags: z
        .array(
            z.object({
                id: z.string(),
                type: z.string(),
                message: z.string(),
                severity: z.enum(["low", "medium", "high"]),
                suggestion: z.string().nullable(),
            })
        )
        .nullable(),
    suggested_stage: z.enum(["discovery", "analysis", "report_ready"]).nullable(),
    should_reset: z.boolean().nullable(),
});

// ─── POST Handler ───────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const {
            messages,
            knowledgeGraph,
            stage,
            ventureId,
        }: {
            messages: { role: "user" | "assistant"; content: string }[];
            knowledgeGraph: KnowledgeGraph;
            stage: string;
            ventureId: string;
        } = await req.json();

        const supabase = await createClient();

        const lastUserMessage = messages[messages.length - 1];
        if (!lastUserMessage || lastUserMessage.role !== "user") {
            return new Response("No user message found", { status: 400 });
        }

        // ── Step A: Extractor (Worker) ────────────────────────────
        // Runs silently to extract business facts
        const contextMessages = messages.slice(-3); // Last 3 for context

        let extractedData = null;
        try {
            const extraction = await generateObject({
                model: gateway("gpt-4o-mini"), // This now maps to the active provider's fast model
                schema: extractionSchema,
                prompt: `${getExtractorPrompt(knowledgeGraph)}

RECENT CONVERSATION:
${contextMessages.map((m) => `${m.role}: ${m.content}`).join("\n")}

USER'S LATEST MESSAGE:
${lastUserMessage.content}

Extract any new business facts from the user's latest message. Return only changed/new fields.`,
            });
            extractedData = extraction.object;
        } catch (extractionError) {
            console.error("Extraction error (non-fatal):", extractionError);
            // Continue even if extraction fails — the consultant can still respond
        }

        // ── Merge extracted data into knowledge graph ─────────────
        const updatedKG = extractedData
            ? mergeExtraction(knowledgeGraph, extractedData)
            : knowledgeGraph;

        // ── Determine if stage should change ─────────────────────
        const completion = getCompletionPercentage(updatedKG);
        let updatedStage = stage;

        // Priority 1: Explicit suggestion from Extractor
        if (extractedData?.suggested_stage && extractedData.suggested_stage !== stage) {
            updatedStage = extractedData.suggested_stage;
        }
        // Priority 2: Reset to discovery if graph was wiped
        else if (updatedKG.core_inputs.business_idea === undefined && stage !== "discovery") {
            updatedStage = "discovery";
        }
        // Priority 3: Auto-advance to Analysis if core fields are full (fallback)
        else if (stage === "discovery" && completion >= 80) {
            updatedStage = "analysis";
        }

        // ── Phase 3: Report Generation (Triggered on transition) ─
        if (updatedStage === "report_ready" && stage !== "report_ready") {
            const reportSchema = z.object({
                validation: z.object({
                    score: z.number().min(0).max(100),
                    breakdown: z.object({
                        problem_clarity: z.number(),
                        solution_fit: z.number(),
                        market_opportunity: z.number(),
                        competitive_advantage: z.number(),
                    }),
                    verdict: z.enum(["strong_fit", "moderate_fit", "weak_fit", "no_fit"]),
                    strengths: z.array(z.string()),
                    weaknesses: z.array(z.string()),
                    risks: z.array(z.string()),
                    recommendations: z.array(z.string()),
                }),
                pitch_deck: z.object({
                    problem_slide: z.object({ title: z.string(), bullets: z.array(z.string()), source: z.string() }),
                    solution_slide: z.object({ title: z.string(), bullets: z.array(z.string()), source: z.string() }),
                    market_slide: z.object({ title: z.string(), bullets: z.array(z.string()), source: z.string() }),
                    competition_slide: z.object({ title: z.string(), bullets: z.array(z.string()), source: z.string() }),
                    why_now_slide: z.object({ title: z.string(), bullets: z.array(z.string()), source: z.string() }),
                    target_customer_slide: z.object({ title: z.string(), bullets: z.array(z.string()), source: z.string() }),
                }),
            });

            try {
                const reportGen = await generateObject({
                    model: gateway("gpt-4o"),
                    schema: reportSchema,
                    prompt: `You are a Senior Venture Capital Analyst. Use the data collected to generate a Final Validation Report and Pitch Deck Outline.
                    
                    DATA:
                    ${JSON.stringify(updatedKG, null, 2)}
                    
                    TASK:
                    1. Calculate a validation score (0-100) based on clarity, evidence, and market size.
                    2. Provide a verdict (strong/moderate/weak).
                    3. Outline 6 key pitch deck slides.
                    `,
                });

                updatedKG.outputs = {
                    ...updatedKG.outputs,
                    validation: reportGen.object.validation,
                    pitch_deck: reportGen.object.pitch_deck as any, // Type cast if needed
                };
            } catch (e) {
                console.error("Report generation failed:", e);
                // Fallback: Don't block, just don't have the report yet
            }
        }

        // ── Persist Updates to DB ───────────────────────────────
        if (ventureId) {
            // Update Venture with new Graph and Stage
            await supabase
                .from("ventures")
                .update({
                    knowledge_graph: updatedKG,
                    stage: updatedStage as any, // Cast to enum type if needed
                    updated_at: new Date().toISOString(),
                })
                .eq("id", ventureId);
        }

        // ── Step B: Consultant (Manager) ─────────────────────────
        // Streams the conversational response
        const result = streamText({
            model: gateway("gpt-4o"), // This now maps to the active provider's quality model
            system: getConsultantPrompt(updatedKG, updatedStage),
            tools: {
                internet_search: getSearchTool(),
            },
            messages: messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
            onFinish: async ({ text }) => {
                if (ventureId && text) {
                    await supabase.from("messages").insert({
                        venture_id: ventureId,
                        role: "assistant",
                        content: text,
                    });
                }
            },
        });

        // Build custom headers with metadata for client-side state updates
        const customHeaders: Record<string, string> = {
            "X-Stage": updatedStage,
            "X-Completion": String(getCompletionPercentage(updatedKG)),
        };

        // Prepare extraction data for client update
        let clientUpdates: Record<string, any> = extractedData || {};

        // If we generated a report, include it in the updates
        if (updatedKG.outputs.validation) {
            clientUpdates.outputs = updatedKG.outputs;
        }

        if (Object.keys(clientUpdates).length > 0) {
            customHeaders["X-Extraction"] = encodeURIComponent(
                JSON.stringify(clientUpdates)
            );
        }

        // Create a manual stream to format as Vercel AI Data Stream Protocol
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const part of result.fullStream) {
                        if (part.type === 'text-delta') {
                            const text = (part as any).textDelta ?? (part as any).text;
                            if (text) {
                                controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
                            }
                        } else if (part.type === 'tool-call') {
                            const args = (part as any).args ?? (part as any).input;
                            const toolInfo = { tool: part.toolName, query: args };
                            controller.enqueue(encoder.encode(`9:${JSON.stringify(toolInfo)}\n`));
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error("Stream processing error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                ...customHeaders,
            },
        });
    } catch (error) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({
                error: "Failed to process message. Please try again.",
                details: error instanceof Error ? error.message : String(error),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ─── Merge extraction results ────────────────────────────────────
function mergeExtraction(
    current: KnowledgeGraph,
    extracted: z.infer<typeof extractionSchema>
): KnowledgeGraph {
    const result = { ...current };

    if (extracted.core_inputs) {
        result.core_inputs = { ...result.core_inputs };
        Object.entries(extracted.core_inputs).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                (result.core_inputs as Record<string, unknown>)[key] = value;
            }
        });
    }

    if (extracted.refinements) {
        result.refinements = { ...result.refinements };
        Object.entries(extracted.refinements).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                (result.refinements as Record<string, unknown>)[key] = value;
            }
        });
    }

    if (extracted.validation_evidence) {
        result.validation_evidence = { ...result.validation_evidence };
        Object.entries(extracted.validation_evidence).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                (result.validation_evidence as Record<string, unknown>)[key] = value;
            }
        });
    }

    if (extracted.market_data) {
        result.market_data = { ...result.market_data };
        if (extracted.market_data.tam) result.market_data.tam = extracted.market_data.tam;
        if (extracted.market_data.sam) result.market_data.sam = extracted.market_data.sam;
        if (extracted.market_data.som) result.market_data.som = extracted.market_data.som;

        if (extracted.market_data.competitors && extracted.market_data.competitors.length > 0) {
            // Append new competitors, avoid duplicates by name
            const existingNames = new Set(result.market_data.competitors.map(c => c.name.toLowerCase()));
            const newCompetitors = extracted.market_data.competitors
                .filter(c => !existingNames.has(c.name.toLowerCase()))
                .map(c => ({
                    ...c,
                    type: c.type as "global" | "regional" | "local",
                    description: c.description || undefined
                }));
            result.market_data.competitors = [...result.market_data.competitors, ...newCompetitors];
        }
    }

    if (extracted.red_flags && extracted.red_flags.length > 0) {
        const existingKeys = new Set(
            result.red_flags.map((f) => `${f.type}:${f.message}`)
        );
        // Map nullable suggestions to undefined to match the RedFlag type
        const newFlags = extracted.red_flags
            .filter((f) => !existingKeys.has(`${f.type}:${f.message}`))
            .map((f) => ({
                ...f,
                suggestion: f.suggestion === null ? undefined : f.suggestion,
            }));

        result.red_flags = [...result.red_flags, ...newFlags];
    }

    if (extracted.should_reset) {
        // Reset to empty graph but keep structure
        return {
            core_inputs: {},
            refinements: {},
            validation_evidence: {},
            market_data: { competitors: [] },
            red_flags: [],
            outputs: {},
        } as KnowledgeGraph;
    }

    return result;
}
