import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppStateProvider } from "./context/useAppState.tsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AppStateProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AppStateProvider>
  );
}
