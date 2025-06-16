import { useEffect, useRef, useState } from "react";
import { LatLngExpression } from "leaflet";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import withTransition from "@/components/providers/transition.tsx";
import useGetUserPosition from "@/hooks/useGetUserPosition.tsx";
import UserLocationMarker from "@/components/ui/userLocationMarker/userMarker.tsx";
import PointPopups from "@/pages/mapCommunity/components/PointPopups.tsx";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  "BackgroundGeolocation"
);

const configureBackgroundGeolocation = async (): Promise<{
  watcherId: string;
  bgLocations: { latitude: number; longitude: number }[];
}> => {
  let locationsArray = [] as { latitude: number; longitude: number }[];

  const watcherId = await BackgroundGeolocation.addWatcher(
    {
      backgroundMessage: "Отслеживание вашего местоположения",
      backgroundTitle: "Фоновое отслеживание включено",
      requestPermissions: true,
      stale: false,
      // distanceFilter: 50, минимальное расстояние между обновлениями
      distanceFilter: 1,
    },
    (location, error) => {
      if (error) {
        alert(`err: ${JSON.stringify(error)}`);
        if (error.code === "NOT_AUTHORIZED") {
          if (
            window.confirm(
              "Это приложение требует вашей геолокации, " +
                "но не имеет разрешения.\n\n" +
                "Открыть настройки?"
            )
          ) {
            // It can be useful to direct the user to their device's
            // settings when location permissions have been denied. The
            // plugin provides the 'openSettings' method to do exactly
            // this.
            BackgroundGeolocation.openSettings();
          }
        }
        return console.error(error);
      }

      console.log("location------:", JSON.stringify(location));

      if (location !== null && location !== undefined) {
        const cachedLocationsStr = localStorage.getItem(
          "cached_locations_background_community"
        );

        if (cachedLocationsStr) {
          try {
            locationsArray = JSON.parse(cachedLocationsStr);
            if (!Array.isArray(locationsArray)) {
              locationsArray = [];
            }
          } catch (e) {
            console.error("Failed to parse cached locations community", e);
            locationsArray = [];
          }
        }

        console.log("locationsArray", JSON.stringify(locationsArray));

        locationsArray.push(location);

        localStorage.setItem(
          "cached_locations_background_community",
          JSON.stringify(locationsArray)
        );
      }
    }
  );

  alert(`Watcher started with ID: ${watcherId}`);
  return {
    watcherId,
    bgLocations: locationsArray,
  };
};

