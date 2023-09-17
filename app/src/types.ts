export interface Trucker {
  truckId?: string | null;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
}

export interface Truck {
  truckId?: string | null;
  plateNumber: string;
}

export interface TruckPosition {
  truckId?: string | null;
  lon: number;
  lat: number;
  timestamp: Date;
}
