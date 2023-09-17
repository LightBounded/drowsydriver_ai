import ReactDOM from "react-dom/client";
import {
  RouterProvider,
  Router,
  Route,
  RootRoute,
} from "@tanstack/react-router";
import { Index } from "./pages";
import { Root } from "./pages/Root";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Truckers } from "./pages/Truckers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootRoute = new RootRoute({
  component: Root,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

const truckersRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/truckers",
  component: Truckers,
});

const routeTree = rootRoute.addChildren([indexRoute, truckersRoute]);

const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
