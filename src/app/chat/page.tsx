"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useVentureStore } from "@/lib/store";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ChatInput } from "@/components/chat/ChatInput";
import { VentureBoard } from "@/components/board/VentureBoard";
import { KnowledgeGraph, getCompletionPercentage } from "@/types/database";
import {
    Brain,
    Sparkles,
    PanelRightOpen,
    PanelRightClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";

import { Suspense } from "react";

function ChatContent() {
    const {
        venture,
        messages,
        addMessage,
        updateLastAssistantMessage,
        updateKnowledgeGraph,
        setStage,
        isLoading: isStoreLoading,
    } = useVentureStore();

    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showBoard, setShowBoard] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Initial greeting
    useEffect(() => {
        if (!isStoreLoading && messages.length === 0) {
            addMessage(
                "assistant",
                "Welcome! I'm your Business Validation Consultant at OnEasy. 👋\n\nI'm here to help you stress-test your business idea — think of me as a skeptical but supportive mentor who's seen hundreds of pitches.\n\nSo, **what brings you here today?** Are you validating a brand new idea, analyzing an existing business, exploring a new product line, or considering a pivot?"
            );
        }
    }, [isStoreLoading, messages.length, addMessage]);

    const handleSendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            // Add user message
            addMessage("user", content);

            // Prepare messages for API
            const apiMessages = [
                ...messages.map((m) => ({ role: m.role, content: m.content })),
                { role: "user" as const, content },
            ];

            setIsLoading(true);
            setStreamingContent("");

            // Add placeholder assistant message
            addMessage("assistant", "");

            try {
                abortControllerRef.current = new AbortController();

                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: apiMessages,
                        knowledgeGraph: venture.knowledge_graph,
                        stage: venture.stage,
                        ventureId: venture.id,
                    }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                // Read stage metadata from headers and update immediately for UI responsiveness
                const stageHeader = response.headers.get("X-Stage");
                if (
                    stageHeader &&
                    stageHeader !== venture.stage
                ) {
                    setStage(stageHeader as "discovery" | "analysis" | "report_ready");
                }

                // Read extraction metadata from headers
                const extractionHeader = response.headers.get("X-Extraction");

                if (extractionHeader) {
                    try {
                        const extraction = JSON.parse(
                            decodeURIComponent(extractionHeader)
                        );
                        updateKnowledgeGraph(extraction as Partial<KnowledgeGraph>);
                    } catch (e) {
                        console.error("Failed to parse extraction header:", e);
                    }
                }

                if (
                    stageHeader &&
                    stageHeader !== venture.stage
                ) {
                    setStage(stageHeader as "discovery" | "analysis" | "report_ready");
                }

                // Stream the response
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let fullContent = "";

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split("\n");

                        for (const line of lines) {
                            if (line.startsWith("0:")) {
                                // Text token
                                try {
                                    const text = JSON.parse(line.slice(2));
                                    fullContent += text;
                                    setStreamingContent(fullContent);
                                    updateLastAssistantMessage(fullContent);
                                } catch {
                                    // skip malformed lines
                                }
                            } else if (line.startsWith("9:")) {
                                // Custom Tool Call Token
                                try {
                                    const toolData = JSON.parse(line.slice(2));
                                    if (toolData.tool === "internet_search" || toolData.tool === "web_search") {
                                        setIsSearching(true);
                                        // Optional: You could add a "Searching for X..." toast or indicator here
                                    }
                                } catch (e) {
                                    console.error("Error parsing tool data:", e);
                                }
                            }
                        }
                    }
                }

                if (!fullContent) {
                    updateLastAssistantMessage(
                        "I apologize, but I encountered an issue processing your message. Could you try rephrasing that?"
                    );
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === "AbortError") return;
                console.error("Chat error:", error);
                updateLastAssistantMessage(
                    "I'm sorry, something went wrong on my end. Please try again in a moment."
                );
            } finally {
                setIsLoading(false);
                setIsSearching(false);
                setStreamingContent("");
                abortControllerRef.current = null;
            }
        },
        [messages, venture, isLoading, addMessage, updateLastAssistantMessage, updateKnowledgeGraph, setStage]
    );

    const completion = getCompletionPercentage(venture.knowledge_graph);

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* ─── Header ──────────────────────────────────────────── */}
            <header className="h-14 border-b border-[#03334c]/5 bg-white flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-[#03334c] flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-base font-semibold text-[#03334c]">
                            OnEasy
                        </span>
                    </Link>
                    <div className="h-5 w-px bg-[#e2e8f0] mx-1" />
                    <div className="flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-[#03334c]" />
                        <span className="text-sm font-medium text-[#03334c]">
                            Business Validator
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-[#f5f7fa] px-3 py-1.5 rounded-full">
                        <div
                            className={`w-2 h-2 rounded-full ${venture.stage === "discovery"
                                ? "bg-blue-500"
                                : venture.stage === "analysis"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                        />
                        <span className="text-xs font-medium text-[#03334c] capitalize">
                            {venture.stage.replace("_", " ")}
                        </span>
                        <span className="text-xs text-[#5a6b7f]">• {completion}%</span>
                    </div>

                    <LogoutButton />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBoard(!showBoard)}
                        className="text-[#03334c] lg:hidden"
                    >
                        {showBoard ? (
                            <PanelRightClose className="w-4 h-4" />
                        ) : (
                            <PanelRightOpen className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </header>

            {/* ─── Main Content ────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Chat */}
                <div
                    className={`flex-1 flex flex-col min-w-0 min-h-0 ${showBoard ? "lg:border-r lg:border-[#03334c]/5" : ""
                        }`}
                >
                    <ChatPanel
                        messages={messages}
                        isLoading={isLoading}
                        isSearching={isSearching}
                        streamingContent={streamingContent}
                    />
                    <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                </div>

                {/* Right: Venture Board */}
                {showBoard && (
                    <div className="hidden lg:block w-[380px] shrink-0 overflow-y-auto bg-[#fafcfe]">
                        <VentureBoard venture={venture} />
                    </div>
                )}
            </div>

            {/* Mobile Board Sheet */}
            {showBoard && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/20" onClick={() => setShowBoard(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-[340px] bg-white shadow-2xl overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-[#03334c]/5 flex items-center justify-between">
                            <span className="font-semibold text-[#03334c]">Venture Board</span>
                            <Button variant="ghost" size="sm" onClick={() => setShowBoard(false)}>
                                <PanelRightClose className="w-4 h-4" />
                            </Button>
                        </div>
                        <VentureBoard venture={venture} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-[#03334c]">Loading chat...</div>}>
            <ChatContent />
        </Suspense>
    );
}
