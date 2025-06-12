import { useEffect, useState } from "react";
import {
  Geolocation,
  GeolocationPluginPermissions,
  PermissionStatus,
} from "@capacitor/geolocation";
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from "capacitor-native-settings";
import { useUserPermissionsStore } from "@/store/user-permissions.ts";
import { UserPermissionsList } from "@/types/interfaces";

const useGetUserPosition = () => {
  const [data, setData] = useState<{
    userLatitude: number | undefined;
    userLongitude: number | undefined;
    userSpeed: number | null;
    userHeading: number | null;
    userPositionGranted: boolean;
    userPositionLoaded: boolean;
  }>({
    userLatitude: undefined,
    userLongitude: undefined,
    userSpeed: null,
    userHeading: null,
    userPositionGranted: false,
    userPositionLoaded: false,
  });

  const { setPermission } = useUserPermissionsStore();

  const getUserPosition = async (permissions: PermissionStatus) => {
    if (
      permissions?.location === "prompt" ||
      permissions?.location === "prompt-with-rationale"
    ) {
      try {
        permissions = await Geolocation.requestPermissions([
          "location",
        ] as unknown as GeolocationPluginPermissions);
      } catch (e) {
        alert(`requestPermissions failed: ${e}`);
      }
    }

    if (permissions?.location === "granted") {
      try {
        await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            maximumAge: 300,
            timeout: 300,
            minimumUpdateInterval: 300,
          },
          (position) => {
            if (!position) return alert("no position provided :(");

            setData((s) => ({
              ...s,
              userLatitude: position.coords.latitude,
              userLongitude: position.coords.longitude,
              userSpeed: position.coords.speed,
              userHeading: position.coords.heading,
            }));
          }
        );

        setPermission(UserPermissionsList.geolocation, true);
        setData((s) => ({
          ...s,
          userPositionGranted: true,
        }));
      } catch (e) {
        setPermission(UserPermissionsList.geolocation, false);
        alert(
          `Location is unavailable on your device: ${JSON.stringify(
            e?.message
          )}`
        );
      }
    }

    if (permissions?.location === "denied") {
      setPermission(UserPermissionsList.geolocation, false);
      setData((s) => ({
        ...s,
        userPositionGranted: false,
      }));
    }

    setData((s) => ({
      ...s,
      userPositionLoaded: true,
    }));
  };

  const getUserPermissions = async () => {
    let permissions;
    try {
      permissions = await Geolocation.checkPermissions();
    } catch (e) {
      if (e.toString() === "Error: Location services are not enabled") {
        await NativeSettings.open({
          optionAndroid: AndroidSettings.Location,
          optionIOS: IOSSettings.LocationServices,
        });

        try {
          permissions = await Geolocation.checkPermissions();
          return getUserPosition(permissions);
        } catch (e) {
          if (e.toString() === "Error: Location services are not enabled") {
            return setData((s) => ({
              ...s,
              userPositionLoaded: true,
              userPositionGranted: false,
            }));
          }
        }
      }
    }

    if (permissions) {
      await getUserPosition(permissions);
    }
  };

  useEffect(() => {
    (async () => {
      await getUserPermissions();
    })();
  }, []);

  return {
    userLatitude: data.userLatitude,
    userLongitude: data.userLongitude,
    userSpeed: data.userSpeed,
    userHeading: data.userHeading,
    userPositionGranted: data.userPositionGranted,
    userPositionLoaded: data.userPositionLoaded,
  };
};

export default useGetUserPosition;
