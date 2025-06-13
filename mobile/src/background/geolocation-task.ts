// import { BackgroundRunnerPlugin } from '@capacitor/background-runner';
import { Geolocation } from "@capacitor/geolocation";

export const geolocationTask = async (event: string) => {
  if (event === "geolocationUpdate") {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        maximumAge: 300,
        timeout: 300,
      });

      return {
        data: {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
          },
        },
      };
    } catch (error) {
      console.error("Error getting position in background:", error);
      return null;
    }
  }
  return null;
};
