
// Function to fetch weather station data
async function fetchWeatherStations() {
    try {
      const station_api = await `${station_api}`;
      const response = await fetch(station_api.default);
      const data = await response.json();
      return data.greenIoTModuleData;
    } catch (error) {
      console.error('Error fetching weather stations:', error);
      return [];
    }
  }
  
  fetchWeatherStations()
    .then(data => console.log(data))
    .catch(err => console.error(err));
  