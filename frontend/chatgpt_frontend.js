const input = document.getElementById("api_request_input");
const output = document.getElementById("ai-output");
const yearP = document.querySelector('#year');
const inputYear = document.getElementById('input-year');
const magnitudeSelect = document.getElementById('magnitude-select');
const viewing_style_checkbox = document.getElementById('viewing-style-checkbox');
const infoContainer = document.getElementById('info-container');
const infoTitle = document.getElementById('info-title');
const infoYear = document.getElementById('info_year');
const infoText = document.getElementById('info-text');
const actual_currentYear = new Date().getFullYear();
let eventSource = null;
let buffer = "";
let magnitude = null;
let years_ago = null;
let text = null;

input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        inputYear.value = 1700;
        magnitudeSelect.value = "1";
        viewing_style_checkbox.checked = true;
        const event = new CustomEvent('magnitudeChanged', {
            detail: { first_year: 1700, magnitude: 1, isAbsolute: true }
        });
        window.dispatchEvent(event);
        const myEvent = {
            title: input.value,
            date: 0,
            magnitude: "Years",
            text: "Waiting for AI response..."
        };
        showEventDetails(myEvent);
        startStream();
    }
});

document.addEventListener('click', (e) => {
        if (!infoContainer.contains(e.target)) {
            hideEventDetails();
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
        output.innerText += event.data;
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

    emptyEvent = {title: "", date: 0, magnitude: "Years", text: ""};
    for (const line of lines) {
        showEventDetails(emptyEvent); // Show empty details while loading
        if (line.startsWith("magnitude=")) {
            magnitude = line.replace("magnitude=", "").trim();
            console.log("Magnitude:", magnitude);
        } else if (line.startsWith("years_ago=")) {
            years_ago = parseFloat(line.replace("years_ago=", "").trim());
            let years_ago = (magnitude === "Years") ? (actual_currentYear - years_ago) : years_ago;
            infoYear.textContent = `Year: ${years_ago} (${years_ago} ${magnitude} ago)`;
            console.log("Years ago:", years_ago);
        } else if (line.startsWith("text=")) {
            text = line.replace("text=", "").trim();
            infoText.textContent = text;
            console.log("Text:", text);
        }
    }
}

function hideEventDetails() {
    infoContainer.classList.add('hidden');
}

function showEventDetails(event) {
    infoTitle.textContent = event.title;
    let years_ago = (event.magnitude === "Years") ? (actual_currentYear - event.date) : event.date;
    infoYear.textContent = `Year: ${event.date} (${years_ago} ${event.magnitude} ago)`;
    infoText.textContent = event.text;
    infoContainer.classList.remove('hidden');
}
