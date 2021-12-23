import Geolocation from 'react-native-geolocation-service';

export function getUserLocation(): Promise<number[]> {
    // Promisify Geolocation.getCurrentPosition since it relies on outdated callbacks
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const {latitude, longitude} = position.coords;
          resolve([latitude, longitude]);
        },
        (error) => {
          reject(error);
        },
        {
          timeout: 15000,
          maximumAge: 5,
        },
      );
    });
  }