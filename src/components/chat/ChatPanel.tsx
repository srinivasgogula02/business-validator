"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/types/database";
import { Brain, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


interface ChatPanelProps {
    messages: Message[];
    isLoading: boolean;
    isSearching?: boolean;
    streamingContent: string;
}

export function ChatPanel({ messages, isLoading, isSearching, streamingContent }: ChatPanelProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, isSearching, streamingContent]);

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
                                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{message.content}</div>
                            )}
                        </div>

                        {message.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-[#e8f0f6] flex items-center justify-center shrink-0 mt-0.5">
                                <User className="w-4 h-4 text-[#03334c]" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading / Searching Indicator */}
                {(isLoading || isSearching) && (
                    <div className="flex justify-start animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-white border border-[#03334c]/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-3">
                            {isSearching ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-[#03334c] border-t-transparent animate-spin" />
                                    <span className="text-sm text-[#5a6b7f]">Searching the web...</span>
                                </>
                            ) : (
                                <div className="flex gap-1.5 py-1">
                                    <div className="w-1.5 h-1.5 bg-[#03334c]/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-[#03334c]/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-[#03334c]/40 rounded-full animate-bounce" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    );
}
