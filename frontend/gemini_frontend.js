const input_link = "ask-text"
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
const svg = document.getElementById('interactive-arrow');
let magnitude = null;
let years_ago = null;
let text = null;

input.addEventListener("keyup", async (event) => {
    if (event.key === "Enter") {
        //inputYear.value = 1700;
        //magnitudeSelect.value = "2";
        //viewing_style_checkbox.checked = true;
        // const event = new CustomEvent('magnitudeChanged', {
        //     detail: { first_year: 1700, magnitude: 1, isAbsolute: true }
        // });
        // window.dispatchEvent(event);
        event.preventDefault();
        const myEvent = {
            title: input.value,
            date: 0,
            magnitude: "Years",
            text: "Waiting for AI response..."
        };
        output.innerText = `Loading`;
        showEventDetails(myEvent);
        add_event_line()
        await callGemini();
        add_event_line()
    }
});

document.addEventListener('click', (e) => {
        if (!infoContainer.contains(e.target)) {
            hideEventDetails();
        }
});

function isValidInput(input) {
    if (input.length > 35) return false;
    if (input.trim().split(/\s+/).length > 5) return false;
    return true;
}

async function callGemini() {
    const prompt = input.value.trim();
    if (!isValidInput(prompt)) {
        output.innerText = "Input too long or too many words.";
        return;
    }
    const userInput = input.value;
    try {
        const response = await fetch(`http://localhost:3000/${input_link}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userInput }) // Send the prompt to Node
        });
        const data = await response.json();
        console.log(data)
        
        // Example: Put the answer on the screen
        output.innerText = `Done`;
        let isAbsolute = (data.magnitude == "Years")
        const myEvent = {
            title: input.value,
            text: data.text,
            magnitude: data.magnitude,
            color: "#ff0000",
            date: isAbsolute ? actual_currentYear - data.years_ago*2: data.years_ago*2
        };
        changeHeader(myEvent)
        requestSaveEvent(myEvent)
        
    } catch (error) {
        console.error("Failed to connect to the server:", error);
    }
}

function hideEventDetails() {
    infoContainer.classList.add('hidden');
}

function showEventDetails(event) {
    infoTitle.textContent = event.title;
    let isAbsolute = (event.magnitude == "Years")
    let years_ago = isAbsolute ? (actual_currentYear - event.date) : event.date;
    infoYear.textContent = `Year: ${event.date} (${years_ago} ${event.magnitude} ago)`;
    infoText.textContent = event.text;
    infoContainer.classList.remove('hidden');
}

function changeHeader(event) {
    inputYear.value = event.date;
    magnitudeSelect.value = convert_text_to_magnitude(event.magnitude);
    viewing_style_checkbox.checked = event.magnitude == "Years";
    console.log(event.magnitude)
    console.log(convert_text_to_magnitude(event.magnitude))
    const customEvent = new CustomEvent('magnitudeChanged', {
        detail: { first_year: event.date, magnitude: Number(convert_text_to_magnitude(event.magnitude)), isAbsolute: viewing_style_checkbox.checked }
    });
    window.dispatchEvent(customEvent);
    showEventDetails(event)
}

  function convert_text_to_magnitude(text) {
        if (text === "Billions") return "1e9";
        if (text === "Millions") return "1e6";
        if (text === "Thousands") return "1e3";
        return 1;
    }


function add_event_line() {
    const eventLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const length = 40;
    const start = 40
    eventLine.setAttribute("x1", "500");
    eventLine.setAttribute("y1", `${start}`);
    eventLine.setAttribute("x2", "500");
    eventLine.setAttribute("y2", `${start + length}`);
    eventLine.setAttribute("stroke-width", "5");
    eventLine.style.stroke = "#FF0000";
    eventLine.classList.add('event-marker');
    eventLine.style.strokeDasharray = length;
    eventLine.style.strokeDashoffset = length / 2;
    eventLine.style.animation = "expandCenter 5s ease-out forwards";
    svg.appendChild(eventLine);
}


async function requestSaveEvent(eventObject) {
    try {
        const response = await fetch('http://127.0.0.1:3000/save-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventObject)
        });

        console.log("test")

        if (response.status === 409) {
            const data = await response.json();
            alert(`Stop! This event already exists: ${data.message}`);
        } else if (response.ok) {
            console.log("Event saved successfully!");
        }
    } catch (error) {
        console.error("Save failed:", error);
    }
}
