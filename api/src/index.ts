import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
