// Importing APIs from api_keys.js
import { station_api, weather_api } from './api_keys.js';
// Function to fetch weather station data
async function fetchWeatherStations() {
    try {
      const station_api = await fetch(`${station_api}`);
      const data = await response.json();
      return data.greenIoTModuleData;
    } catch (error) {
      console.error('Error fetching weather stations:', error);
      return [];
    }
  }
  
// Function to fetch weather data based on selected station
async function fetchWeatherData(stationId, formattedOneHourBefore, formattedCurrentDate) {
  try {
    const response = await fetch(`${weather_api}`);
    const data = await response.json();
    return data.greenIoTData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return [];
  }
  }
  
// Update station number
function updateSelectedStation(stationNumber) {
  const selectedStationElement = document.getElementById('selectedStation');
  if (selectedStationElement) {
    selectedStationElement.textContent = `Choose a station to view below`;
  }
}

// Update current date and time
function updateDateTime() {
  const currentDateElement = document.getElementById('currentDate');
  const currentTimeElement = document.getElementById('currentTime');
  
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  if (currentDateElement && currentTimeElement) {
    currentDateElement.textContent = formattedDate;
    currentTimeElement.textContent = formattedTime;
  }
}

// Function to populate dropdown with weather stations
async function populateWeatherStations() {
  const stations = await fetchWeatherStations();
  const dropdownMenu = document.getElementById('stationDropdownMenu');
  const selectedStationHeader = document.getElementById('selectedStation');

  stations.forEach(station => {
      const dropdownItem = document.createElement('a');
      dropdownItem.classList.add('dropdown-item');
      dropdownItem.href = '#';
      dropdownItem.textContent = station.IoTModuleFieldDescription;

      dropdownItem.addEventListener('click', async () => {
          selectedStationHeader.textContent = station.IoTModuleFieldDescription;
          number = station.IoTModuleFieldID
          await updateDashboard(station);
      });

      dropdownMenu.appendChild(dropdownItem);
  });
}

