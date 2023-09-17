export interface Trucker {
    _id?: string | null;
    truckId?: string | null;
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    phone: string;
}

export interface Truck {
    _id?: string | null;
    plateNumber: string;
}

export interface TruckPosition {
    _id?: string | null;
    truckId?: string | null;
    lon: number;
    lat: number;
    timestamp: Date;
}
