"use client";

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
        }
    }, [input]);

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        if (input.trim() && !isLoading) {
            onSend(input.trim());
            setInput("");
            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="border-t border-[#03334c]/5 bg-white px-4 py-3 shrink-0">
            <form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto flex items-end gap-2"
            >
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your business idea..."
                        rows={1}
                        disabled={isLoading}
                        className="w-full resize-none rounded-xl border border-[#03334c]/10 bg-[#fafcfe] px-4 py-3 text-sm text-[#0f1729] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#03334c]/20 focus:border-[#03334c]/30 disabled:opacity-50 transition-all"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-[#03334c] hover:bg-[#03334c]/90 text-white rounded-xl h-[44px] w-[44px] p-0 shrink-0 disabled:opacity-30 cursor-pointer"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </form>
            <p className="text-[10px] text-[#94a3b8] text-center mt-2">
                Press Enter to send • Shift+Enter for new line
            </p>
        </div>
    );
}
