import Map, { Marker } from "react-map-gl";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useQuery } from "@tanstack/react-query";
import { TruckPosition, Trucker } from "../types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { socket } from "../utils";

const fetchTruckers = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/truckers`);
  return res.json();
};

type MapViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export function Index() {
  const [mapViewState, setMapViewState] = useState<MapViewState>({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  });

  const { data: truckers, isLoading } = useQuery<Trucker[]>({
    queryKey: ["truckers"],
    queryFn: fetchTruckers,
  });

  const [truckPositions, setTruckPositions] = useState<TruckPosition[]>([]);

  useEffect(() => {
    socket.emit("get_truck_positions");

    socket.on("truck_positions", (truckPositions: TruckPosition[]) => {
      setTruckPositions(truckPositions);
    });

    return () => {
      socket.off("truck_positions");
    };
  }, []);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
        mapStyle={import.meta.env.VITE_MAP_STYLE_URL}
        longitude={mapViewState.longitude}
        latitude={mapViewState.latitude}
      >
        {truckPositions?.map((truckPosition) => {
          const trucker = truckers?.find(
            (trucker) => trucker.truckId === truckPosition.truckId
          );

          return (
            <Marker
              key={truckPosition._id as string}
              longitude={truckPosition.lon}
              latitude={truckPosition.lat}
              color="blue"
              scale={0.5}
              anchor="bottom"
            >
              <div className="-z-500">
                {trucker?.firstName} {trucker?.lastName}
              </div>
            </Marker>
          );
        })}
      </Map>
      <TruckList
        truckers={truckers}
        truckPositions={truckPositions}
        setMapViewState={setMapViewState}
      />
    </>
  );
}

interface TruckersListProps {
  truckers?: Trucker[];
  truckPositions?: TruckPosition[];
  setMapViewState: Dispatch<SetStateAction<MapViewState>>;
}
function TruckList({
  truckers,
  truckPositions,
  setMapViewState,
}: TruckersListProps) {
  const activeTruckers = truckers?.filter((trucker) =>
    truckPositions?.find(
      (truckPosition) => truckPosition.truckId === trucker.truckId
    )
  );
  return (
    <div className="absolute top-4 left-4 bg-neutral-950 p-4 rounded">
      <h1 className="text-white text-xl font-bold">Active Truckers</h1>
      {activeTruckers?.length === 0 && (
        <div className="text-white">No active truckers found</div>
      )}
      {activeTruckers && activeTruckers.length > 0 && (
        <ul className="mt-4">
          {activeTruckers?.map((trucker) => {
            const truckPosition = truckPositions?.find(
              (truckPosition) => truckPosition.truckId === trucker.truckId
            );

            return (
              <li key={trucker._id as string} className="text-white">
                <button
                  onClick={() => {
                    setMapViewState({
                      latitude: truckPosition?.lat ?? 0,
                      longitude: truckPosition?.lon ?? 0,
                      zoom: 8,
                    });
                  }}
                >
                  {trucker.firstName} {trucker.lastName}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
