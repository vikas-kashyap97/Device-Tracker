class ChatService {
  constructor() {
    this.messages = new Map(); // roomId -> messages[]
    this.maxMessages = 100; // Keep last 100 messages per room
  }

  addMessage(roomId, message) {
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }

    const roomMessages = this.messages.get(roomId);
    roomMessages.push(message);

    // Maintain message limit
    if (roomMessages.length > this.maxMessages) {
      roomMessages.shift();
    }

    return message;
  }

  getMessages(roomId) {
    return this.messages.get(roomId) || [];
  }

  formatMessage(username, text) {
    return {
      username,
      text,
      timestamp: Date.now()
    };
  }
}

module.exports = new ChatService();