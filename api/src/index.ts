import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { getDatabase } from "./db";
import { clearDatabase, startSimulation } from "./simulation";
import { TruckPosition } from "./types";
import { getLatestTruckPositions } from "./utils";

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

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("get_truck_positions", async () => {
    const latestTruckPositions = await getLatestTruckPositions();
    console.log("sending truck positions to client: ", latestTruckPositions);
    io.emit("truck_positions", Object.values(latestTruckPositions));
  });

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} disconnected`);
  });
});

httpServer.listen(4000, async () => {
  await clearDatabase();
  startSimulation(5);

  console.log("listening on *:4000");
});
