class WeatherService {
  constructor() {
    this.apiKey = "726aebfafb2b7f3d861035586c958d5b";
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";
  }

  async getWeatherByCoords(latitude, longitude) {
    try {
      const response = await fetch(
        `${this.apiUrl}&lat=${latitude}&lon=${longitude}&appid=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data.cod === 200) {
        return {
          temperature: Math.round(data.main.temp),
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          windDirection: data.wind.deg,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        };
      }
      return null;
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  }
}

module.exports = new WeatherService();