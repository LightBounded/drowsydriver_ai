"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestTruckPositions = void 0;
const db_1 = require("./db");
const getLatestTruckPositions = async () => {
    const db = await (0, db_1.getDatabase)();
    const collection = db.collection("truck_positions");
    // filter truck positions to only include the latest position for each truck
    const truckPositions = await collection.find().toArray();
    const latestTruckPositions = truckPositions.reduce((acc, truckPosition) => {
        if (!acc[truckPosition.truckId.toString()]) {
            acc[truckPosition.truckId.toString()] = truckPosition;
        }
        else if (acc[truckPosition.truckId.toString()].timestamp <
            truckPosition.timestamp) {
            acc[truckPosition.truckId.toString()] = truckPosition;
        }
        return acc;
    }, {});
    return Object.values(latestTruckPositions);
};
exports.getLatestTruckPositions = getLatestTruckPositions;
