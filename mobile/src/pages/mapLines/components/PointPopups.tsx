import { customIcon } from "@/components/ui/MapMarker.tsx";
import { Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";

const PointPopups = (props: { positions: LatLngExpression[] }) => {
  const map = useMap();

  return (
    <>
      {props.positions.map((point, idx) => (
        <Marker
          icon={customIcon}
          key={`${JSON.stringify(point)}--${idx}`}
          position={point}
          eventHandlers={{ click: () => map.flyTo(point, 18, { duration: 2 }) }}
        >
          <Popup>
            Точка {idx + 1}: {JSON.stringify(point)}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default PointPopups;
