import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { getDatabase } from "./db";
import { clearDatabase, startSimulation } from "./simulation";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer);

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
    const db = await getDatabase();
    const collection = db.collection("truck_positions");

    const truckPositions = await collection.find().toArray();
    io.emit("truck_positions", truckPositions);
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
