const input = document.getElementById('api_request_input');

input.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') {
        callGemini();
    }
});


async function callGemini() {
    const userInput = input.value;
    const outputElement = document.getElementById('ai-output');
    outputElement.innerText = ""; // Clear old text

    try {
        const response = await fetch('http://127.0.0.1:3000/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userInput })
        });

        // 1. Get a "Reader" for the incoming stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // 2. Read the stream piece by piece
        while (true) {
            const { done, value } = await reader.read();
            if (done) break; // Exit the loop when streaming is finished

            // 3. Convert the binary chunk back into text
            const chunkText = decoder.decode(value, { stream: true });
            
            // 4. Update the UI immediately
            outputElement.innerText += chunkText;
        }
        
    } catch (error) {
        console.error("Streaming failed:", error);
    }
}




