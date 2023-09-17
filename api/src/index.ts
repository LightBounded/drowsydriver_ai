import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { getDatabase } from "./db";
import { clearDatabase, startSimulation } from "./simulation";
import { getLatestTruckPositions } from "./utils";
import { Truck, TruckPosition } from "./types";
import { ObjectId } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/truckers", async (req, res) => {
  const db = await getDatabase();
  const collection = db.collection("truckers");
  const truckers = await collection.find().toArray();
  res.send(truckers);
});

app.post("/truckers", async (req, res) => {
  const db = await getDatabase();
  const collection = db.collection("truckers");
  const trucker = req.body;
  const result = await collection.insertOne(trucker);
  res.send(result);
});

app.put("/truckers/:id", async (req, res) => {
  const db = await getDatabase();
  const collection = db.collection("truckers");
  const trucker = req.body;
  delete trucker._id;

  const result = await collection.updateOne(
    // @ts-ignore
    { _id: new ObjectId(req.params.id) },
    { $set: { truckId: new ObjectId(trucker.truckId) } }
  );
  console.log(result);
  res.send(result);
});

app.get("/trucks", async (req, res) => {
  const db = await getDatabase();
  const collection = db.collection("trucks");
  const trucks = await collection.find().toArray();
  res.send(trucks);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("get_truck_positions", async () => {
    const latestTruckPositions = await getLatestTruckPositions();
    console.log("sending truck positions to client: ", latestTruckPositions);
    io.emit("truck_positions", Object.values(latestTruckPositions));
  });

  socket.on(
    "update_truck_position",
    async ({
      truck,
      longitude,
      latitude,
    }: {
      truck: Truck;
      longitude: number;
      latitude: number;
    }) => {
      const db = await getDatabase();
      const collection = db.collection("truck_positions");
      console.log(truck, longitude, latitude);
      await collection.insertOne({
        truckId: new ObjectId(truck._id as string),
        lon: longitude,
        lat: latitude,
        timestamp: new Date(),
      });

      const latestTruckPositions = await getLatestTruckPositions();
      console.log("sending truck positions to client: ", latestTruckPositions);
      io.emit("truck_positions", Object.values(latestTruckPositions));
    }
  );

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} disconnected`);
  });
});

httpServer.listen(4000, async () => {
  await clearDatabase();
  startSimulation(5);

  console.log("listening on *:4000");
});
