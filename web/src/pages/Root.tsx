import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";

export function Root() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 relative">
        <Outlet />
      </div>
    </>
  );
}
