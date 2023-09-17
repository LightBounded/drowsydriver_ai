import { Video } from "./components/Video";
import { Selection } from "./components/Selection";
import { useAppState } from "./context/useAppState";

const App = () => {
  const { hasConfirmed } = useAppState();
  if (!hasConfirmed) {
    return <Selection />;
  }
  return <Video />;
};

export default App;
