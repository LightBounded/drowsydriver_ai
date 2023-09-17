import { io } from "socket.io-client";

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const socket = io(import.meta.env.VITE_API_URL);
