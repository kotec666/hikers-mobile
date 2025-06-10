import { logoutUser } from "@/api/auth";
import { useUserStore } from "@/store/user";
import { User } from "@/types/interfaces";
import { FC, MouseEventHandler } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

interface LogoutDialogProps {
  onClose?: () => void;
}

const LogoutDialog: FC<LogoutDialogProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const setUser = useUserStore((state) => state.setUser);

  const close: MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClose?.();
  };

  const handleClickLogout = async () => {
    setUser({} as User);
    await logoutUser();
    localStorage.removeItem("token");
    // Cookies.remove('token')
    window.location.reload();
    return navigate("/auth");
  };

  return createPortal(
    <div
      onClick={close}
      className=" fixed top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center bg-[#2626264D] backdrop-filter backdrop-blur-[3px]"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="flex flex-col "
      >
        <div className="w-full flex justify-end ">
          <button onClick={close} className=" cursor-pointer">
            <svg
              width="31"
              height="30"
              viewBox="0 0 31 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M30.5 15C30.5 23.2843 23.7843 30 15.5 30C7.21573 30 0.5 23.2843 0.5 15C0.5 6.71573 7.21573 0 15.5 0C23.7843 0 30.5 6.71573 30.5 15ZM10.9544 10.4545C11.3938 10.0151 12.1061 10.0151 12.5454 10.4545L15.5 13.409L18.4544 10.4545C18.8938 10.0152 19.6061 10.0152 20.0454 10.4545C20.4848 10.8938 20.4848 11.6062 20.0454 12.0455L17.0909 15L20.0454 17.9544C20.4847 18.3938 20.4847 19.1061 20.0454 19.5454C19.6061 19.9848 18.8937 19.9848 18.4544 19.5454L15.5 16.591L12.5455 19.5455C12.1061 19.9848 11.3938 19.9848 10.9545 19.5455C10.5151 19.1061 10.5151 18.3938 10.9545 17.9545L13.909 15L10.9544 12.0455C10.5151 11.6061 10.5151 10.8938 10.9544 10.4545Z"
                fill="#E5E5E5"
              />
            </svg>
          </button>
        </div>
        <div className=" w-full px-9">
          <div className=" w-64 flex flex-col items-center gap-7 bg-white rounded-3xl px-7 py-5">
            <svg
              width="56"
              height="55"
              viewBox="0 0 56 55"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.2502 52.1354C24.3843 52.1355 26.9104 52.1355 28.8972 51.8684C30.96 51.5911 32.6968 50.9978 34.0762 49.6184C35.2791 48.4154 35.887 46.9371 36.206 45.2C36.5161 43.5121 36.5754 41.4464 36.5892 38.9679C36.5945 38.0187 35.8293 37.2449 34.8801 37.2396C33.9308 37.2343 33.157 37.9996 33.1518 38.9488C33.1378 41.4547 33.0727 43.2309 32.8251 44.579C32.5865 45.878 32.2034 46.6298 31.6455 47.1877C31.0112 47.8219 30.1208 48.2355 28.4392 48.4616C26.7082 48.6943 24.414 48.6979 21.1245 48.6979L18.8328 48.6979C15.5433 48.6979 13.2491 48.6943 11.5181 48.4616C9.8365 48.2355 8.94603 47.8219 8.31178 47.1877C7.67753 46.5534 7.264 45.663 7.03792 43.9814C6.8052 42.2504 6.80155 39.9562 6.80155 36.6667L6.80155 18.3333C6.80155 15.0438 6.8052 12.7496 7.03793 11.0186C7.26401 9.33705 7.67753 8.44657 8.31178 7.81232C8.94603 7.17807 9.83651 6.76455 11.5181 6.53848C13.2491 6.30574 15.5433 6.30209 18.8328 6.30209L21.1245 6.30209C24.414 6.30209 26.7082 6.30575 28.4392 6.53848C30.1208 6.76455 31.0112 7.17808 31.6455 7.81233C32.2034 8.37024 32.5865 9.12207 32.8251 10.421C33.0727 11.7691 33.1378 13.5453 33.1518 16.0512C33.157 17.0005 33.9308 17.7657 34.8801 17.7604C35.8293 17.7551 36.5945 16.9813 36.5892 16.0321C36.5754 13.5536 36.5161 11.4879 36.2061 9.79999C35.887 8.06291 35.2791 6.58461 34.0762 5.38164C32.6968 4.00226 30.96 3.40896 28.8972 3.13162C26.9104 2.86451 24.3843 2.86455 21.2502 2.86459L18.7071 2.86459C15.573 2.86454 13.0468 2.86451 11.06 3.13162C8.99729 3.40895 7.26049 4.00225 5.8811 5.38164C4.50171 6.76104 3.90841 8.49783 3.63108 10.5606C3.36396 12.5474 3.364 15.0735 3.36405 18.2076L3.36405 36.7924C3.364 39.9265 3.36396 42.4526 3.63108 44.4394C3.90841 46.5022 4.5017 48.239 5.8811 49.6184C7.26049 50.9978 8.99728 51.5911 11.06 51.8684C13.0468 52.1355 15.573 52.1355 18.707 52.1354L21.2502 52.1354Z"
                fill="#EF4444"
              />
              <path
                d="M21.125 29.2188C20.1757 29.2188 19.4062 28.4493 19.4062 27.5C19.4062 26.5508 20.1757 25.7813 21.125 25.7813L46.2704 25.7813L41.7772 21.93C41.0565 21.3122 40.9731 20.2272 41.5908 19.5065C42.2086 18.7858 43.2936 18.7023 44.0143 19.32L52.0352 26.195C52.4161 26.5216 52.6354 26.9983 52.6354 27.5C52.6354 28.0018 52.4161 28.4785 52.0352 28.805L44.0143 35.68C43.2936 36.2977 42.2086 36.2143 41.5908 35.4936C40.9731 34.7728 41.0565 33.6878 41.7772 33.07L46.2704 29.2188L21.125 29.2188Z"
                fill="#EF4444"
              />
            </svg>
            <div className=" flex flex-col gap-7">
              <h4 className="h4-text text-center font-medium text-red-500">
                Вы точно хотите выйти из аккаунта?
              </h4>
              <div className="grid grid-cols-2 gap-2 ">
                <button
                  onClick={close}
                  className="  h6-text h-10 bg-neutral-100 text-neutral-500  "
                >
                  Отменить
                </button>
                <button
                  onClick={handleClickLogout}
                  className="   h6-text h-10 bg-red-100 text-red-500"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutDialog;
