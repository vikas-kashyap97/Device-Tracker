const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const config = require('./src/config/config');
const routes = require('./src/routes');
const initializeSocket = require('./src/socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);

// Initialize WebSocket
initializeSocket(io);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});