"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const db_1 = require("./db");
const simulation_1 = require("./simulation");
const utils_1 = require("./utils");
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
app.get("/ping", (req, res) => {
    res.send("pong");
});
app.get("/truckers", async (req, res) => {
    const db = await (0, db_1.getDatabase)();
    const collection = db.collection("truckers");
    const truckers = await collection.find().toArray();
    res.send(truckers);
});
app.post("/truckers", async (req, res) => {
    const db = await (0, db_1.getDatabase)();
    const collection = db.collection("truckers");
    const trucker = req.body;
    const result = await collection.insertOne(trucker);
    res.send(result);
});
app.put("/truckers/:id", async (req, res) => {
    const db = await (0, db_1.getDatabase)();
    const collection = db.collection("truckers");
    const trucker = req.body;
    delete trucker._id;
    const result = await collection.updateOne(
    // @ts-ignore
    { _id: new mongodb_1.ObjectId(req.params.id) }, { $set: { truckId: new mongodb_1.ObjectId(trucker.truckId) } });
    console.log(result);
    res.send(result);
});
app.get("/trucks", async (req, res) => {
    const db = await (0, db_1.getDatabase)();
    const collection = db.collection("trucks");
    const trucks = await collection.find().toArray();
    res.send(trucks);
});
exports.io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("get_truck_positions", async () => {
        const latestTruckPositions = await (0, utils_1.getLatestTruckPositions)();
        console.log("sending truck positions to client: ", latestTruckPositions);
        exports.io.emit("truck_positions", Object.values(latestTruckPositions));
    });
    socket.on("update_truck_position", async (newTruckPosition) => {
        const db = await (0, db_1.getDatabase)();
        const collection = db.collection("trucker_positions");
        await collection.insertOne(newTruckPosition);
        const latestTruckPositions = await (0, utils_1.getLatestTruckPositions)();
        console.log("sending truck positions to client: ", latestTruckPositions);
        exports.io.emit("truck_positions", Object.values(latestTruckPositions));
    });
    socket.on("disconnect", () => {
        console.log(`user ${socket.id} disconnected`);
    });
});
httpServer.listen(4000, async () => {
    await (0, simulation_1.clearDatabase)();
    (0, simulation_1.startSimulation)(5);
    console.log("listening on *:4000");
});
