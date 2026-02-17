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
            // This is usually handled by the server (Extractor), 
            // but if we need manual updates:
            // logic is complex to deep merge locally without lodash, 
            // but we can rely on immediate optimistic merge or just wait for server?
            // User prompt says "Extractor" updates it.
            // Client-side `updateKnowledgeGraph` might be needed for manual edits if any.
            // For now, we'll trust the Realtime subscription to update the state
            // after the Server updates it.
            // If we MUST update locally (e.g. manual edit), we call RPC or update query.
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
