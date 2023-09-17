import Map, { Marker, } from "react-map-gl";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useQuery } from "@tanstack/react-query";
import { TruckPosition, Trucker } from "../../../api/src/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { socket } from "../utils";

const fetchTruckers = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/truckers`);
  return res.json();
};

type MapState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export function Truckers() {
  const [position, setPosition] = useState<MapState>({
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
      console.log("truck_positions", truckPositions);
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
        longitude={position.longitude}
        latitude={position.latitude}
      >
        {truckPositions?.map((truckPosition) => (
          <Marker
            key={truckPosition._id.toString()}
            longitude={truckPosition.lon}
            latitude={truckPosition.lat}
            color="blue"
            scale={0.5}
            anchor="bottom"
          ></Marker>
        ))}
      </Map>
      <TruckersList
        truckers={truckers}
        truckPositions={truckPositions}
        setPosition={setPosition}
      />
    </>
  );
}

interface TruckersListProps {
  truckers?: Trucker[];
  truckPositions?: TruckPosition[];
  setPosition: Dispatch<SetStateAction<MapState>>;
}
function TruckersList({
  truckers,
  truckPositions,
  setPosition: setViewState,
}: TruckersListProps) {
  return (
    <div className="absolute top-4 left-4 bg-black p-4 rounded">
      <h1 className="text-white text-xl font-bold">Truckers</h1>
      {truckers?.length === 0 && (
        <div className="text-white">No truckers found.</div>
      )}
      <ul className="mt-4">
        {truckers?.map((trucker) => {
          const truckPosition = truckPositions?.find(
            (truckPosition) =>
              truckPosition.truckId.toString() === trucker.truckId.toString()
          );

          return (
            <li key={trucker._id.toString()} className="text-white">
              <button
                onClick={() => {
                  setViewState({
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
    </div>
  );
}
