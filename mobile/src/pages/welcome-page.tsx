import { Link } from "react-router-dom";
import withTransition from "@/components/providers/transition.tsx";
import { Capacitor } from "@capacitor/core";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext.tsx";

function WelcomePage() {
  const {
    userGeolocation,
    lastUpdated,
    requestPermissions,
    hasPermissions,
    dispatchBackgroundEvent,
  } = useApp();

  return (
    <div
      className={cn("flex flex-col justify-between", {
        "h-[calc(100vh-100px)] mt-[60px]": Capacitor.getPlatform() === "ios",
        "h-screen px-4 py-6": Capacitor.getPlatform() !== "ios",
      })}
    >
      <div>
        <span>userGeolocation:</span>
        <pre>{JSON.stringify(userGeolocation, null, 2)}</pre>
        <br />
        <span>lastUpdated:</span>
        <pre>{JSON.stringify(lastUpdated)}</pre>
        <br />
      </div>

      <div className="flex gap-4">
        <button
          className="bg-red-500 disabled:opacity-50 rounded-lg h-[42px] px-[16px]"
          disabled={hasPermissions}
          onClick={requestPermissions}
        >
          Permissions
        </button>

        <button
          className="bg-red-500 disabled:opacity-50 rounded-lg h-[42px] px-[16px]"
          onClick={dispatchBackgroundEvent}
        >
          Dispatch UpdateData
        </button>
      </div>

      <Link to={"/bgCommunityLocation"}>bgCommunityLocation</Link>
      <Link
        className={cn(" w-full", {
          "px-[30px]": Capacitor.getPlatform() === "ios",
        })}
        to={"/reg"}
      >
        <button>
          <div className="flex items-center">
            next
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.8351 11.6296L9.20467 5.1999C8.79094 4.79869 8 5.04189 8 5.5703L8 18.4297C8 18.9581 8.79094 19.2013 9.20467 18.8001L15.8351 12.3704C16.055 12.1573 16.0549 11.8427 15.8351 11.6296Z"
                fill="white"
              />
            </svg>
          </div>
        </button>
      </Link>
      <Link
        className={cn(" w-full", {
          "px-[30px]": Capacitor.getPlatform() === "ios",
        })}
        to={"/map"}
      >
        <button>
          <div className="flex items-center">
            перейти на страницу карты
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.8351 11.6296L9.20467 5.1999C8.79094 4.79869 8 5.04189 8 5.5703L8 18.4297C8 18.9581 8.79094 19.2013 9.20467 18.8001L15.8351 12.3704C16.055 12.1573 16.0549 11.8427 15.8351 11.6296Z"
                fill="white"
              />
            </svg>
          </div>
        </button>
      </Link>
    </div>
  );
}

export default withTransition(WelcomePage);
