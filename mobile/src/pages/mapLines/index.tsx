import withTransition from "@/components/providers/transition.tsx";
import { Capacitor } from "@capacitor/core";
import { cn } from "@/lib/utils";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import useGetUserPosition from "@/hooks/useGetUserPosition.tsx";
import { useEffect, useState } from "react";
import UserLocationMarker from "@/components/ui/userLocationMarker/userMarker.tsx";
import PointPopups from "@/pages/mapLines/components/PointPopups.tsx";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext.tsx";

const MapLines = () => {
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

  const [state, setState] = useState<{
    activePositions: LatLngExpression[];
    buttons: boolean;
  }>({
    activePositions: initialPositions,
    buttons: false,
  });

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

  const {
    userGeolocations,
    requestPermissions,
    hasPermissions,
    dispatchBackgroundEvent,
    dispatchDeleteLocations,
  } = useApp();

  return (
    <div
      className={cn("flex flex-col justify-between relative", {
        "h-[calc(100vh-100px)] mt-[60px]": Capacitor.getPlatform() === "ios",
        "h-screen px-4 py-6": Capacitor.getPlatform() !== "ios",
      })}
    >
      <MapContainer
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
            userGeolocations?.map((location) => [
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
            userGeolocations?.map((location) => [
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
        {state.buttons && (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-300 px-[16px] max-w-[50%] flex items-center top-[50px] right-[50%] z-[999999] border-2 border-blue-400 max-h-[80px] w-full overflow-x-scroll overflow-y-scroll text-wrap whitespace-pre-wrap">
              userGeolocations: {JSON.stringify(userGeolocations)}
            </div>
            <button
              className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center "
              onClick={dispatchBackgroundEvent}
            >
              dispatchBackgroundEvent
            </button>
            <button
              className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center "
              onClick={dispatchDeleteLocations}
            >
              Удалить кеш CapacitorKV (background)
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
              disabled={hasPermissions}
              className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center disabled:opacity-50"
              onClick={async () => {
                await requestPermissions();
              }}
            >
              Запросить разрешение на фоновое выполнение
            </button>
            <button
              className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center"
              onClick={() => {
                setState((s) => ({ ...s, activePositions: [] }));
              }}
            >
              Удалить состояние activePositions[]
            </button>
          </div>
        )}
      </div>

      {/*<div className=" absolute bottom-
        [120px] z-[999999] w-full flex justify-between px-52 ">*/}
      {/*  <button*/}
      {/*    onClick={logBlock}*/}
      {/*    className="bg-red-500 text-black px-4 rounded-lg"*/}
      {/*  >*/}
      {/*    Я ХОЧУ ЗАБЛОКИРОВАТЬ ЭКРАН*/}
      {/*  </button>*/}

      {/*  <button*/}
      {/*    onClick={logKill}*/}
      {/*    className="bg-red-500 text-black px-4 rounded-lg"*/}
      {/*  >*/}
      {/*    Я ХОЧУ убить процесс ПРИЛОЖЕНИЯ*/}
      {/*  </button>*/}

      {/*  <button*/}
      {/*    onClick={logUnblock}*/}
      {/*    className="bg-red-500 text-black px-4 rounded-lg"*/}
      {/*  >*/}
      {/*    Я ХОЧУ разБЛОКИРОВАТЬ ЭКРАН*/}
      {/*  </button>*/}
      {/*</div>*/}
    </div>
  );
};

export default withTransition(MapLines);
