import { getDatabase } from "./db";
import { TruckPosition } from "types";

export const getLatestTruckPositions = async () => {
  const db = await getDatabase();
  const collection = db.collection("truck_positions");
  // filter truck positions to only include the latest position for each truck
  const truckPositions = await collection.find().toArray();
  const latestTruckPositions = truckPositions.reduce(
    (acc: { [truckId: string]: TruckPosition }, truckPosition: any) => {
      if (!acc[truckPosition.truckId.toString()]) {
        acc[truckPosition.truckId.toString()] = truckPosition;
      } else if (
        acc[truckPosition.truckId.toString()].timestamp <
        truckPosition.timestamp
      ) {
        acc[truckPosition.truckId.toString()] = truckPosition;
      }
      return acc;
    },
    {}
  );
  return Object.values(latestTruckPositions);
};
