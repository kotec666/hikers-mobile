import { createContext, useContext, useEffect, useState } from "react";
import { App } from "@capacitor/app";
import { BackgroundRunner } from "@capacitor/background-runner";
import { Position } from "@capacitor/geolocation";

interface AppContextProps {
  userGeolocation: Position | null;
  lastUpdated?: Date;
  hasPermissions: boolean;
  update: () => Promise<any>;
  requestPermissions: () => Promise<void>;
  dispatchBackgroundEvent: () => Promise<void>;
}

interface AppProviderProps {
  children?: React.ReactNode;
}

export const AppContext = createContext<AppContextProps>({
  userGeolocation: null,
  lastUpdated: undefined,
  hasPermissions: false,
  update: () => Promise.reject(),
  dispatchBackgroundEvent: () => Promise.reject(),
  requestPermissions: () => Promise.reject(),
});

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userGeolocation, setUserGeolocation] = useState<Position | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);

  const updateUserGeolocation = async (): Promise<void> => {
    try {
      const result = await BackgroundRunner.dispatchEvent<{ value: string }>({
        event: "getCurrentLocation",
        label: "com.capacitorjs.background.hikers.task",
        details: {},
      });

      console.log(JSON.stringify(result));

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

  const update = async (): Promise<any> => {
    await Promise.all([updateUserGeolocation()]);

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
        lastUpdated,
        hasPermissions,
        update,
        requestPermissions,
        dispatchBackgroundEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
