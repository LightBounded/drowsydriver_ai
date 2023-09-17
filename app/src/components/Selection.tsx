import { useQuery, useMutation } from "@tanstack/react-query";
import { Truck, Trucker } from "../types";
import { useAppState } from "../context/useAppState";
import { LoadingOverlay } from "./LoadingOverlay";
import { useEffect, useState } from "react";
import { wait } from "../utils";

export function Selection() {
  const [isLoading, setIsLoading] = useState(true);
  const { setHasConfirmed, trucker, truck } = useAppState();

  const updateTrucker = useMutation(
    async (trucker: Trucker) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/truckers/${trucker._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trucker),
        }
      );
      return await res.json();
    },
    {
      onSuccess: () => {
        setHasConfirmed(true);
      },
    }
  );

  useEffect(() => {
    wait(1000).then(() => {
      setIsLoading(false);
    });
  });

  return (
    <>
      <div className="bg-neutral-950 text-white h-screen p-8 flex flex-col justify-center max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-1">Which driver are you?</h1>
        <Truckers />
        <h1 className="text-lg font-bold mb-1 mt-4">
          Which truck are you driving?
        </h1>
        <Trucks />
        <button
          className="mt-8 px-3 py-2 border bg-white text-black rounded text-sm border-white font-bold"
          onClick={() => {
            if (!truck || !trucker) return;
            updateTrucker.mutate({
              ...trucker,
              truckId: truck._id,
            });
          }}
          disabled={!truck || !trucker}
        >
          Confirm
        </button>
      </div>
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
}

export function Truckers() {
  const { setTrucker } = useAppState();
  const {
    data: truckers,
    isLoading,
    error,
  } = useQuery<Trucker[]>(["truckers"], async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/truckers`);
    return await res.json();
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Oops, something happened...</div>;

  return (
    <select
      onChange={(e) => {
        setTrucker(truckers?.find((t) => t._id == e.target.value) as Trucker);
      }}
      className="bg-neutral-900 px-3 py-2 rounded block border-r-[12px] border-neutral-900"
    >
      <option>Please select an option</option>
      {truckers?.map((t) => (
        <option key={t._id as string} value={t._id as string}>
          {t.firstName} {t.lastName}
        </option>
      ))}
    </select>
  );
}

export function Trucks() {
  const { setTruck } = useAppState();
  const {
    data: trucks,
    isLoading,
    error,
  } = useQuery<Truck[]>(["trucks"], async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/trucks`);
    return await res.json();
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Oops, something happened...</div>;

  return (
    <select
      onChange={(e) => {
        setTruck(trucks?.find((t) => t.plateNumber == e.target.value) as Truck);
      }}
      className="bg-neutral-900 px-3 py-2 rounded block border-r-[12px] border-neutral-900"
    >
      <option>Please select an option</option>
      {trucks?.map((truck) => (
        <option key={truck._id as string}>{truck.plateNumber}</option>
      ))}
    </select>
  );
}
