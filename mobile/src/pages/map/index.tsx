import withTransition from "@/components/providers/transition.tsx";
import { AnimatePresence } from "framer-motion";
import MainLayout from "@/components/layouts/MainLayout.tsx";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useGetUserPosition from "@/hooks/useGetUserPosition.tsx";
// import { Capacitor } from "@capacitor/core";
// import { cn } from "@/lib/utils.ts";

const customIcon = new L.Icon({
  iconUrl: "/svg/mapMarker.svg",
  iconRetinaUrl: "/svg/mapMarker.svg",
  iconSize: [43, 43], // соответствует реальным размерам SVG
  iconAnchor: [21.5, 43], // центр по X (43/2) и низ по Y
  popupAnchor: [0, -43], // всплывающее окно выше маркера
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41], // стандартный размер тени Leaflet
  shadowAnchor: [12, 41], // стандартное смещение тени
});

const MapPage = () => {
  const {
    // userPositionGranted,
    // userPositionLoaded,
    userLongitude,
    userLatitude,
    userSpeed,
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
                      {JSON.stringify(`userSpeed: ${userSpeed}`)}
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
