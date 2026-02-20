"use client";

import { useEffect, useState, useCallback } from "react";
import {
    KnowledgeGraph,
    Venture,
    VentureStage,
    Message,
    createEmptyKnowledgeGraph,
} from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export function useVentureStore() {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const ventureIdParam = searchParams.get("id");

    const [venture, setVenture] = useState<Venture>({
        id: "",
        stage: "discovery",
        knowledge_graph: createEmptyKnowledgeGraph(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
    const [messages, setMessages] = useState<Message[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // ─── 1. Initialize / Fetch Venture ──────────────────────────────
    useEffect(() => {
        async function init() {
            // Ensure auth
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                const { error: authError } = await supabase.auth.signInAnonymously();
                if (authError) {
                    console.error("Auth error:", authError);
                    // Fallback: Proceed without auth? Likely will fail RLS.
                }
            }

            if (ventureIdParam) {
                // Fetch existing
                const { data: v, error } = await supabase
                    .from("ventures")
                    .select("*")
                    .eq("id", ventureIdParam)
                    .single();

                if (error) {
                    console.error("Error fetching venture:", error);
                    router.replace("/");
                    return;
                }

                if (v) {
                    setVenture(v);
                    // Fetch messages
                    const { data: m } = await supabase
                        .from("messages")
                        .select("*")
                        .eq("venture_id", ventureIdParam)
                        .order("created_at", { ascending: true });
                    setMessages(m || []);
                    setIsInitialized(true);
                } else {
                    // Invalid ID, clear param (if v is null and no error, means not found)
                    router.replace("/");
                }
            } else {
                // Create new venture automatically
                const newVenture: Venture = {
                    id: uuidv4(),
                    stage: "discovery",
                    knowledge_graph: createEmptyKnowledgeGraph(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                // Optimistic set
                setVenture(newVenture);

                // Create in DB
                const { error } = await supabase.from("ventures").insert({
                    id: newVenture.id,
                    stage: newVenture.stage,
                    knowledge_graph: newVenture.knowledge_graph,
                });

                if (error) {
                    console.error("Error creating venture:", error);
                    // If error (e.g. table doesn't exist or RLS), maybe just stay in optimistic mode?
                    // But future parts (chat) depend on DB.
                    // IMPORTANT: If table doesn't exist, we can't do much.
                    // But for RLS 'null' issue, signInAnonymously might fix it IF the user ran the SQL.
                }

                // If no error, OR even if error (to allow debugging/viewing UI), we initialize.
                // But better to redirect if critical.
                // Let's allow initialization so UI shows up, but maybe show an error toast?
                // For now, allow proceed to unblock the Loading screen.
                if (!error) {
                    router.replace(`?id=${newVenture.id}`);
                }
                setIsInitialized(true);
            }
        }

        if (!isInitialized) {
            init();
        }
    }, [ventureIdParam, isInitialized, router, supabase]);

    // ─── 2. Realtime Subscription ──────────────────────────────────
    useEffect(() => {
        if (!venture.id) return;

        const channel = supabase
            .channel(`venture:${venture.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "ventures",
                    filter: `id=eq.${venture.id}`,
                },
                (payload) => {
                    setVenture(payload.new as Venture);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [venture.id, supabase]);

    // ─── 3. Actions ────────────────────────────────────────────────

    const addMessage = useCallback(
        async (role: "user" | "assistant", content: string) => {
            const newMessage: Message = {
                id: uuidv4(),
                venture_id: venture.id,
                role,
                content,
                created_at: new Date().toISOString(),
            };

            // Optimistic update
            setMessages((prev) => [...prev, newMessage]);

            // Persist to DB
            if (venture.id) {
                await supabase.from("messages").insert(newMessage);
            }

            return newMessage;
        },
        [venture.id, supabase]
    );

    const updateLastAssistantMessage = useCallback((content: string) => {
        setMessages((prev) => {
            const newMsgs = [...prev];
            const lastIdx = newMsgs.length - 1;
            if (lastIdx >= 0 && newMsgs[lastIdx].role === "assistant") {
                newMsgs[lastIdx] = { ...newMsgs[lastIdx], content };
            }
            return newMsgs;
        });
        // We don't persist every stream chunk, only the final one via API calls usually,
        // but here we might want to finalize it later. 
        // For simplicity, the Route Handler should save the final message.
        // The client-side streaming is just for display.
    }, []);

    const updateKnowledgeGraph = useCallback(
        async (updates: Partial<KnowledgeGraph>) => {
            setVenture((prev) => {
                const current = prev.knowledge_graph;
                const nextKG = { ...current };

                // Merge Core Inputs
                if (updates.core_inputs) {
                    nextKG.core_inputs = { ...nextKG.core_inputs, ...updates.core_inputs };
                }

                // Merge Refinements
                if (updates.refinements) {
                    nextKG.refinements = { ...nextKG.refinements, ...updates.refinements };
                }

                // Merge Validation Evidence
                if (updates.validation_evidence) {
                    nextKG.validation_evidence = { ...nextKG.validation_evidence, ...updates.validation_evidence };
                }

                // Merge Market Data
                if (updates.market_data) {
                    nextKG.market_data = { ...nextKG.market_data };
                    if (updates.market_data.tam) nextKG.market_data.tam = updates.market_data.tam;
                    if (updates.market_data.sam) nextKG.market_data.sam = updates.market_data.sam;
                    if (updates.market_data.som) nextKG.market_data.som = updates.market_data.som;

                    if (updates.market_data.competitors && updates.market_data.competitors.length > 0) {
                        const existingNames = new Set(nextKG.market_data.competitors.map(c => c.name.toLowerCase()));
                        const newCompetitors = updates.market_data.competitors.filter(c => !existingNames.has(c.name.toLowerCase()));
                        nextKG.market_data.competitors = [...nextKG.market_data.competitors, ...newCompetitors];
                    }
                }

                // Merge Red Flags
                if (updates.red_flags && updates.red_flags.length > 0) {
                    const existingKeys = new Set(nextKG.red_flags.map((f) => `${f.type}:${f.message}`));
                    const newFlags = updates.red_flags.filter((f) => !existingKeys.has(`${f.type}:${f.message}`));
                    nextKG.red_flags = [...nextKG.red_flags, ...newFlags];
                }

                // Merge Outputs
                if (updates.outputs) {
                    nextKG.outputs = { ...nextKG.outputs, ...updates.outputs };
                }

                // Merge Review Status
                if (updates.review_status) {
                    nextKG.review_status = { ...nextKG.review_status, ...updates.review_status };
                }

                return { ...prev, knowledge_graph: nextKG };
            });
        },
        []
    );

    const setStage = useCallback(
        async (stage: VentureStage) => {
            // Optimistic
            setVenture((prev) => ({ ...prev, stage }));
            if (venture.id) {
                await supabase
                    .from("ventures")
                    .update({ stage })
                    .eq("id", venture.id);
            }
        },
        [venture.id, supabase]
    );

    return {
        venture,
        messages,
        addMessage,
        updateLastAssistantMessage,
        updateKnowledgeGraph,
        setStage,
        isLoading: !isInitialized,
    };
}
