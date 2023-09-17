import type { ObjectId } from "mongodb";

export interface Trucker {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
  truckId: ObjectId;
}

export interface Truck {
  _id: ObjectId;
  plateNumber: string;
}

export interface TruckPosition {
  _id: ObjectId;
  truckId: ObjectId;
  lon: number;
  lat: number;
  timestamp: Date;
}
