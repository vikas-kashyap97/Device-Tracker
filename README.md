# Realtime Device Tracker

## Overview
**Realtime Device Tracker** is a real-time web application that allows users to track live locations, interact with other users, and access additional data like weather, speed, and more. The application supports both dark and light modes for user convenience.

## Live Demo
Experience the app live [here](https://device-tracker-zkm4.onrender.com/).

## Project Features
- **Real-time Location Tracking**: Visualize live locations of connected users on a map.
- **User List**: See a list of all currently connected users.
- **Live Chat**: Communicate in real time with other users via a built-in chat feature.
- **Dark and Light Modes**: Toggle between themes for a personalized experience.
- **Weather Insights**: Get the temperature and wind speed at the tracked user’s location.
- **Travel Speed Monitoring**: Track the movement speed (e.g., walking or running) of a user in real time.

## Tech Stack
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Frontend**: [EJS](https://ejs.co/) templates for dynamic views
- **Real-time Communication**: [Socket.IO](https://socket.io/)
- **Geolocation Utilities**: [Geolib](https://www.npmjs.com/package/geolib)
- **Date & Time Management**: [Moment.js](https://momentjs.com/)
- **Development Tools**: [Nodemon](https://nodemon.io/)

## Installation and Setup

### Prerequisites
Ensure that **Node.js** and **npm** are installed on your machine.

### Step-by-step Guide
1. **Clone the repository**:
    ```bash
    git clone https://github.com/vikas-kashyap97/Device-Tracker.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd Device-Tracker
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Start the server**:
   - For production:
     ```bash
     npm start
     ```
   - For development:
     ```bash
     npm run dev
     ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000` to start using the app.

## Project Structure
- **`/views`**: Contains EJS templates for the frontend.
- **`/public`**: Static assets like CSS, JavaScript, and images.
- **`/routes`**: Express routes for handling HTTP requests.
- **`app.js`**: Main server file.
- **`package.json`**: Project metadata, scripts, and dependencies.

## Code Highlights
- **Real-time Communication**: Implemented using `Socket.IO` to synchronize user locations and enable live chat.
- **Geolocation Tracking**: Utilizes `Geolib` for calculating distances and movement speeds.
- **Weather API Integration**: Fetches weather data like temperature and wind speed for user locations.

## Contributing
Contributions are welcome! To contribute:

Developed with ❤️ by [Vikas Kashyap](https://github.com/vikas-kashyap97).
