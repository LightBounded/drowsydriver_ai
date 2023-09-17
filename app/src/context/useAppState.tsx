import { createContext, useContext, useState } from "react";
import { Truck, Trucker } from "../types";

interface AppStateContextValues {
  truck: Truck | null;
  setTruck: (truck: Truck | null) => void;
  trucker: Trucker | null;
  setTrucker: (trucker: Trucker | null) => void;
  hasConfirmed: boolean;
  setHasConfirmed: (hasConfirmed: boolean) => void;
}

const AppStateContext = createContext<AppStateContextValues | undefined>(
  undefined
);

export function useAppState() {
  if (!AppStateContext) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return useContext(AppStateContext)!;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [truck, setTruck] = useState<Truck | null>(null);
  const [trucker, setTrucker] = useState<Trucker | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  return (
    <AppStateContext.Provider
      value={{
        truck,
        setTruck,
        trucker,
        setTrucker,
        hasConfirmed,
        setHasConfirmed,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
