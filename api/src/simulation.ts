import { getDatabase } from "./db";
import { Truck, TruckPosition, Trucker } from "./types";
import { faker } from "@faker-js/faker";
import { getLatestTruckPositions } from "./utils";
import { io } from ".";

export const startSimulation = async (numberOfTrucks: number) => {
  await createTrucks(numberOfTrucks);
  await createTruckers(numberOfTrucks);
  await createInitialTruckPositions(numberOfTrucks);

  setInterval(async () => {
    console.log("Moving trucks");
    await moveTrucks(numberOfTrucks);
    console.log("Trucks moved");
  }, 5000);
};

const createTrucks = async (n: number) => {
  const db = await getDatabase();
  let trucks: Omit<Truck, "_id">[] = [];
  for (let i = 0; i < n; i++) {
    const truck: Omit<Truck, "_id"> = {
      plateNumber: faker.vehicle.vin(),
    };
    trucks.push(truck);
  }

  const collection = db.collection("trucks");
  await collection.insertMany(trucks);
};

const createTruckers = async (n: number) => {
  const db = await getDatabase();
  const trucks = await db.collection("trucks").find().toArray();

  let truckers: Omit<Trucker, "_id">[] = [];
  for (let i = 0; i < n; i++) {
    const trucker: Omit<Trucker, "_id"> = {
      age: faker.number.int({ min: 18, max: 100 }),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      truckId: trucks[i]._id,
    };
    truckers.push(trucker);
  }

  const collection = db.collection("truckers");
  await collection.insertMany(truckers);
};

export const createInitialTruckPositions = async (n: number) => {
  const db = await getDatabase();
  const trucks = await db.collection("trucks").find().toArray();
  let truckPositions: Omit<TruckPosition, "_id">[] = [];
  for (let i = 0; i < n; i++) {
    const truckPosition: Omit<TruckPosition, "_id"> = {
      truckId: trucks[i]._id,
      lon: faker.location.longitude(),
      lat: faker.location.latitude(),
      timestamp: new Date(),
    };
    truckPositions.push(truckPosition);
  }

  const collection = db.collection("truck_positions");
  await collection.insertMany(truckPositions);
};

export const moveTrucks = async (n: number) => {
  const db = await getDatabase();
  const latestTructPositions = await getLatestTruckPositions();

  let updatedTruckPositions: Omit<TruckPosition, "_id">[] = [];
  for (let i = 0; i < n; i++) {
    const truckPosition: Omit<TruckPosition, "_id"> = {
      truckId: latestTructPositions[i].truckId,
      lon:
        latestTructPositions[i].lon +
        faker.number.float({ min: -0.1, max: 0.1 }),
      lat:
        latestTructPositions[i].lat +
        faker.number.float({ min: -0.1, max: 0.1 }),
      timestamp: new Date(),
    };
    updatedTruckPositions.push(truckPosition);
  }

  const collection = db.collection("truck_positions");
  await collection.insertMany(updatedTruckPositions);
  io.emit("truck_positions", await getLatestTruckPositions());
};

export const clearDatabase = async () => {
  const db = await getDatabase();
  await db.collection("truckers").deleteMany({});
  await db.collection("trucks").deleteMany({});
  await db.collection("truck_positions").deleteMany({});
};
