import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { getDatabase } from "./db";
import { createTrucks, startSimulation } from "./helpers";

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

httpServer.listen(4000, async () => {
  console.log("listening on *:4000");
});
