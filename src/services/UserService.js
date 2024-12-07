class UserService {
  constructor() {
    this.users = new Map();
  }

  addUser(socketId, username) {
    this.users.set(socketId, {
      username,
      path: [],
      lastActive: Date.now(),
      connected: true
    });
  }

  getUser(socketId) {
    return this.users.get(socketId);
  }

  updateUserLocation(socketId, locationData) {
    const user = this.users.get(socketId);
    if (!user) return null;

    user.lastActive = Date.now();
    user.path.push({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timestamp: Date.now()
    });

    if (user.path.length > 100) {
      user.path.shift();
    }

    return {
      id: socketId,
      ...locationData,
      username: user.username
    };
  }

  removeUser(socketId) {
    this.users.delete(socketId);
  }

  getUserList() {
    return Array.from(this.users.values()).map(user => ({
      username: user.username,
      lastActive: user.lastActive,
      connected: user.connected
    }));
  }

  cleanInactiveUsers(timeout) {
    const now = Date.now();
    const inactiveUsers = [];
    
    for (const [socketId, user] of this.users.entries()) {
      if (now - user.lastActive > timeout) {
        this.users.delete(socketId);
        inactiveUsers.push(socketId);
      }
    }
    
    return inactiveUsers;
  }
}

module.exports = new UserService();