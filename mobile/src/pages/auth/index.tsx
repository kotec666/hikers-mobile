import Logo from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { AuthAlertType, AuthEnum } from "@/pages/auth/types/enum.ts";
import { useEffect, useState } from "react";
import AuthProvider from "@/components/providers/AuthProvider.tsx";
import withTransition from "@/components/providers/transition.tsx";
import { Capacitor } from "@capacitor/core";

function Auth({ variant = AuthEnum.AUTH }: { variant?: AuthEnum }) {
  const [data, setData] = useState({
    previousPosition: variant,
    currentPosition: variant,
    timer: 0,
    codeAlert: AuthAlertType.close,
    invalidCode: false,
    errors: {} as { [key: string]: string | boolean },
  });

  let navigateTimeout: string | number | NodeJS.Timeout | undefined;

  const changePosition = (position: AuthEnum) => {
    setData((s) => ({
      ...s,
      errors: {},
    }));

    if (
      data.currentPosition === AuthEnum.AUTH ||
      data.currentPosition === AuthEnum.REG
    ) {
      return setData((s) => ({
        ...s,
        previousPosition: s.currentPosition,
        currentPosition: position,
      }));
    }
    return setData((s) => ({ ...s, currentPosition: position }));
  };

  useEffect(() => {
    return () => clearTimeout(navigateTimeout);
  }, []);

  return (
    <AuthProvider nonAuthorizedAccess={true} redirectTo="/profile">
      <div className="flex flex-col text-neutral-500 ">
        <form className="flex flex-col justify-between">
          {data.currentPosition === AuthEnum.AUTH ||
          data.currentPosition === AuthEnum.REG ? (
            <div
              className={cn(
                "h-[calc(100vh-3rem)] justify-between flex flex-col  px-7 py-6",
                {
                  "h-[calc(100vh-4rem)]": Capacitor.getPlatform() === "ios",
                }
              )}
            >
              <div className="h-8 "></div>
              <div className="flex flex-col gap-10">
                <div className="flex flex-col items-center  text-main-green">
                  <Logo className=" w-[4.75rem] h-[3.75rem]" />
                  <p className="poppins font-semibold">
                    <span className="text-[41.5px] leading-[50.4px]">2</span>
                    <span className="text-[44px] leading-[52.8px]">CHRG</span>
                  </p>
                  <p className="h5-text">
                    {cn(
                      data.currentPosition === AuthEnum.AUTH &&
                        "auth.currentLocation",
                      data.currentPosition === AuthEnum.REG &&
                        "reg.currentLocation"
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 ">
                      <button>
                        {cn(
                          data.currentPosition === AuthEnum.AUTH &&
                            "authorization.enter",
                          data.currentPosition === AuthEnum.REG &&
                            "registration.register"
                        )}
                      </button>
                      <p className="p-text text-center !leading-8 ">
                        {data.currentPosition === AuthEnum.REG && (
                          <>
                            authorization.alreadyHaveAccount{" "}
                            <button
                              type="button"
                              className="text-main-green cursor-pointer"
                              onClick={() => changePosition(AuthEnum.AUTH)}
                            >
                              authorization.enter
                            </button>
                          </>
                        )}
                        {data.currentPosition === AuthEnum.AUTH && (
                          <>
                            registration.dontHaveAccount{" "}
                            <button
                              type="button"
                              className="text-main-green cursor-pointer"
                              onClick={() => changePosition(AuthEnum.REG)}
                            >
                              registration.register
                            </button>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="h5-text !leading-5 text-center  h-8">
                {data.currentPosition === AuthEnum.REG &&
                  "registration.skipReg"}
              </p>
            </div>
          ) : null}
        </form>
      </div>
    </AuthProvider>
  );
}

export default withTransition(Auth);
