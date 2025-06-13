import { Link } from "react-router-dom";
import withTransition from "@/components/providers/transition.tsx";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import { sendLog } from "@/api/logger.ts";
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  "BackgroundGeolocation"
);

function showDeviceLocalTimeAlert() {
  const now = new Date();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const formattedTime = now.toLocaleTimeString(undefined, timeOptions);
  const formattedDate = now.toLocaleDateString(undefined, dateOptions);

  return `
  🗓️ ${formattedDate}
  🕒 ${formattedTime}
  
  На вашем устройстве сейчас:
  📱 ${now.toLocaleString()}
  `;
}

const configureBackgroundGeolocation = async (): Promise<string> => {
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
        return;
      }
      alert(
        `${showDeviceLocalTimeAlert()}; New location: ${JSON.stringify(
          location
        )}`
      );
      sendLog({
        text: `${showDeviceLocalTimeAlert()}; New location: ${JSON.stringify(
          location
        )}`,
      });
    }
  );

  alert(`Watcher started with ID: ${watcherId}`);
  return watcherId;
};

function BgCommunityLocation() {
  useEffect(() => {
    let watcherId: string;

    const startTracking = async () => {
      try {
        watcherId = await configureBackgroundGeolocation();
      } catch (error) {
        alert(`Error starting background tracking: ${error}`);
      }
    };

    startTracking();

    // Очистка при размонтировании компонента
    return () => {
      if (watcherId) {
        BackgroundGeolocation.removeWatcher({ id: watcherId });
      }
    };
  }, []);

  const logBlock = async () => {
    try {
      await sendLog({
        text: "Предупреждаю, я щас заблокирую экран и пойду чекать как работает фоновая геолокация!!!!!",
      });
      alert(
        `Ты отправил лог о блокировке экрана, можешь блокировать и идти метров 15, Да хранит тебя господь`
      );
    } catch (e) {
      alert(
        `Ошибка при отправке лога о блокировке экрана ${JSON.stringify(e)}`
      );
    }
  };

  const logUnblock = async () => {
    try {
      await sendLog({
        text: "Предупреждаю, я разблокировал экран и пойду чекать как работает геолокация сейчас!!!!!",
      });
      alert(
        `Ты отправил лог о разблокировке экрана, можешь пройти метров 15, Да хранит тебя господь`
      );
    } catch (e) {
      alert(
        `Ошибка при отправке лога о разблокировке экрана ${JSON.stringify(e)}`
      );
    }
  };

  return (
    <div
      className={cn("flex flex-col justify-between", {
        "h-[calc(100vh-100px)] mt-[60px]": Capacitor.getPlatform() === "ios",
        "h-screen px-4 py-6": Capacitor.getPlatform() !== "ios",
      })}
    >
      <button onClick={logBlock} className="bg-red-500 text-black">
        Я ХОЧУ ЗАБЛОКИРОВАТЬ ЭКРАН
      </button>

      <button onClick={logUnblock} className="bg-red-500 text-black">
        Я ХОЧУ разБЛОКИРОВАТЬ ЭКРАН
      </button>
      <Link
        className={cn(" w-full", {
          "px-[30px]": Capacitor.getPlatform() === "ios",
        })}
        to={"/"}
      >
        to welcome page
      </Link>
    </div>
  );
}

export default withTransition(BgCommunityLocation);
