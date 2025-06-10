import { Link } from "react-router-dom";
import withTransition from "@/components/providers/transition.tsx";
import { Capacitor } from "@capacitor/core";
import { cn } from "@/lib/utils";

function WelcomePage() {
  return (
    <div
      className={cn("flex flex-col justify-between", {
        "h-[calc(100vh-100px)] mt-[60px]": Capacitor.getPlatform() === "ios",
        "h-screen px-4 py-6": Capacitor.getPlatform() !== "ios",
      })}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-full">phone</div>
          <div className=" w-24 h-2 rounded-[13px] bg-main-green"></div>
        </div>
        <div className="flex flex-col gap-5 text-center">
          <h1 className=" h1-text font-medium text-black-inverted">title</h1>
          <p className="p-text text-neutral-700">description</p>
        </div>
      </div>
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
    </div>
  );
}

export default withTransition(WelcomePage);
