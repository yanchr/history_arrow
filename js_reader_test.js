const info = document.getElementById('info');

// I want to read the json file json_infos/important_humans.json and display the info in the info div
// from the beginning

const file_path = 'json_infos/important_humans.json';

data = await loadData(file_path);

console.log(data)


async function loadData() {
  try {
    const response = await fetch('data.json'); // Path to your file
    const data = await response.json();        // Parse JSON into a JS object
    
    console.log(data);                         // Use your data here
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}

loadData();