// Function to update dashboard with weather data for the selected station
async function updateDashboard(selectedStation) {
  try {
    // Get current date and time
    const currentDate = new Date();
  
    // Subtract one hour from the current date
    const oneHourBefore = new Date(currentDate.getTime() - (60 * 60 * 1000)); // Subtracting milliseconds in an hour
  
    // Function to add leading zero if the number is less than 10
    const addLeadingZero = num => (num < 10 ? '0' + num : num);
  
    // Construct the one hour before date in the desired format (YYYY-MM-DDTHH:MM:SS.00)
    const formattedOneHourBefore =
      `${oneHourBefore.getFullYear()}-${addLeadingZero(oneHourBefore.getMonth() + 1)}-${addLeadingZero(oneHourBefore.getDate())}T` +
      `${addLeadingZero(oneHourBefore.getHours())}:${addLeadingZero(oneHourBefore.getMinutes())}:${addLeadingZero(oneHourBefore.getSeconds())}.00`;
  
    // Construct the current date in the desired format (YYYY-MM-DDTHH:MM:SS.00)
    const formattedCurrentDate =
      `${currentDate.getFullYear()}-${addLeadingZero(currentDate.getMonth() + 1)}-${addLeadingZero(currentDate.getDate())}T` +
      `${addLeadingZero(currentDate.getHours())}:${addLeadingZero(currentDate.getMinutes())}:${addLeadingZero(currentDate.getSeconds())}.00`;
  
    const weatherData = await fetchWeatherData(selectedStation.IoTModuleFieldID, formattedOneHourBefore, formattedCurrentDate);
  
    console.log('Selected Station ID:', selectedStation.IoTModuleFieldID);
    console.log('Weather Data:', weatherData);
  
    // Clear previous dashboard content
    const dashboardDiv = document.getElementById('dashboard');
    dashboardDiv.innerHTML = '';
    // Temp card
    if (weatherData.length > 0) {
      const entry = weatherData[0]; 
  
      // Update temperature value
      const temperatureValueElement = document.getElementById('temperatureValue');
        if (temperatureValueElement) {
        temperatureValueElement.innerHTML = `${entry.TempOut} &deg;C`;
        }
  
        // Update Min, Max, and Timestamp values
        const minValueElement = document.getElementById('minValue');
        const maxValueElement = document.getElementById('maxValue');
  
        if (minValueElement && maxValueElement) {
          minValueElement.textContent = `${entry.LowTemp} C`;
          maxValueElement.textContent = `${entry.HiTemp} C`;
          }
        } else {
          // Handle no data scenario by setting default or placeholder text
          const temperatureValueElement = document.getElementById('temperatureValue');
          const minValueElement = document.getElementById('minValue');
          const maxValueElement = document.getElementById('maxValue');
              
          if (temperatureValueElement) {
            temperatureValueElement.innerHTML = 'N/A';
            }
          if (minValueElement && maxValueElement) {
            minValueElement.textContent = 'N/A';
            maxValueElement.textContent = 'N/A';
            }
          }

    // Dew Point
    if (weatherData.length > 0) {
      const entry = weatherData[0];
      
      const dewValueElement = document.getElementById('dewValue');
      if (dewValueElement) {
        dewValueElement.innerHTML = `${entry.DewPoint} &deg;C`;
        }
      } else {
        const dewValueElement = document.getElementById('dewValue');
                  
        if (dewValueElement) {
          dewValueElement.innerHTML = 'N/A';
          }
        }
  
    // Humidity
      if (weatherData.length > 0) {
        const entry = weatherData[0];
        const humidityValueElement = document.getElementById('humidityValue');
        if (humidityValueElement) {
          humidityValueElement.innerHTML = `${entry.OutHum} %`;
          }
        } else {
          const humidityValueElement = document.getElementById('humidityValue');
          if (humidityValueElement) {
            humidityValueElement.innerHTML = 'N/A';
            }
          }
  
          if (weatherData.length > 0) {
            const entry = weatherData[0];
              
            const seValueElement = document.getElementById('seValue');
            if (seValueElement) {
              seValueElement.innerHTML = `${entry.SolarEnergy} W/m2`;
              }
            } else {
  
              const seValueElement = document.getElementById('seValue');
                          
              if (seValueElement) {
                seValueElement.innerHTML = 'N/A';
                }
              }
  
    // Rain
    if (weatherData.length > 0) {
      const entry = weatherData[0];
              
      const rainValueElement = document.getElementById('rainValue');
      if (rainValueElement) {
        rainValueElement.innerHTML = `${entry.Rain} mm`;
        }
      } else {
  
        const rainValueElement = document.getElementById('rainValue');
                            
        if (rainValueElement) {
          rainValueElement.innerHTML = 'N/A';
          }
        }
  
      // Solar radiation
      if (weatherData.length > 0) {
        const entry = weatherData[0];
              
        const srValueElement = document.getElementById('srValue');
        if (srValueElement) {
          srValueElement.innerHTML = `${entry.SolarRad}`;
          }
        } else {
  
          const srValueElement = document.getElementById('srValue');
                          
          if (srValueElement) {
            srValueElement.innerHTML = 'N/A';
             }
          }
  
      // Wind
      if (weatherData.length > 0) {
        const entry = weatherData[0]; 
  
        const windValueElement = document.getElementById('windValue');
        if (windValueElement) {
          windValueElement.innerHTML = `${entry.WindSpeed} km/h`;
          }
  
          const chillValueElement = document.getElementById('chillValue');
          const dirValueElement = document.getElementById('dirValue');
  
          if (chillValueElement && dirValueElement) {
            chillValueElement.textContent = `${entry.WindChill} C`;
            dirValueElement.textContent = `${entry.WindDir}`;
            }
          } else {
            const windValueElement = document.getElementById('windValue');
            const chillValueElement = document.getElementById('chillValue');
            const dirValueElement = document.getElementById('dirValue');
                      
            if (windValueElement) {
              windValueElement.innerHTML = 'N/A';
              }
            if (chillValueElement && dirValueElement) {
              chillValueElement.textContent = 'N/A';
              dirValueElement.textContent = 'N/A';
              }
            }
  
      // Solar radiation
        if (weatherData.length > 0) {
          const entry = weatherData[0];
              
          const pressValueElement = document.getElementById('pressValue');
          if (pressValueElement) {
            pressValueElement.innerHTML = `${entry.SolarRad} hPa`;
            }
            } else {
              const pressValueElement = document.getElementById('pressValue');
                          
              if (pressValueElement) {
                pressValueElement.innerHTML = 'N/A';
                }
            }
  } catch (error) {
      console.error('Error updating dashboard:', error);
  }}

  // Call function to populate dropdown with weather stations
populateWeatherStations();
