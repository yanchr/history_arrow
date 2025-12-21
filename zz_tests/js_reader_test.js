const info = document.getElementById('info');

// I want to read the json file json_infos/important_humans.json and display the info in the info div
// from the beginning

document.addEventListener('DOMContentLoaded', () => {
    const file_path = 'json_infos/important_humans.json';

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
   
    const data = get_json_data('../json_infos/important_humans.json');
    data.then(data => {
            const allEvents = data.flat();

        allEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-info');

        const title = document.createElement('h2');
        title.textContent = event.title;
        eventDiv.appendChild(title);

        const text = document.createElement('p');
        text.textContent = event.text;
        eventDiv.appendChild(text);

            if (event.picture) {
                const img = document.createElement('img');
                img.src = "../images/" + event.picture;
                img.alt = event.title;
                img.style.maxWidth = "200px";
                eventDiv.appendChild(img);
            }

            info.appendChild(eventDiv);
        });});

    

    
});
