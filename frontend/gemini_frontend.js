const input_link = "ask"
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
const requestCounterP = document.getElementById('request-counter-p');
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
        
        // Example: Put the answer on the screen
        output.innerText = `Done`;
        let isAbsolute = (data.magnitude == "Years")
        const myEvent = {
            title: input.value,
            text: data.text,
            magnitude: data.magnitude,
            color: "#ff0000",
            date: isAbsolute ? actual_currentYear - data.years_ago: data.years_ago
        };

        requestCounterP.innerHTML = `
            Flash: ${data.currentCount.flash} / 20 <br> <br>
            Lite: ${data.currentCount.flash_lite} / 20
        `;

        requestSaveEvent(myEvent)
        changeHeader(myEvent)

        
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
    magnitudeSelect.value = convert_text_to_magnitude(event.magnitude);
    viewing_style_checkbox.checked = event.magnitude == "Years";
    let first_year = viewing_style_checkbox.checked? actual_currentYear - (actual_currentYear - event.date) * 2: event.date * 2
    inputYear.value = first_year
    const customEvent = new CustomEvent('magnitudeChanged', {
        detail: { first_year: first_year, magnitude: Number(convert_text_to_magnitude(event.magnitude)), isAbsolute: viewing_style_checkbox.checked }
    });
    window.dispatchEvent(customEvent);

    const secondEvent = new CustomEvent('reload')
    window.dispatchEvent(secondEvent)
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
    eventLine.style.stroke = "#0000aa";
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

        if (response.status === 409) {
            const data = await response.json();
            output.innerText = "Event alerady exists"
            // alert(`Stop! This event already exists: ${data.message}`);
        } else if (response.ok) {
            console.log("Event saved successfully!");
        }
    } catch (error) {
        output.innerText = error
        console.error("Save failed:", error);
    }
}
