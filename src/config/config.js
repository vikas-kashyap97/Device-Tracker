const config = {
  port: process.env.PORT || 3000,
  inactivityTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
  maxPathHistory: 100
};

module.exports = config;