import { Truck } from "./types";

export const simulateTruck = (truck: Truck): Truck => {
  const { lon, lat } = truck;
  const [newLon, newLat] = randomWalk(lon, lat);
  return {
    ...truck,
    lon: newLon,
    lat: newLat,
    timestamp: new Date(),
  };
};

export const randomWalk = (lon: number, lat: number): [number, number] => {
  const [lonDelta, latDelta] = [
    Math.random() * 0.0001 - 0.00005,
    Math.random() * 0.0001 - 0.00005,
  ];
  return [lon + lonDelta, lat + latDelta];
};

export const createTrucks = (n: number): Truck[] => {
  const trucks: Truck[] = [];
  for (let i = 0; i < n; i++) {
    trucks.push({
      name: `Truck ${i}`,
      lon: Math.random() * 360 - 180,
      lat: Math.random() * 180 - 90,
      timestamp: new Date(),
    });
  }
  return trucks;
};

export const simulateTrucks = (trucks: Truck[]): Truck[] => {
  return trucks.map(simulateTruck);
};

// Every 5 seconds we simulate the trucks moving and send the new data to the client.
export const startSimulation = (
  trucks: Truck[],
  callback: (trucks: Truck[]) => void
): void => {
  setInterval(() => {
    const newTrucks = simulateTrucks(trucks);
    callback(newTrucks);
  }, 5000);
};
