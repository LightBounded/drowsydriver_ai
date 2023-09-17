import type { ObjectId } from "mongodb";

export interface Trucker {
  _id?: ObjectId | string | null;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
  truckId?: ObjectId | string | null;
}

export interface Truck {
  _id?: ObjectId | string | null;
  plateNumber: string;
}

export interface TruckPosition {
  _id?: ObjectId | string | null;
  truckId: ObjectId;
  lon: number;
  lat: number;
  timestamp: Date;
}
