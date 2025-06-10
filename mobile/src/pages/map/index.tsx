import withTransition from "@/components/providers/transition.tsx";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import MainLayout from "@/components/layouts/MainLayout.tsx";
import { MapComponent } from "@/pages/map/components/Map.tsx";
import useGetUserPosition from "@/hooks/useGetUserPosition.tsx";
import { Capacitor } from "@capacitor/core";

const MapPage = () => {
  const {
    userPositionGranted,
    userPositionLoaded,
    userLongitude,
    userLatitude,
  } = useGetUserPosition();

  return (
    <MainLayout>
      <div className="w-full">
        <AnimatePresence>
          <>
            <div className="">
              maaap
              {userPositionLoaded && (
                <MapComponent
                  defaultCenter={{
                    lat: userLatitude,
                    lng: userLongitude,
                  }}
                  granted={userPositionGranted}
                  className={cn("", {
                    "h-[calc(100vh-92px)]": Capacitor.getPlatform() === "ios",
                    "h-[calc(100vh-3.25rem)]":
                      Capacitor.getPlatform() !== "ios",
                  })}
                  handleOpenDrawer={() => {}}
                />
              )}
            </div>
          </>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default withTransition(MapPage);
