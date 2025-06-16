import { useState } from "react";
import GameInterface from "./components/GameInterface";

function App() {
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <GameInterface showGrid={showGrid} onToggleGrid={() => setShowGrid(!showGrid)} />
    </div>
  );
}

export default App;
