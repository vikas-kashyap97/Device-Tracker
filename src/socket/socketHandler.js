const UserService = require('../services/UserService');
const ChatService = require('../services/ChatService');
const WeatherService = require('../services/WeatherService');
const config = require('../config/config');

function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('set-username', (username) => {
      UserService.addUser(socket.id, username);
      io.emit('user-list', UserService.getUserList());
      
      // Join the global chat room
      socket.join('global');
      
      // Send system message
      const systemMessage = ChatService.formatMessage('System', `${username} has joined the chat`);
      io.to('global').emit('chat-message', systemMessage);
      
      // Send chat history
      const chatHistory = ChatService.getMessages('global');
      socket.emit('chat-history', chatHistory);
    });

    socket.on('send-location', async (data) => {
      const { latitude, longitude } = data;
      
      // Get weather data
      const weatherData = await WeatherService.getWeatherByCoords(latitude, longitude);
      
      const updatedLocation = UserService.updateUserLocation(socket.id, {
        ...data,
        weather: weatherData
      });
      
      if (updatedLocation) {
        io.emit('receive-location', updatedLocation);
      }
    });

    socket.on('chat-message', (message) => {
      const user = UserService.getUser(socket.id);
      if (user) {
        const formattedMessage = ChatService.formatMessage(user.username, message);
        ChatService.addMessage('global', formattedMessage);
        io.to('global').emit('chat-message', formattedMessage);
      }
    });

    socket.on('typing', () => {
      const user = UserService.getUser(socket.id);
      if (user) {
        socket.broadcast.to('global').emit('user-typing', user.username);
      }
    });

    socket.on('stop-typing', () => {
      const user = UserService.getUser(socket.id);
      if (user) {
        socket.broadcast.to('global').emit('user-stop-typing', user.username);
      }
    });

    socket.on('disconnect', () => {
      const user = UserService.getUser(socket.id);
      if (user) {
        const systemMessage = ChatService.formatMessage('System', `${user.username} has left the chat`);
        io.to('global').emit('chat-message', systemMessage);
      }
      
      UserService.removeUser(socket.id);
      io.emit('user-disconnected', socket.id);
      io.emit('user-list', UserService.getUserList());
      console.log('User disconnected:', socket.id);
    });
  });

  // Clean up inactive users periodically
  setInterval(() => {
    const inactiveUsers = UserService.cleanInactiveUsers(config.inactivityTimeout);
    inactiveUsers.forEach(socketId => {
      io.emit('user-disconnected', socketId);
    });
    io.emit('user-list', UserService.getUserList());
  }, 60000);
}

module.exports = initializeSocket;