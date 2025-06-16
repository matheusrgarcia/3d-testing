import { useState } from "react";
import Game from "./Game";

const GameInterface = () => {
  const [showGrid, setShowGrid] = useState(true);

  const handleDebugToggle = (show: boolean) => {
    setShowGrid(show);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Game onDebugToggle={handleDebugToggle} />
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => handleDebugToggle(!showGrid)}
          style={{
            padding: "10px 20px",
            backgroundColor: showGrid ? "#4CAF50" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
      </div>
    </div>
  );
};

export default GameInterface; 