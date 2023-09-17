import { useQuery, useMutation } from "@tanstack/react-query";
import { Truck, Trucker } from "../types";
import { useAppState } from "../context/useAppState";

export function Selection() {
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

  return (
    <div>
      <h1>Which driver are you?</h1>
      <Truckers />
      <h1>Which truck are you driving?</h1>
      <Trucks />
      <button
        onClick={() => {
          if (!truck || !trucker) return;
          updateTrucker.mutate({
            _id: undefined,
            ...trucker,
            truckId: truck._id,
          });
        }}
        disabled={!truck || !trucker}
      >
        Confirm
      </button>
    </div>
  );
}

export function Truckers() {
  const { setTrucker } = useAppState();
  const { data, isLoading } = useQuery<Trucker[]>(["truckers"], async () => {
    console.log(import.meta.env.VITE_API_URL);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/truckers`);
    return await res.json();
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.map((trucker) => (
        <li key={trucker._id as string}>
          <button
            onClick={() => {
              setTrucker(trucker);
            }}
          >
            {trucker.firstName} {trucker.lastName}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Trucks() {
  const { setTruck } = useAppState();
  const { data, isLoading } = useQuery<Truck[]>(["trucks"], () => {
    return fetch(`${import.meta.env.VITE_API_URL}/trucks`).then((res) =>
      res.json()
    );
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.map((truck) => (
        <li key={truck._id as string}>
          <button
            onClick={() => {
              setTruck(truck);
            }}
          >
            {truck.plateNumber}
          </button>
        </li>
      ))}
    </ul>
  );
}
