import L from "leaflet";

export const customIcon = new L.Icon({
  iconUrl: "/svg/mapMarker.svg",
  iconRetinaUrl: "/svg/mapMarker.svg",
  iconSize: [43, 43], // соответствует реальным размерам SVG
  iconAnchor: [21.5, 43], // центр по X (43/2) и низ по Y
  popupAnchor: [0, -43], // всплывающее окно выше маркера
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41], // стандартный размер тени Leaflet
  shadowAnchor: [12, 41], // стандартное смещение тени
});
