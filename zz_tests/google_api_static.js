const input = document.getElementById('api_request_input');
const askButton = document.getElementById('ask_for_string');

input.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') {
        callGemini();
    }
});


async function callGemini() {
    const userInput = input.value;
    try {
        const response = await fetch('http://localhost:3000/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userInput }) // Send the prompt to Node
        });

        const data = await response.json();
        
        // Example: Put the answer on the screen
        document.getElementById('ai-output').innerText = `Magnitude: ${data.magnitude}, Years Ago: ${data.years_ago}, Text: ${data.text}`;
        
    } catch (error) {
        console.error("Failed to connect to the server:", error);
    }
}


askButton.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/ask-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        console.log("magnitude:", data.magnitude);
        console.log("years_ago:", data.years_ago);
        console.log("text:", data.text);
    } catch (error) {
        console.error("Failed to connect to the server:", error);
    }
});




