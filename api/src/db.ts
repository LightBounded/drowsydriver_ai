import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.CONNECTION_STRING;
if (!connectionString) {
  throw new Error("Missing CONNECTION_STRING env var");
}

export const getDatabase = async () => {
  const client = new MongoClient(connectionString);
  const connection = await client.connect();
  const db = connection.db("drowsy_driver");
  return db;
};
