export const getWeatherIcon = (
    uvSolar: number, // Replace isNight with uvSolar
    rainRate: number,
    pressure: number, // Use pressure instead of cloudCoverage
    lastLightningTime: string | null
  ): { icon: string; condition: string } => {

    console.log ("rainRate: " + rainRate);
    console.log ("pressure: " + pressure);
    const currentTime = new Date();
    const lightningThresholdMinutes = 30;
  
    const latitude = 0; // Replace with actual latitude value
    const longitude = 0; // Replace with actual longitude value
  
    // Mock function to check full moon (always returns false for now)
    const isFullMoon = (): boolean => {
      return false; // Mocked: Not a full moon
    };
  
    const isNight = uvSolar === 0;
  
    const fullMoon = isNight && isFullMoon(); // Use mocked full moon logic
  
    // Check if there's a recent lightning event within the last 30 minutes
    if (lastLightningTime) {
      const lastLightningDate = new Date(lastLightningTime);
      const timeDifference = (currentTime.getTime() - lastLightningDate.getTime()) / 60000; // Convert ms to minutes
      if (timeDifference <= lightningThresholdMinutes) {
        if (rainRate > 0) {
          return {
            icon: "/day-heavy-thunder-rain-icon.png",
            condition: "Temporale",
          };
        }
        return {
          icon: "/thunder.png",
          condition: "Fulmini",
        };
      }
    }
  
    // Handle rain icons
    if (!Number.isNaN(rainRate) && rainRate > 0) {
      return {
        icon: isNight ? "/WeatherIcons/night-rain-icon.png" : "/WeatherIcons/day-rain-icon.png",
        condition: "Pioggia",
      };
    }
  
    // Handle cloudy icons based on pressure
    if (pressure <= 1010 ) { // Lower pressure indicates clouds or stormy conditions
      return {
        icon: "/WeatherIcons/cloudy-icon.png",
        condition: "Coperto",
      };
    }
      else if (pressure > 1010 && pressure <= 1012 ) { // Lower pressure indicates clouds or stormy conditions
        return {
        icon: isNight ? "/WeatherIcons/night-almost-cloudy-icon.png" : "/WeatherIcons/day-almost-cloudy-icon.png",
        condition: "Nuvoloso",
      };
    } else if (pressure > 1012 && pressure < 1015 ) { // Lower pressure indicates clouds or stormy conditions
        return {
        icon: isNight ? "/WeatherIcons/night-partially-cloudy-icon.png" : "/WeatherIcons/day-partially-cloudy-icon.png",
        condition: "Poco Nuvoloso",
      };
    }
  
    // Handle clear icons for higher pressure
    if (pressure >= 1015) { // Higher pressure indicates clearer conditions
      if (fullMoon) {
        return {
          icon: "/WeatherIcons/night-full-moon-icon.png",
          condition: "Sereno",
        };
      }
      return {
        icon: isNight ? "/WeatherIcons/night-clear-icon.png" : "/WeatherIcons/day-clear-icon.png",
        condition: "Sereno",
      };
    }
  
    // Default clear if no condition matched
    return {
      icon: isNight ? "/WeatherIcons/night-clear-icon.png" : "/WeatherIcons/day-clear-icon.png",
      condition: "Sereno",
    };
  };
  