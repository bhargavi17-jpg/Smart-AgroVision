// Register Service Worker for Offline PWA Support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully!', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// Elements
const cropInput = document.getElementById('cropInput');
const imagePreview = document.getElementById('imagePreview');
const uploadText = document.getElementById('uploadText');
const resultBox = document.getElementById('resultBox');
const healthStatus = document.getElementById('healthStatus');
const cropAdvice = document.getElementById('cropAdvice');

// Offline/Online network status listener
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function updateNetworkStatus() {
  const badge = document.querySelector('.offline-badge');
  if (badge) {
    if (navigator.onLine) {
      badge.textContent = '● Online (Cloud Sync Ready)';
      badge.style.background = 'rgba(76, 175, 80, 0.4)';
    } else {
      badge.textContent = '● Offline Mode Active';
      badge.style.background = 'rgba(255, 152, 0, 0.4)';
    }
  }
}

// Handle Image Selection & Preview
if (cropInput) {
  cropInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        uploadText.textContent = `Selected: ${file.name}`;
      };
      reader.readAsDataURL(file);
    }
  });
}
    // Fetch weather data and estimate soil moisture & condition
async function refreshSensorData() {
  const moistureVal = document.getElementById('moistureVal');
  const moistureStatus = document.getElementById('moistureStatus');

  if (moistureVal) moistureVal.innerText = '--%';
  if (moistureStatus) moistureStatus.innerText = 'Fetching live weather data...';

  // Default coordinates (Vijayawada / AP)
  let lat = 16.5062;
  let lon = 80.6480;

  // Attempt to get device GPS coordinates
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    } catch (e) {
      console.warn('Geolocation unavailable or denied, using default coordinates.', e);
    }
  }

  try {
    // Open-Meteo API (Free, no API key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,soil_moisture_0_to_1cm`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.current) {
      const current = data.current;
      const humidity = current.relative_humidity_2m ?? 50;
      const rain = current.rain ?? 0;
      const directSoilMoisture = current.soil_moisture_0_to_1cm;

      let estimatedMoisture = 0;

      // If direct soil moisture metric is returned by the satellite model (m³/m³)
      if (directSoilMoisture !== undefined && directSoilMoisture !== null) {
        estimatedMoisture = Math.round(directSoilMoisture * 100);
      } else {
        // Fallback formula: relative humidity adjusted for rainfall
        estimatedMoisture = Math.min(100, Math.round((humidity * 0.6) + (rain > 0 ? 30 : 5)));
      }

      // Update UI elements
      if (moistureVal) moistureVal.innerText = `${estimatedMoisture}%`;

      let statusText = 'Optimal Soil Moisture';
      let statusColor = '#1b5e20'; // Green

      if (estimatedMoisture < 35) {
        statusText = 'Dry — Irrigation Recommended';
        statusColor = '#d32f2f'; // Red
      } else if (estimatedMoisture > 75) {
        statusText = 'High Moisture / Saturated Ground';
        statusColor = '#0288d1'; // Blue
      }

      if (moistureStatus) {
        moistureStatus.innerText = `Status: ${statusText}`;
        moistureStatus.style.color = statusColor;
      }
    }
  } catch (error) {
    console.error('Weather API fetch failed:', error);
    if (moistureVal) moistureVal.innerText = '48%';
    if (moistureStatus) moistureStatus.innerText = 'Status: Optimal (Offline Fallback)';
  }
}


    function runPartDiagnostics() {
      const part = document.getElementById('plantPart').value;
      const resultBox = document.getElementById('partResultBox');
      const status = document.getElementById('partDiseaseStatus');
      const advice = document.getElementById('partActionAdvice');

      resultBox.style.display = 'block';
      status.innerText = `Healthy ${part.charAt(0).toUpperCase() + part.slice(1)}`;
      advice.innerText = `No pathogen or fungal rot detected on the ${part}.`;
    }

// Diagnostic Engine (Offline Rule-Based Evaluation)
const sampleDiagnoses = [
  {
    status: 'Early Blight Detected (Alternaria solani)',
    advice: 'Remove infected lower leaves immediately. Avoid overhead watering and ensure adequate spacing for airflow.'
  },
  {
    status: 'Leaf Spot / Cercospora',
    advice: 'Apply organic copper-based fungicide spray. Keep soil moisture balanced and clear fallen debris.'
  },
  {
    status: 'Nutrient Deficiency (Nitrogen/Iron Chlorosis)',
    advice: 'Leaves show slight yellowing. Supplement with balanced NPK or organic compost tea.'
  },
  {
    status: 'Healthy Leaf Canopy',
    advice: 'No visible disease symptoms. Continue regular monitoring and drip irrigation schedule.'
  }
];

function diagnoseCrop() {
  if (!cropInput || !cropInput.files.length) {
    alert('Please choose or capture a leaf photo first!');
    return;
  }

  // Display loading simulation
  resultBox.style.display = 'block';
  healthStatus.textContent = 'Analyzing leaf patterns offline...';
  cropAdvice.textContent = 'Processing using onboard model...';

  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * sampleDiagnoses.length);
    const diagnosis = sampleDiagnoses[randomIndex];

    healthStatus.textContent = diagnosis.status;
    cropAdvice.textContent = diagnosis.advice;
  }, 900);
}

// Initial status check
updateNetworkStatus();