const MapCommunity = () => {
  const isValidPosition = (
    pos: (number | undefined)[] | null | undefined
  ): pos is [number, number] => {
    return (
      pos != null &&
      Array.isArray(pos) &&
      pos.length === 2 &&
      typeof pos[0] === "number" &&
      typeof pos[1] === "number" &&
      !isNaN(pos[0]) &&
      !isNaN(pos[1])
    );
  };

  const defaultPositionsString =
    localStorage.getItem("user_positions_active") || "[]";
  const defaultPositions = JSON.parse(defaultPositionsString);
  const initialPositions = Array.isArray(defaultPositions)
    ? defaultPositions.filter(isValidPosition)
    : [];

  const defaultPositionsStringBgCommunity =
    localStorage.getItem("cached_locations_background_community") || "[]";
  const defaultPositionsBg = JSON.parse(defaultPositionsStringBgCommunity);
  const initialPositionsBg = Array.isArray(defaultPositionsBg)
    ? defaultPositionsBg.filter(isValidPosition)
    : [];

  console.log(
    "defaultPositionsStringBgCommunity::---::",
    defaultPositionsStringBgCommunity
  );

  const [state, setState] = useState<{
    activePositions: LatLngExpression[];
    backgroundPositions: LatLngExpression[];
    buttons: boolean;
  }>({
    activePositions: initialPositions,
    backgroundPositions: initialPositionsBg,
    buttons: false,
  });
  const mapRef = useRef<Map | undefined | null>(null);

  const { userLongitude, userLatitude, userHeading } = useGetUserPosition();

  useEffect(() => {
    const userLatLng = [userLatitude, userLongitude];
    if (!isValidPosition(userLatLng)) return;
    const previousPositionsString = localStorage.getItem(
      "user_positions_active"
    );
    let previousPositions: LatLngExpression[] = [];

    if (previousPositionsString) {
      try {
        const parsed = JSON.parse(previousPositionsString);
        previousPositions = Array.isArray(parsed)
          ? parsed.filter(isValidPosition)
          : [];
      } catch (e) {
        console.error("Failed to parse positions from localStorage", e);
      }
    }

    const updatedPositions = [...previousPositions, userLatLng];
    localStorage.setItem(
      "user_positions_active",
      JSON.stringify(updatedPositions)
    );
    setState((s) => ({ ...s, activePositions: updatedPositions }));
  }, [userLongitude, userLatitude]);

  const getMapCenter = (): LatLngExpression => {
    const userLatLng = [userLatitude, userLongitude];
    return isValidPosition(userLatLng) ? userLatLng : [55.732579, 37.498387];
  };

  useEffect(() => {
    let watcherId: string;

    const startTracking = async () => {
      try {
        const { watcherId, bgLocations } =
          await configureBackgroundGeolocation();

        setState((s) => ({ ...s, backgroundPositions: bgLocations }));
      } catch (error) {
        alert(`Error starting background tracking: ${error}`);
      }
    };

    startTracking();

    return () => {
      // if (watcherId) {
      //   BackgroundGeolocation.removeWatcher({ id: watcherId });
      // }
    };
  }, []);

  // const {
  //   userGeolocations,
  //   requestPermissions,
  //   hasPermissions,
  //   dispatchBackgroundEvent,
  //   dispatchDeleteLocations,
  // } = useApp();

  const deleteLocationsBgLs = () => {
    localStorage.removeItem("cached_locations_background_community");
  };

  const flyToUser = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([userLatitude, userLongitude], 18, { duration: 2 });
  };

  return (
    <div
      className={cn("flex flex-col justify-between relative", {
        "h-[calc(100vh-100px)] mt-[60px]": Capacitor.getPlatform() === "ios",
        "h-screen px-4 py-6": Capacitor.getPlatform() !== "ios",
      })}
    >
      <MapContainer
        ref={mapRef}
        center={getMapCenter()}
        zoom={18}
        scrollWheelZoom
        className="h-[calc(100vh-60px)] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <UserLocationMarker
          position={[userLatitude, userLongitude]}
          heading={userHeading}
        />

        <Polyline
          positions={state.activePositions}
          color="blue"
          weight={3}
          opacity={0.7}
        />
        <Polyline
          positions={
            state.backgroundPositions?.map((location) => [
              location.latitude,
              location.longitude,
            ]) || []
          }
          color="red"
          weight={3}
          opacity={0.7}
        />

        <PointPopups type="runtime" positions={state.activePositions} />
        <PointPopups
          type="background"
          positions={
            state.backgroundPositions?.map((location) => [
              location.latitude,
              location.longitude,
            ]) || []
          }
        />
      </MapContainer>

      <Link
        to={"/"}
        className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center absolute top-[50px] right-[50px] z-[999999] border-2 border-blue-400"
      >
        Назад
      </Link>

      <div className="absolute bottom-[30px] p-5 right-0 w-full z-[999999] border-2 border-red-500 flex gap-4">
        <button
          className="bg-black text-white px-[16px] rounded-lg h-[52px] flex items-center "
          onClick={() =>
            setState((s) => ({
              ...s,
              buttons: !s.buttons,
            }))
          }
        >
          {state.buttons ? "Скрыть" : "Показать"}
        </button>
        {!state.buttons && (
          <button
            className="bg-black text-white px-[16px] rounded-lg h-[52px] flex items-center "
            onClick={flyToUser}
          >
            fly to user
          </button>
        )}
        {state.buttons && (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-300 px-[16px] max-w-[50%] flex items-center top-[50px] right-[50%] z-[999999] border-2 border-blue-400 max-h-[80px] w-full overflow-x-scroll overflow-y-scroll text-wrap whitespace-pre-wrap">
              bgPositions: {JSON.stringify(state.backgroundPositions)}
            </div>
            <button
              className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center "
              onClick={deleteLocationsBgLs}
            >
              Удалить кеш LS (background)
            </button>
            <button
              className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center "
              onClick={() => {
                localStorage.removeItem("user_positions_active");
              }}
            >
              Удалить кеш LS (runtime)
            </button>
            <button
              className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center"
              onClick={() => {
                setState((s) => ({ ...s, activePositions: [] }));
              }}
            >
              Удалить состояние activePositions[]
            </button>
            <button
              className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center"
              onClick={() => {
                setState((s) => ({ ...s, backgroundPositions: [] }));
              }}
            >
              Удалить состояние backgroundPositions[]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default withTransition(MapCommunity);
