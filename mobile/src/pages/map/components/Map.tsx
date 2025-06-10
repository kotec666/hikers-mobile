import { memo } from "react";
import { cn } from "@/lib/utils.ts";

interface IMapProps {
  handleOpenDrawer: (id: number, point: string) => void;
  className?: string;
  defaultCenter: { lat: number | undefined; lng: number | undefined };
  granted: boolean;
}

export const MapComponent = memo((props: IMapProps) => {
  const savedCenter = localStorage.getItem("mapCenter");
  const savedZoom = localStorage.getItem("mapZoom");

  const defaultCenter = props.granted
    ? props.defaultCenter
    : savedCenter
    ? JSON.parse(savedCenter)
    : {
        lat: 31.730998,
        lng: 34.829848,
      };
  const defaultZoom = savedZoom ? Number(savedZoom) : 10;

  return (
    <div className={cn("w-full ", props.className)}>
      {/*<APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_KEY}>*/}
      {/*    <Map*/}
      {/*        defaultCenter={defaultCenter}*/}
      {/*        defaultZoom={defaultZoom}*/}
      {/*        disableDefaultUI={true}*/}
      {/*        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}*/}
      {/*        minZoom={6}*/}
      {/*        maxZoom={21}*/}

      {/*        // raster id - 399e953c34ec36df*/}
      {/*        // vector id - 433351f6373d4516*/}
      {/*    >*/}
      {/*        {props.points && (*/}
      {/*            <Markers*/}
      {/*                handleOpenDrawer={props.handleOpenDrawer}*/}
      {/*                points={props.points}*/}
      {/*            />*/}
      {/*        )}*/}
      {/*    </Map>*/}
      {/*</APIProvider>*/}
    </div>
  );
});
