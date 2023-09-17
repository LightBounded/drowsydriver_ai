"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.CONNECTION_STRING;
if (!connectionString) {
    throw new Error("Missing CONNECTION_STRING env var");
}
const getDatabase = async () => {
    const client = new mongodb_1.MongoClient(connectionString);
    const connection = await client.connect();
    const db = connection.db("drowsy_driver");
    return db;
};
exports.getDatabase = getDatabase;
