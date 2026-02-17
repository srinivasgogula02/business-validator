
const messages = [
    { role: 'user', content: 'Hello' }
];

async function main() {
    console.log("Fetching from http://localhost:3000/api/chat...");
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                // Mocking the store data expected by route.ts
                knowledgeGraph: {
                    core_inputs: {},
                    refinements: {},
                    validation_evidence: {},
                    red_flags: []
                },
                stage: 'discovery'
            })
        });

        if (!response.ok) {
            console.error("HTTP Error:", response.status, response.statusText);
            console.log(await response.text());
            return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            console.error("No reader available");
            return;
        }

        console.log("--- START STREAM ---");
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            console.log("CHUNK:", JSON.stringify(chunk));
        }
        console.log("--- END STREAM ---");

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

main();
