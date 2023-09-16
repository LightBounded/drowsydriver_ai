import { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl";
import { wait } from "../utils";
import { LoadingOverlay } from "../components/LoadingOverlay";

export function Truckers() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    wait(1000).then(() => setIsLoading(false));
  }, []);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <Map
        mapboxAccessToken="pk.eyJ1IjoibGlnaHRib3VuZGVkIiwiYSI6ImNsbWxtZGI3ejBiaTIyaW13djhjc3dhMHQifQ.EsI_WGO6VymAW40AzWgbPQ"
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
          bearing: 0,
          pitch: 0,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v9"
      >
        <Marker
          longitude={-122.4}
          latitude={37.8}
          color="red"
          scale={0.5}
          anchor="bottom"
        ></Marker>
      </Map>
    </>
  );
}
