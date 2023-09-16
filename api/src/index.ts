import express from "express";
import cors from "cors";
import { getDatabase } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(4000, () => {});
