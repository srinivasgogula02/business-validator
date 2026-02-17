"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/types/database";
import { Brain, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatPanelProps {
    messages: Message[];
    isLoading: boolean;
    streamingContent: string;
}

export function ChatPanel({ messages, isLoading }: ChatPanelProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <ScrollArea className="flex-1 w-full min-h-0 px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {messages.map((message, index) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 animate-fade-in-up ${message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {message.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-[#03334c] flex items-center justify-center shrink-0 mt-0.5">
                                <Brain className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user"
                                ? "bg-[#03334c] text-white rounded-tr-md"
                                : "bg-[#f5f7fa] text-[#0f1729] rounded-tl-md border border-[#03334c]/5"
                                }`}
                        >
                            {message.role === "assistant" ? (
                                <FormattedMessage content={message.content} />
                            ) : (
                                message.content
                            )}
                        </div>

                        {message.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-[#e8f0f6] flex items-center justify-center shrink-0 mt-0.5">
                                <User className="w-4 h-4 text-[#03334c]" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#03334c] flex items-center justify-center shrink-0">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[#f5f7fa] rounded-2xl rounded-tl-md px-4 py-3 border border-[#03334c]/5">
                            <div className="flex gap-1.5 items-center h-5">
                                <div className="w-2 h-2 rounded-full bg-[#03334c]/40 typing-dot" />
                                <div className="w-2 h-2 rounded-full bg-[#03334c]/40 typing-dot" />
                                <div className="w-2 h-2 rounded-full bg-[#03334c]/40 typing-dot" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    );
}

// ─── Simple formatted message (handles bold, newlines) ──────────
function FormattedMessage({ content }: { content: string }) {
    if (!content) return null;

    const parts = content.split(/(\*\*.*?\*\*)/g);

    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                        <strong key={i} className="font-semibold">
                            {part.slice(2, -2)}
                        </strong>
                    );
                }
                // Handle newlines
                const lines = part.split("\n");
                return lines.map((line, j) => (
                    <span key={`${i}-${j}`}>
                        {line}
                        {j < lines.length - 1 && <br />}
                    </span>
                ));
            })}
        </span>
    );
}
