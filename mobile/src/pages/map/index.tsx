import withTransition from "@/components/providers/transition.tsx";
import { AnimatePresence } from "framer-motion";
import MainLayout from "@/components/layouts/MainLayout.tsx";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useGetUserPosition from "@/hooks/useGetUserPosition.tsx";
import { customIcon } from "@/components/ui/MapMarker.tsx";
// import { Capacitor } from "@capacitor/core";
// import { cn } from "@/lib/utils.ts";

const MapPage = () => {
  const {
    // userPositionGranted,
    // userPositionLoaded,
    userLongitude,
    userLatitude,
    userSpeed,
    userHeading,
  } = useGetUserPosition();

  return (
    <MainLayout>
      <div className="w-full">
        <AnimatePresence>
          <>
            {userLatitude && userLongitude && (
              <div className="">
                <MapContainer
                  center={[userLatitude, userLongitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-[calc(100vh-60px)] w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    icon={customIcon}
                    position={[userLatitude, userLongitude]}
                  >
                    <Popup>
                      {JSON.stringify(`userLatitude: ${userLatitude}`)}
                      <br />
                      {JSON.stringify(`userLongitude: ${userLongitude}`)}
                      <br />
                      {JSON.stringify(`userSpeed m/h: ${userSpeed}`)}
                      <br />
                      {JSON.stringify(
                        `userSpeed km/h: ${(userSpeed || 0) * 3.6}`
                      )}
                      <br />
                      {JSON.stringify(`userHeading: ${userHeading}`)}
                    </Popup>
                  </Marker>
                </MapContainer>

                {/*{userPositionLoaded && (*/}
                {/*  <MapComponent*/}
                {/*    defaultCenter={{*/}
                {/*      lat: userLatitude,*/}
                {/*      lng: userLongitude,*/}
                {/*    }}*/}
                {/*    granted={userPositionGranted}*/}
                {/*    className={cn("", {*/}
                {/*      "h-[calc(100vh-92px)]": Capacitor.getPlatform() === "ios",*/}
                {/*      "h-[calc(100vh-3.25rem)]":*/}
                {/*        Capacitor.getPlatform() !== "ios",*/}
                {/*    })}*/}
                {/*    handleOpenDrawer={() => {}}*/}
                {/*  />*/}
                {/*)}*/}
              </div>
            )}
          </>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default withTransition(MapPage);
