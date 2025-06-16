import { createContext, useContext, useEffect, useState } from "react";
import { App } from "@capacitor/app";
import { BackgroundRunner } from "@capacitor/background-runner";
import { Position } from "@capacitor/geolocation";

interface AppContextProps {
  userGeolocation: Position | null;
  userGeolocations: Position[] | null;
  lastUpdated?: Date;
  hasPermissions: boolean;
  update: () => Promise<any>;
  requestPermissions: () => Promise<void>;
  dispatchBackgroundEvent: () => Promise<void>;
  dispatchDeleteLocations: () => Promise<void>;
}

interface AppProviderProps {
  children?: React.ReactNode;
}

export const AppContext = createContext<AppContextProps>({
  userGeolocation: null,
  userGeolocations: null,
  lastUpdated: undefined,
  hasPermissions: false,
  update: () => Promise.reject(),
  dispatchBackgroundEvent: () => Promise.reject(),
  dispatchDeleteLocations: () => Promise.reject(),
  requestPermissions: () => Promise.reject(),
});

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userGeolocation, setUserGeolocation] = useState<Position | null>(null);
  const [userGeolocations, setUserGeolocations] = useState<Position[] | null>(
    null
  );
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);

  const updateUserGeolocation = async (): Promise<void> => {
    try {
      const result = await BackgroundRunner.dispatchEvent<{ value: string }>({
        event: "getCurrentLocation",
        label: "com.capacitorjs.background.hikers.task",
        details: {},
      });

      if (result && result.value) {
        const cachedLocation = JSON.parse(result.value) as Position;
        setUserGeolocation(cachedLocation);
      } else {
        console.warn("No value for key 'cached_location'");
      }
    } catch (err) {
      console.error(`Could not update user location: ${err}`);
    }
  };

  const getCachedLocations = async (): Promise<void> => {
    try {
      const result = await BackgroundRunner.dispatchEvent<{ value: string }>({
        event: "getCachedLocations",
        label: "com.capacitorjs.background.hikers.task",
        details: {},
      });

      if (result && result.value) {
        const cachedLocations = JSON.parse(result.value) as Position[];
        setUserGeolocations(cachedLocations);
      } else {
        console.warn("No value for key 'cached_locations_background'");
      }
    } catch (err) {
      console.error(`Could not update user locations: ${err}`);
    }
  };

  const update = async (): Promise<any> => {
    await Promise.all([updateUserGeolocation(), getCachedLocations()]);

    const result = await BackgroundRunner.dispatchEvent<{ value: string }>({
      event: "getLastUpdated",
      label: "com.capacitorjs.background.hikers.task",
      details: {
        currentDate: new Date(),
      },
    });

    if (result && result.value) {
      const timestamp = parseInt(result.value);
      const timestampDate = new Date(timestamp * 1000);
      setLastUpdated(timestampDate);
    } else {
      console.warn("No value for key 'last_updated'");
    }
  };

  const deleteLocations = async (): Promise<any> => {
    await BackgroundRunner.dispatchEvent<{ value: string }>({
      event: "deleteUserLocations",
      label: "com.capacitorjs.background.hikers.task",
      details: {
        currentDate: new Date(),
      },
    });

    setUserGeolocations([]);
  };

  const requestPermissions = async () => {
    const permissions = await BackgroundRunner.requestPermissions({
      apis: ["geolocation", "notifications"],
    });

    if (
      permissions.geolocation === "granted" &&
      permissions.notifications === "granted"
    ) {
      setHasPermissions(true);
    }
  };

  const checkPermissions = async () => {
    const permissions = await BackgroundRunner.checkPermissions();
    if (
      permissions.geolocation === "granted" &&
      permissions.notifications === "granted"
    ) {
      setHasPermissions(true);
    }
  };

  const dispatchBackgroundEvent = async () => {
    try {
      await BackgroundRunner.dispatchEvent({
        event: "updateData",
        label: "com.capacitorjs.background.hikers.task",
        details: {},
      });

      update();
    } catch (err) {
      console.error(`Dispatch error: ${err}`);
    }
  };

  const dispatchDeleteLocations = async () => {
    try {
      await deleteLocations();
    } catch (err) {
      console.error(`Dispatch DeleteLocations error: ${err}`);
    }
  };

  useEffect(() => {
    update();
    checkPermissions();

    // @ts-ignore
    const handle = App.addListener("appStateChange", (appState) => {
      if (appState.isActive) {
        update();
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        userGeolocation,
        userGeolocations,
        lastUpdated,
        hasPermissions,
        update,
        requestPermissions,
        dispatchBackgroundEvent,
        dispatchDeleteLocations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
