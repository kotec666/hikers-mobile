import { forwardRef } from "react";

type InputProps = {
  title: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ title, ...props }, ref) => {
    return (
      <label className="flex flex-col">
        <div className="flex flex-col gap-1">
          <div
            className={
              " w-full h-[3.25rem] flex items-center justify-between gap-4 px-4  border-b border-main-green"
            }
          >
            <input
              ref={ref}
              type="text"
              className="grow p-text  text-neutral-500 border-none outline-none ring-0 focus:outline-none bg-transparent"
              {...props}
            />
            <button className=" cursor-pointer text-neutral-400 ">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.0303 7.96965C8.73741 7.67676 8.26253 7.67676 7.96964 7.96965C7.67675 8.26255 7.67675 8.73742 7.96964 9.03031L9.93932 11L7.96966 12.9697C7.67677 13.2625 7.67677 13.7374 7.96966 14.0303C8.26255 14.3232 8.73743 14.3232 9.03032 14.0303L11 12.0607L12.9696 14.0303C13.2625 14.3232 13.7374 14.3232 14.0303 14.0303C14.3232 13.7374 14.3232 13.2625 14.0303 12.9696L12.0606 11L14.0303 9.03033C14.3232 8.73744 14.3232 8.26257 14.0303 7.96968C13.7374 7.67678 13.2625 7.67678 12.9696 7.96968L11 9.93933L9.0303 7.96965Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11 0.25C5.06294 0.25 0.25 5.06294 0.25 11C0.25 16.9371 5.06294 21.75 11 21.75C16.9371 21.75 21.75 16.9371 21.75 11C21.75 5.06294 16.9371 0.25 11 0.25ZM1.75 11C1.75 5.89137 5.89137 1.75 11 1.75C16.1086 1.75 20.25 5.89137 20.25 11C20.25 16.1086 16.1086 20.25 11 20.25C5.89137 20.25 1.75 16.1086 1.75 11Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </label>
    );
  }
);

export default Input;
