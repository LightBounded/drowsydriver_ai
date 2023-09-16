import mapboxgl from "mapbox-gl"; // Import Marker from mapbox-gl
import { useEffect, useRef } from "react";

mapboxgl.accessToken =
  "pk.eyJ1IjoibGlnaHRib3VuZGVkIiwiYSI6ImNsbWxtZGI3ejBiaTIyaW13djhjc3dhMHQifQ.EsI_WGO6VymAW40AzWgbPQ";

interface MapProps {
  lat: number;
  lng: number;
  zoom: number;
}

export function Map({ lat, lng, zoom }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom,
    });

    const marker = new mapboxgl.Marker({
      color: "#314ccd",
      scale: 0.5,
    })
      .setLngLat([lng, lat])
      .addTo(map.current);
    console.log(marker);
  }, [lat, lng, zoom]); // Make sure to include lat, lng, and zoom in the dependency array

  return <div className="w-full h-full" ref={mapContainerRef}></div>;
}
