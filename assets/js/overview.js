import { number, formattedOneHourBefore, formattedCurrentDate, station_api, weather_api } from './api_keys.js';

// Function to fetch weather station data
async function fetchWeatherStations() {
    try {
      const response = await fetch(`${station_api}`);
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
      const apiUrl = `${weather_api}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data.greenIoTData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return [];
    }
  }

// Function to fetch monthly humidity and temp data
async function fetchMonthlyWeatherData(stationId) {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const formattedFirstDay = firstDayOfMonth.toISOString();
      const formattedCurrentDate = now.toISOString();
  
      const apiUrl = `${station_api}`;
  
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data.greenIoTData;
    } catch (error) {
      console.error('Error fetching monthly weather data:', error);
      return [];
    }
  }

  function calculateDailyAverages(monthlyWeatherData) {
    const aggregatedData = {};
  
    monthlyWeatherData.forEach(entry => {
      const dateParts = entry.Date.split('/');                // Split the date by '/'
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;               // Months are zero-based in JavaScript Date
      const day = parseInt(dateParts[2]);
      
      const dateKey = new Date(year, month, day).toISOString().split('T')[0];
  
      if (!aggregatedData[dateKey]) {
        aggregatedData[dateKey] = {
          temperatures: [entry.TempOut],
          humidities: [entry.OutHum]                          // Add humidity to the aggregated data
        };
      } else {
        aggregatedData[dateKey].temperatures.push(entry.TempOut);
        aggregatedData[dateKey].humidities.push(entry.OutHum);                                  // Push humidity values
      }
    });
  
    const result = Object.keys(aggregatedData).map(date => ({
      date,
      averageTemperature: aggregatedData[date].temperatures.reduce((acc, val) => acc + val, 0) / aggregatedData[date].temperatures.length,
      averageHumidity: aggregatedData[date].humidities.reduce((acc, val) => acc + val, 0) / aggregatedData[date].humidities.length                               
    }));
    return result;
  }
  
  
  
  // Function to update current date and time elements
  function currentDateTime() {
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
        await updateDashboard(station);
      });
  
      dropdownMenu.appendChild(dropdownItem);
    });
  }

  // Update station number
function updateSelectedStation(selectedStation) {
  const selectedStationElement = document.getElementById('selectedStation');
  if (selectedStationElement) {
    selectedStationElement.textContent = `Choose a station to view below`;
  }
}

// Function to draw line chart for temperature and humidity data
function drawDailyTempLineChart(weatherData) {
  const temperatureData = [];
  const timeData = [];
  const humData = [];

  for (let i = 0; i < weatherData.length; i++) {
    temperatureData.push(weatherData[i].TempOut);           // Extract temperatures
    timeData.push(weatherData[i].Time);                     // Extract times
    humData.push(weatherData[i].OutHum);                    // Extract humidity
  }

  const trace1 = {
    x: timeData,
    y: temperatureData,
    type: 'line',
  };

  const trace2 = {
    x: timeData,
    y: humData,
    type: 'line',
  };

  // Define the layout
  const layout1 = {
    title: '', // Set an empty string to remove the title
    margin: { // Set margins to remove padding for the title
    t: 0, // Top margin
    b: 100, // Bottom margin
    l: 40, // Left margin
    r: 40, // Right margin
    },
    xaxis: {
      title: 'Time',
      tickangle: 45,
    },
    yaxis: {
      title: 'Temperature (°C)'
    },
    responsive: true                                          // Enable responsive layout
  };

  const layout2 = {
    title: '', // Set an empty string to remove the title
    margin: { // Set margins to remove padding for the title
    t: 0, // Top margin
    b: 100, // Bottom margin
    l: 40, // Left margin
    r: 40, // Right margin
    },
    xaxis: {
      title: 'Time',
      tickangle: 45,
    },
    yaxis: {
      title: 'Humidity (%)'
    },
    responsive: true                                          // Enable responsive layout
  };

  // Define the configuration object for the charts
  const config = {
    responsive: true
  };

  // Plot the chart inside this functions
  Plotly.newPlot('temp_chart', [trace1], layout1, config);
  Plotly.newPlot('hum_chart', [trace2], layout2, config);
}

function drawMonthlyTempLineChart(averageData) {
  const MonthDateData = averageData.map(entry => entry.date);
  const MonthTemperatureData = averageData.map(entry => entry.averageTemperature);
  const MonthHumData = averageData.map(entry => entry.averageHumidity);

  const trace1 = {
    x: MonthDateData,
    y: MonthTemperatureData,
    type: 'scatter',
    name: 'Temperature'
  };

  const trace2 = {
    x: MonthDateData,
    y: MonthHumData,
    type: 'scatter',
    name: 'Humidity'
  };

  const layout1 = {
    title: '', // Set an empty string to remove the title
    margin: { // Set margins to remove padding for the title
    t: 0, // Top margin
    b: 100, // Bottom margin
    l: 40, // Left margin
    r: 40, // Right margin
    },
    xaxis: {
      title: 'Day',
      tickangle: 45,
      responsive: true 
    },
    yaxis: {
      title: 'Temperature (°C)'
    }
  };

  const layout2 = {
    title: '', // Set an empty string to remove the title
    margin: { // Set margins to remove padding for the title
    t: 0, // Top margin
    b: 100, // Bottom margin
    l: 40, // Left margin
    r: 40, // Right margin
    },
    xaxis: {
      title: 'Day',
      tickangle: 45,
      responsive: true 
    },
    yaxis: {
      title: 'Humidity (%)'
    }
  };
  // Define the configuration object for the charts
  const config = {
    responsive: true
  };
  Plotly.newPlot('monthly_temp_chart', [trace1], layout1,config);
  Plotly.newPlot('monthly_hum_chart', [trace2], layout2,config);
}


// Array to store time and temperature pairs
const timeTempList = [];
  
// Function to update dashboard with weather data for selected station
async function updateDashboard(selectedStation) {
    try {
      updateSelectedStation(selectedStation)
      const currentDate = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
  
      const addLeadingZero = num => (num < 10 ? '0' + num : num);
  
      const formattedStartDate =
        `${currentDate.getFullYear()}-${addLeadingZero(currentDate.getMonth() + 1)}-${addLeadingZero(currentDate.getDate())}T00:00:00.00`;
  
      const formattedCurrentDate =
        `${currentDate.getFullYear()}-${addLeadingZero(currentDate.getMonth() + 1)}-${addLeadingZero(currentDate.getDate())}T${addLeadingZero(currentDate.getHours())}:${addLeadingZero(currentDate.getMinutes())}:${addLeadingZero(currentDate.getSeconds())}.00`;
  
      const weatherData = await fetchWeatherData(selectedStation.IoTModuleFieldID, formattedStartDate, formattedCurrentDate);
      const monthlyWeatherData = await fetchMonthlyWeatherData(selectedStation.IoTModuleFieldID);
      const averageTemp = calculateDailyAverages(monthlyWeatherData)

      console.log('Monthly Weather Data:', monthlyWeatherData);
      for (var i = 0; i < weatherData.length; i++) {
        var currentTime = weatherData[i].Time;
        var currentTempOut = weatherData[i].TempOut;
        var currentHum = weatherData[i].OutHum;
      }

      drawDailyTempLineChart(weatherData)
      drawMonthlyTempLineChart(averageTemp)

  
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  }
  
// Call necessary functions to update elements and populate dropdown
currentDateTime(); // Update current date and time
populateWeatherStations(); // Populate dropdown with weather stations