import type { ObjectId } from "mongodb";

export interface Trucker {
  _id?: ObjectId | string | null;
  truckId?: ObjectId | string | null;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
}

export interface Truck {
  _id?: ObjectId | string | null;
  plateNumber: string;
}

export interface TruckPosition {
  _id?: ObjectId | string | null;
  truckId?: ObjectId | string | null;
  lon: number;
  lat: number;
  timestamp: Date;
}
