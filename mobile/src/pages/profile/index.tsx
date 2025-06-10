import AuthProvider from "@/components/providers/AuthProvider.tsx";
import withTransition from "@/components/providers/transition.tsx";
import MainLayout from "@/components/layouts/MainLayout";
import Divider from "./components/divider";
import ProfileLink from "./components/profile-link";
import LogoutDialog from "./components/logout-dialog";
import { useState } from "react";
import UserCard from "./components/user-card";
import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";
import { useUserStore } from "@/store/user.ts";
import ImagePath from "@/consts/imageBackendPath.ts";

const ProfilePage = () => {
  const [isOpenLogoutDialog, setIsOpenLogoutDialog] = useState(false);
  const user = useUserStore((state) => state.user);

  const toggleOpenLogoutDialog = (value: boolean) => () => {
    setIsOpenLogoutDialog(value);
  };

  return (
    <AuthProvider redirectTo="/auth">
      <MainLayout>
        <div
          className={cn(" h-screen overflow-y-auto pb-14 text-neutral-500 ", {
            "mt-[3.325rem] h-[calc(100vh-145px)] overflow-y-scroll":
              Capacitor.getPlatform() === "ios",
          })}
        >
          <div className="  w-full flex flex-col gap-4 py-6 px-[1.875rem] ">
            <UserCard
              firstName={user.firstName}
              lastName={user.lastName}
              avatar={user.avatar ? `${ImagePath}${user.avatar}` : null}
              email={user.email}
            />
            <Divider />
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <ProfileLink to={"/profile/userdata"}>details</ProfileLink>
                <ProfileLink to={"/profile/payment"}>payment</ProfileLink>
              </div>
              <Divider />
            </div>

            <button
              className=" justify-start pr-4 pl-5 border-0 text-red-500 bg-red-100 active:bg-red-100 bg-opacity-0 active:bg-opacity-100 hover:bg-opacity-100"
              onClick={toggleOpenLogoutDialog(true)}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.05466 21.75C9.42224 21.75 10.5246 21.75 11.3915 21.6335C12.2916 21.5125 13.0495 21.2536 13.6514 20.6516C14.1764 20.1267 14.4416 19.4816 14.5808 18.7236C14.7161 17.9871 14.742 17.0857 14.748 16.0042C14.7503 15.59 14.4164 15.2523 14.0022 15.25C13.588 15.2477 13.2504 15.5816 13.2481 15.9958C13.242 17.0893 13.2136 17.8644 13.1055 18.4527C13.0014 19.0195 12.8342 19.3475 12.5908 19.591C12.314 19.8678 11.9254 20.0482 11.1917 20.1469C10.4363 20.2484 9.4352 20.25 7.99978 20.25L6.99978 20.25C5.56437 20.25 4.56326 20.2484 3.8079 20.1468C3.07413 20.0482 2.68556 19.8678 2.40879 19.591C2.13203 19.3142 1.95158 18.9257 1.85293 18.1919C1.75138 17.4365 1.74978 16.4354 1.74979 15L1.74979 7C1.74979 5.56458 1.75138 4.56347 1.85293 3.80812C1.95159 3.07434 2.13203 2.68577 2.40879 2.40901C2.68556 2.13224 3.07413 1.9518 3.80791 1.85314C4.56326 1.75159 5.56437 1.75 6.99979 1.75L7.99979 1.75C9.4352 1.75 10.4363 1.75159 11.1917 1.85314C11.9254 1.9518 12.314 2.13224 12.5908 2.40901C12.8342 2.65246 13.0014 2.98053 13.1055 3.54734C13.2136 4.13559 13.242 4.91067 13.2481 6.00417C13.2504 6.41838 13.588 6.75229 14.0022 6.74999C14.4164 6.74768 14.7503 6.41003 14.748 5.99582C14.742 4.91429 14.7161 4.01291 14.5808 3.27635C14.4416 2.51835 14.1764 1.87328 13.6514 1.34835C13.0495 0.746431 12.2916 0.487537 11.3915 0.366519C10.5246 0.249959 9.42225 0.249976 8.05466 0.249997L6.94492 0.249997C5.57733 0.249976 4.475 0.249958 3.60803 0.366518C2.70793 0.487536 1.95005 0.74643 1.34813 1.34834C0.746218 1.95026 0.487325 2.70814 0.366308 3.60824C0.249748 4.47521 0.249765 5.57754 0.249786 6.94513L0.249785 15.0549C0.249764 16.4225 0.249747 17.5248 0.366307 18.3917C0.487324 19.2919 0.746216 20.0497 1.34813 20.6516C1.95005 21.2536 2.70792 21.5125 3.60803 21.6335C4.475 21.75 5.57731 21.75 6.9449 21.75L8.05466 21.75Z"
                  fill="currentColor"
                />
                <path
                  d="M8 11.75C7.58579 11.75 7.25 11.4142 7.25 11C7.25 10.5858 7.58579 10.25 8 10.25L18.9726 10.25L17.0119 8.56944C16.6974 8.29987 16.661 7.8264 16.9306 7.5119C17.2001 7.19741 17.6736 7.16099 17.9881 7.43056L21.4881 10.4306C21.6543 10.573 21.75 10.7811 21.75 11C21.75 11.2189 21.6543 11.427 21.4881 11.5694L17.9881 14.5694C17.6736 14.839 17.2001 14.8026 16.9306 14.4881C16.661 14.1736 16.6974 13.7001 17.0119 13.4306L18.9726 11.75L8 11.75Z"
                  fill="currentColor"
                />
              </svg>
              exit
            </button>
            {isOpenLogoutDialog && (
              <LogoutDialog onClose={toggleOpenLogoutDialog(false)} />
            )}
          </div>
        </div>
      </MainLayout>
    </AuthProvider>
  );
};

export default withTransition(ProfilePage);
