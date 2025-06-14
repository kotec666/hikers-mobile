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

const MapLines = () => {
  // const point1: LatLngExpression = [53.374336, 49.46009];
  // const point2: LatLngExpression = [53.375477, 49.459763];
  // const point3: LatLngExpression = [53.375728, 49.460764];
  //
  // const pointV21: LatLngExpression = [53.374991, 49.465148];
  // const pointV22: LatLngExpression = [53.374964, 49.467808];
  // const pointV23: LatLngExpression = [53.376216, 49.467847];
  //
  // const lineCoordinatesOpened = [point1, point2, point3];
  // const lineCoordinatesBackground = [pointV21, pointV22, pointV23];
  //
  // const logBlock = async () => {
  //   try {
  //     await sendLog({
  //       text: "Предупреждаю, я щас заблокирую экран и пойду чекать как работает фоновая геолокация!!!!!",
  //     });
  //     alert(
  //       `Ты отправил лог о блокировке экрана, можешь блокировать и идти метров 15, Да хранит тебя господь`
  //     );
  //   } catch (e) {
  //     alert(
  //       `Ошибка при отправке лога о блокировке экрана ${JSON.stringify(e)}`
  //     );
  //   }
  // };
  //
  // const logUnblock = async () => {
  //   try {
  //     await sendLog({
  //       text: "Предупреждаю, я разблокировал экран и пойду чекать как работает геолокация сейчас!!!!!",
  //     });
  //     alert(
  //       `Ты отправил лог о разблокировке экрана, можешь пройти метров 15, Да хранит тебя господь`
  //     );
  //   } catch (e) {
  //     alert(
  //       `Ошибка при отправке лога о разблокировке экрана ${JSON.stringify(e)}`
  //     );
  //   }
  // };
  //
  // const logKill = async () => {
  //   try {
  //     await sendLog({
  //       text: "Предупреждаю, я убиваю процесс приложения и пойду чекать как работает геолокация сейчас!!!!!",
  //     });
  //     alert(
  //       `Ты отправил лог о убийстве процесса приложения, можешь пройти метров 15, Да хранит тебя господь`
  //     );
  //   } catch (e) {
  //     alert(
  //       `Ошибка при отправке лога о убийстве процесса ${JSON.stringify(e)}`
  //     );
  //   }
  // };

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
  }>({
    activePositions: initialPositions,
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
    setState({ activePositions: updatedPositions });
  }, [userLongitude, userLatitude]);

  const getMapCenter = (): LatLngExpression => {
    const userLatLng = [userLatitude, userLongitude];
    return isValidPosition(userLatLng) ? userLatLng : [55.732579, 37.498387];
  };

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
        {/*<Polyline*/}
        {/*  positions={lineCoordinatesBackground}*/}
        {/*  color="red"*/}
        {/*  weight={3}*/}
        {/*  opacity={0.7}*/}
        {/*/>*/}

        <PointPopups positions={state.activePositions} />

        {/*{lineCoordinatesBackground.map((point, idx) => (*/}
        {/*  <Marker*/}
        {/*    icon={customIcon}*/}
        {/*    key={JSON.stringify(point)}*/}
        {/*    position={point}*/}
        {/*  >*/}
        {/*    <Popup>*/}
        {/*      Точка {idx + 1}: {JSON.stringify(point)}*/}
        {/*    </Popup>*/}
        {/*  </Marker>*/}
        {/*))}*/}
      </MapContainer>

      <Link
        to={"/"}
        className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center absolute top-[50px] right-[50px] z-[999999] border-2 border-blue-400"
      >
        Назад
      </Link>

      <div className="absolute bottom-[30px] p-5 right-0 w-full z-[999999] border-2 border-red-500 flex gap-4">
        <button
          className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center"
          onClick={() => {
            localStorage.removeItem("user_positions_active");
          }}
        >
          Удалить кеш LS (runtime)
        </button>
        <button
          className="bg-gray-300 px-[16px] rounded-lg h-[52px] flex items-center"
          onClick={() => {
            setState({ activePositions: [] });
          }}
        >
          Удалить состояние activePositions[]
        </button>
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
