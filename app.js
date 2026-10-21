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
    function refreshMoisture() {
      const val = Math.floor(Math.random() * 35) + 30; // Simulated sensor reading
      const valElem = document.getElementById('moistureValue');
      const statusElem = document.getElementById('moistureStatus');
      
      valElem.innerText = val + '%';
      if (val < 35) {
        statusElem.innerText = 'Status: Low Moisture (Irrigation Needed)';
        statusElem.style.color = '#d9534f';
      } else {
        statusElem.innerText = 'Status: Optimal Moisture';
        statusElem.style.color = '#2e7d32';
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
