const input = document.getElementById("api_request_input");
const output = document.getElementById("ai-output");
let buffer = "";
let magnitude = null;
let years_ago = null;
let text = null;
let eventSource = null;

input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        startStream();
    }
});

function startStream() {
    const prompt = input.value.trim();
    
    if (!isValidInput(prompt)) {
        output.innerText = "Input too long or too many words.";
        return;
    }
    console.log("Starting stream...");
    output.innerText = "";

    if (eventSource) {
        eventSource.close();
    }

    const url = `http://localhost:3000/ask-stream?prompt=${encodeURIComponent(prompt)}`;
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
        handleStreamData(event.data);
    };

    eventSource.addEventListener("done", () => {
        eventSource.close();
        eventSource = null;
    });

    eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        eventSource.close();
        eventSource = null;
    };
}

function isValidInput(input) {
    if (input.length > 35) return false;
    if (input.trim().split(/\s+/).length > 5) return false;
    return true;
}



function handleStreamData(chunk) {
    buffer += chunk;

    const lines = buffer.split("\n");
    buffer = lines.pop(); // incomplete line

    for (const line of lines) {
        if (line.startsWith("magnitude=")) {
            magnitude = line.replace("magnitude=", "").trim();
        } else if (line.startsWith("years_ago=")) {
            years_ago = parseFloat(line.replace("years_ago=", "").trim());
        } else if (line.startsWith("text=")) {
            text = line.replace("text=", "").trim();
        }
    }

    if (text) {
        output.innerText = text;
    }
}

