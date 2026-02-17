import { ModelMessage, streamText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import 'dotenv/config';
import * as readline from 'node:readline/promises';

// ── Config ──────────────────────────────────────────────────────────────
const MODEL = 'openai/gpt-4.1';
const MAX_STEPS = 3;

const SYSTEM_PROMPT = `You are a helpful assistant with access to web search.

When the user asks about:
- Current events, breaking news, or recent developments
- Real-time data (stock prices, weather, sports scores, etc.)
- Information that may have changed after your training cutoff
- Specific facts you're unsure about

…use the web_search tool to find up-to-date information.

When presenting search results:
- Synthesize the information into a clear, concise answer
- Cite your sources with URLs when available
- If search results are conflicting, mention the discrepancy
- If the search doesn't return useful results, say so honestly`;

// ── Terminal setup ──────────────────────────────────────────────────────
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const messages: ModelMessage[] = [];

// ── Helpers ─────────────────────────────────────────────────────────────
const EXIT_COMMANDS = new Set(['exit', 'quit', 'bye', '/exit', '/quit']);

function isExitCommand(input: string): boolean {
    return EXIT_COMMANDS.has(input.trim().toLowerCase());
}

function printBanner() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║          🌐  Web Search Chat  (Vercel AI Gateway)      ║');
    console.log('║  Model: openai/gpt-4.1  •  Search: OpenAI WebSearch    ║');
    console.log('║  Type "exit" to quit  •  Ctrl+C to interrupt            ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
}

// ── Main loop ───────────────────────────────────────────────────────────
async function main() {
    printBanner();

    while (true) {
        const userInput = await terminal.question('You: ');

        // Handle empty input
        if (!userInput.trim()) continue;

        // Handle exit commands
        if (isExitCommand(userInput)) {
            console.log('\n👋  Goodbye!\n');
            terminal.close();
            process.exit(0);
        }

        messages.push({ role: 'user', content: userInput });

        try {
            const result = streamText({
                model: MODEL,
                system: SYSTEM_PROMPT,
                messages,
                tools: {
                    web_search: openai.tools.webSearch({}),
                },
                stopWhen: stepCountIs(MAX_STEPS),
            });

            let fullResponse = '';
            let isFirstTextChunk = true;
            let searchCount = 0;

            for await (const part of result.fullStream) {
                switch (part.type) {
                    case 'text-delta':
                        if (isFirstTextChunk) {
                            process.stdout.write('\nAssistant: ');
                            isFirstTextChunk = false;
                        }
                        fullResponse += part.text;
                        process.stdout.write(part.text);
                        break;

                    case 'tool-call':
                        searchCount++;
                        console.log(`\n🔍  Searching the web (query ${searchCount})...`);
                        break;

                    case 'tool-result':
                        console.log('✅  Search results received — generating answer...');
                        break;

                    case 'source':
                        // Display source URLs from search results
                        if ('url' in part && part.url) {
                            const title = ('title' in part && part.title) ? part.title : part.url;
                            console.log(`   📎 ${title}: ${part.url}`);
                        }
                        break;

                    case 'error':
                        console.error('\n⚠️  Stream error:', part.error);
                        break;
                }
            }

            process.stdout.write('\n\n');

            // Store the final text in conversation history
            if (fullResponse) {
                messages.push({ role: 'assistant', content: fullResponse });
            }
        } catch (error: unknown) {
            const errMsg =
                error instanceof Error ? error.message : String(error);
            console.error(`\n❌  Error: ${errMsg}`);
            console.log('   (You can keep chatting — the error was for this turn only)\n');

            // Remove the failed user message so history stays clean
            messages.pop();
        }
    }
}

// ── Graceful shutdown ───────────────────────────────────────────────────
process.on('SIGINT', () => {
    console.log('\n\n👋  Interrupted — goodbye!\n');
    terminal.close();
    process.exit(0);
});

// ── Start ───────────────────────────────────────────────────────────────
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
