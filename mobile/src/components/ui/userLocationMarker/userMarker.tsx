import { useEffect } from "react";
import { useMap, Marker } from "react-leaflet";
import L from "leaflet";
import "./UserLocationMarker.css";

interface Props {
  position: [number | undefined, number | undefined];
  heading: number | null;
}

const UserLocationMarker = ({ position, heading }: Props) => {
  const map = useMap();

  const isValidPosition = (
    pos: (number | undefined)[] | null | undefined
  ): pos is [number, number] => {
    return (
      pos != null &&
      Array.isArray(pos) &&
      pos.length === 2 &&
      typeof pos[0] === "number" &&
      typeof pos[1] === "number" &&
      !isNaN(pos[0]) &&
      !isNaN(pos[1])
    );
  };

  const returnValidHeading = () => {
    if (typeof heading === "number") return heading;
    return 0;
  };

  useEffect(() => {
    // @TODO обновляет слишком часто
    if (isValidPosition(position)) {
      map.flyTo(position, map.getZoom(), { duration: 2 });
    }
  }, [position]);

  if (!isValidPosition(position)) return null;

  const icon = L.divIcon({
    className: "user-location-icon",
    html: `
    <div class="user-location-container">
      <div class="user-location-dot"></div>
      <div class="user-location-dot-pulse"></div>
      <div class="user-location-orbit" style="transform: rotate(${returnValidHeading()}deg)">
        <div class="user-location-orbit-arrow"></div>
      </div>
    </div>
  `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const handleClickIcon = () => {
    map.flyTo(position, 18, { duration: 2 });
  };

  return isValidPosition(position) ? (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{ click: handleClickIcon }}
    />
  ) : null;
};

export default UserLocationMarker;
