const socket = io();
const markers = {};
const paths = {};
const geofences = new Map();
let username = prompt("Enter your name:");
let userSettings = {
  geofenceRadius: 1000, // meters
  darkMode: false
};

socket.emit("set-username", username);

document.getElementById('dark-mode-icon').addEventListener('click', () => {
  userSettings.darkMode = true;
  updateMapTheme(userSettings.darkMode);
  document.body.classList.add('dark-mode');
  document.getElementById('light-mode-icon').style.display = 'inline';
  document.getElementById('dark-mode-icon').style.display = 'none';
});

document.getElementById('light-mode-icon').addEventListener('click', () => {
  userSettings.darkMode = false;
  updateMapTheme(userSettings.darkMode);
  document.body.classList.remove('dark-mode');
  document.getElementById('dark-mode-icon').style.display = 'inline';
  document.getElementById('light-mode-icon').style.display = 'none';
});


const map = L.map("map").setView([0, 0], 16);
let currentTileLayer;

function updateMapTheme(isDark) {
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }
  
  const tileUrl = isDark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    
  currentTileLayer = L.tileLayer(tileUrl, {
    attribution: 'Vikas.dev',
  }).addTo(map);
}

updateMapTheme(userSettings.darkMode);

// Geofencing functionality
function addGeofence(center, radius) {
  const geofenceId = Date.now().toString();
  const circle = L.circle(center, {
    radius,
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.2
  }).addTo(map);
  
  geofences.set(geofenceId, {
    circle,
    center,
    radius
  });
  
  return geofenceId;
}

// Speed calculation and alerts
function calculateSpeed(positions, timeInterval) {
  if (positions.length < 2) return 0;
  const distance = geolib.getDistance(positions[0], positions[1]);
  return (distance / timeInterval) * 3.6; // Convert to km/h
}

// Location tracking with enhanced features
if (navigator.geolocation) {
  let lastPositions = [];
  
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const currentPosition = { latitude, longitude };
      
      lastPositions.unshift(currentPosition);
      if (lastPositions.length > 2) lastPositions.pop();
      
      const speed = calculateSpeed(lastPositions, 5);
    
      
      // Check geofence violations
      geofences.forEach((geofence, id) => {
        const distance = geolib.getDistance(
          currentPosition,
          { latitude: geofence.center[0], longitude: geofence.center[1] }
        );
        
        if (distance > geofence.radius) {
          showAlert(`Geofence alert: Device has left designated area!`);
        }
      });
      
      socket.emit("send-location", { 
        latitude, 
        longitude,
        speed,
        timestamp: Date.now()
      });
    },
    (error) => console.error(error),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}

// Chat functionality
let isMinimized = false;
let typingTimeout;

function createChatUI() {
  const chatContainer = document.createElement('div');
  chatContainer.id = 'chat-container';
  chatContainer.innerHTML = `
    <div id="chat-header">
      <span>Chat</span>
      <button class="minimize-button">−</button>
    </div>
    <div id="chat-messages"></div>
    <div id="typing-indicator"></div>
    <div id="chat-input-container">
      <input type="text" id="chat-input" placeholder="Type a message...">
      <button id="send-button">Send</button>
    </div>
  `;
  document.body.appendChild(chatContainer);

  // Event listeners
  const minimizeButton = chatContainer.querySelector('.minimize-button');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');

  minimizeButton.addEventListener('click', () => {
    isMinimized = !isMinimized;
    chatContainer.classList.toggle('minimized');
    minimizeButton.textContent = isMinimized ? '+' : '−';
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  chatInput.addEventListener('input', () => {
    socket.emit('typing');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('stop-typing'), 1000);
  });

  sendButton.addEventListener('click', sendMessage);
}

function sendMessage() {
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();
  
  if (message) {
    socket.emit('chat-message', message);
    chatInput.value = '';
  }
}

function addMessage(message, isSent = false) {
  const chatMessages = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
  
  messageDiv.innerHTML = `
    <div class="username">${message.username}</div>
    <div class="text">${message.text}</div>
    <div class="timestamp">${moment(message.timestamp).fromNow()}</div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Socket event handlers
socket.on("receive-location", (data) => {
  const { id, latitude, longitude, username, weather } = data;
  
  if (!markers[id]) {
    // Create new marker with custom icon
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-content">
              <div class="marker-arrow"></div>
              <div class="marker-info">${username}</div>
            </div>`
    });
    
    markers[id] = L.marker([latitude, longitude], { icon }).addTo(map);
    paths[id] = L.polyline([], { color: getRandomColor() }).addTo(map);
    
    // Add popup with detailed information
    markers[id].bindPopup(createPopupContent(data)).openPopup();
  } else {
    markers[id].setLatLng([latitude, longitude]);
    paths[id].addLatLng([latitude, longitude]);
    markers[id].getPopup().setContent(createPopupContent(data));
  }
});

socket.on("chat-message", (message) => {
  addMessage(message, message.username === username);
});

socket.on("chat-history", (messages) => {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = '';
  messages.forEach(message => addMessage(message, message.username === username));
});

socket.on("user-typing", (username) => {
  document.getElementById('typing-indicator').textContent = `${username} is typing...`;
});

socket.on("user-stop-typing", () => {
  document.getElementById('typing-indicator').textContent = '';
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    map.removeLayer(paths[id]);
    delete markers[id];
    delete paths[id];
  }
});

socket.on("user-list", (users) => {
  const userListElement = document.getElementById("userList");
  userListElement.innerHTML = users.map(user => `
    <li class="user-item">
      <span class="user-name">${user.username}</span>
      <span class="user-status online"></span>
    </li>
  `).join('');
});

// Utility functions
function createPopupContent(data) {
  const { username, speed, timestamp, weather } = data;
  
  let content = `
    <div class="popup-content">
      <h3>${username}</h3>
      <div class="weather-row">
        <span class="weather-label">Speed:</span>
        <span class="weather-value">${Math.round(speed || 0)} km/h</span>
      </div>
      <div class="weather-row">
        <span class="weather-label">Last update:</span>
        <span class="weather-value">${moment(timestamp).fromNow()}</span>
      </div>`;

  if (weather) {
    content += `
      <div class="weather-info">
        <div class="weather-row">
          <img class="weather-icon" src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="Weather icon">
          <span class="weather-value">${weather.description}</span>
        </div>
        <div class="weather-row">
          <span class="weather-label">Temperature:</span>
          <span class="weather-value">${weather.temperature}°C</span>
        </div>
        <div class="weather-row">
          <span class="weather-label">Wind:</span>
          <span class="weather-value">${weather.windSpeed} km/h</span>
          <span class="wind-direction" style="transform: rotate(${weather.windDirection}deg)">➜</span>
        </div>
      </div>`;
  }

  content += '</div>';
  return content;
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function showAlert(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert';
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

// Initialize chat UI
createChatUI();

// Settings panel functionality

document.getElementById('darkModeToggle').addEventListener('change', (e) => {
  userSettings.darkMode = e.target.checked;
  updateMapTheme(userSettings.darkMode);
  document.body.classList.toggle('dark-mode');
});