"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDatabase = exports.moveTrucks = exports.createInitialTruckPositions = exports.startSimulation = void 0;
const db_1 = require("./db");
const faker_1 = require("@faker-js/faker");
const utils_1 = require("./utils");
const _1 = require(".");
const startSimulation = async (numberOfTrucks) => {
    await createTrucks(numberOfTrucks);
    await createTruckers(numberOfTrucks);
    // await createInitialTruckPositions(numberOfTrucks);
    // setInterval(async () => {
    //   console.log("Moving trucks");
    //   await moveTrucks(numberOfTrucks);
    //   console.log("Trucks moved");
    // }, 5000);
};
exports.startSimulation = startSimulation;
const createTrucks = async (n) => {
    const db = await (0, db_1.getDatabase)();
    let trucks = [];
    for (let i = 0; i < n; i++) {
        const truck = {
            plateNumber: faker_1.faker.vehicle.vin(),
        };
        trucks.push(truck);
    }
    const collection = db.collection("trucks");
    await collection.insertMany(trucks);
};
const createTruckers = async (n) => {
    const db = await (0, db_1.getDatabase)();
    const trucks = await db.collection("trucks").find().toArray();
    let truckers = [];
    for (let i = 0; i < n; i++) {
        const trucker = {
            age: faker_1.faker.number.int({ min: 18, max: 100 }),
            firstName: faker_1.faker.person.firstName(),
            lastName: faker_1.faker.person.lastName(),
            email: faker_1.faker.internet.email(),
            phone: faker_1.faker.phone.number(),
            truckId: null,
        };
        truckers.push(trucker);
    }
    const collection = db.collection("truckers");
    await collection.insertMany(truckers);
};
const createInitialTruckPositions = async (n) => {
    const db = await (0, db_1.getDatabase)();
    const trucks = await db.collection("trucks").find().toArray();
    let truckPositions = [];
    for (let i = 0; i < n; i++) {
        const truckPosition = {
            truckId: trucks[i]._id,
            lon: faker_1.faker.location.longitude(),
            lat: faker_1.faker.location.latitude(),
            timestamp: new Date(),
        };
        truckPositions.push(truckPosition);
    }
    const collection = db.collection("truck_positions");
    await collection.insertMany(truckPositions);
};
exports.createInitialTruckPositions = createInitialTruckPositions;
const moveTrucks = async (n) => {
    const db = await (0, db_1.getDatabase)();
    const latestTructPositions = await (0, utils_1.getLatestTruckPositions)();
    let updatedTruckPositions = [];
    for (let i = 0; i < n; i++) {
        const truckPosition = {
            truckId: latestTructPositions[i].truckId,
            lon: latestTructPositions[i].lon +
                faker_1.faker.number.float({ min: -0.1, max: 0.1 }),
            lat: latestTructPositions[i].lat +
                faker_1.faker.number.float({ min: -0.1, max: 0.1 }),
            timestamp: new Date(),
        };
        updatedTruckPositions.push(truckPosition);
    }
    const collection = db.collection("truck_positions");
    await collection.insertMany(updatedTruckPositions);
    _1.io.emit("truck_positions", await (0, utils_1.getLatestTruckPositions)());
};
exports.moveTrucks = moveTrucks;
const clearDatabase = async () => {
    const db = await (0, db_1.getDatabase)();
    await db.collection("truckers").deleteMany({});
    await db.collection("trucks").deleteMany({});
    await db.collection("truck_positions").deleteMany({});
};
exports.clearDatabase = clearDatabase;
