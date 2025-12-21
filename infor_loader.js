document.addEventListener('DOMContentLoaded', () => {

    const eventsContainer = document.getElementById('events');
    const svg = document.getElementById('interactive-arrow');
    const actual_currentYear = new Date().getFullYear();

    const infoContainer = document.getElementById('info-container');
    const infoTitle = document.getElementById('info-title');
    const infoYear = document.getElementById('info_year');
    const infoText = document.getElementById('info-text');
    const infoPicture = document.getElementById('info-picture');
    magnitude = 1;
    first_year = 2500;
    current_year = 0;


    async function get_json_data(file_path) {
        return fetch(file_path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Could not fetch JSON from ${file_path}:`, error);
            });
    }
    
    async function loadAllEvents() {
        const response = await fetch('all_json_files.json');
        const fileNames = await response.json();
        const jsonFiles = fileNames.map(file => `json_infos/${file}`);
        console.log(jsonFiles);
        const allDataPromises = jsonFiles.map(filePath => get_json_data(filePath));
        const allData = await Promise.all(allDataPromises);
        return allData;
    }   
    json_data = loadAllEvents();
    add_event_divs();
    function add_event_divs() {
        json_data.then(dataArrays => {
            const allEvents = dataArrays.flat();
            console.log(allEvents);
            const existingMarkers = svg.querySelectorAll('.event-marker');
            existingMarkers.forEach(marker => marker.remove());
            for (const event of allEvents) {
                const formattedId = event.title.toLowerCase().replace(/\s+/g, '_');
                magnitude_txt = convert_magnitue_to_text(magnitude)
                let years_ago = (event.magnitude === "Years") ? (actual_currentYear - event.date) : event.date;
                //first_year = (magnitude_txt === "Years") ? currentYear - first_year : first_year;
                if (event.magnitude !=  magnitude_txt|| years_ago > first_year) continue;
                const x_pos = convert_years_to_x((first_year - years_ago) * magnitude, first_year * magnitude);
                // console.log(`Adding event: ${event.title} at x: ${x_pos}`);
                const eventLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                eventLine.setAttribute("id", formattedId);
                eventLine.setAttribute("x1", x_pos);
                eventLine.setAttribute("y1", "42");
                eventLine.setAttribute("x2", x_pos);
                eventLine.setAttribute("y2", "78");
                eventLine.setAttribute("stroke-width", "2");
                eventLine.style.stroke = event.color || "#FF0000";
                eventLine.classList.add('event-marker');

                const titleTag = document.createElementNS("http://www.w3.org/2000/svg", "title");
                titleTag.textContent = `${event.title} (${years_ago} ${magnitude_txt} years ago)`;
                eventLine.appendChild(titleTag);


                eventLine.addEventListener('mouseover', () => {
                    infoContainer.classList.remove('hidden');
                    showEventDetails(event);
            });
                svg.appendChild(eventLine);
            }
        });
    }
   
    document.addEventListener('click', (e) => {
        if (!infoContainer.contains(e.target)) {
            hideEventDetails();
        }
    });


    window.addEventListener('yearChanged', (e) => {
        current_year = e.detail.current_year;
        // Read all JSON files and update display based on current_year
    });
    window.addEventListener('magnitudeChanged', (e) => {
        isAbsolute = e.detail.isAbsolute;
        first_year = (isAbsolute) ? actual_currentYear - e.detail.first_year : e.detail.first_year;
        magnitude = e.detail.magnitude;
        add_event_divs();
        // Update any necessary calculations based on new magnitude or first year
    });
    function convert_years_to_x(years, first_date) {
        const x_cord = (years / first_date) * 1000;
        return x_cord;
    };

    function convert_magnitue_to_text(magnitude) {
		if (magnitude === 1e9) return "Billions";
		if (magnitude === 1e6) return "Millions";
		if (magnitude === 1e3) return "Thousands";
		return "Years";
	}

    function convert_text_to_magnitude(text) {
        if (text === "Billions") return 1e9;
        if (text === "Millions") return 1e6;
        if (text === "Thousands") return 1e3;
        return 1;
    }

    function hideEventDetails() {
    infoContainer.classList.add('hidden');
    }

    function showEventDetails(event) {
        infoTitle.textContent = event.title;
        let years_ago = (event.magnitude === "Years") ? (actual_currentYear - event.date) : event.date;
        infoYear.textContent = `Year: ${event.date} (${years_ago} ${event.magnitude} ago)`;
        infoText.textContent = event.text;
        if (event.picture) {
            infoPicture.src = "images/" + event.picture;
            infoPicture.alt = event.title;
            infoPicture.style.display = 'block';
        } else {
            infoPicture.style.display = 'none';
        }
    }

});