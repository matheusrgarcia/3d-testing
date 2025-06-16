import { useCallback, useState } from "react";
import Game from "./Game";

interface GameInterfaceProps {
  showGrid: boolean;
  onToggleGrid: () => void;
}

const GameInterface = ({ showGrid, onToggleGrid }: GameInterfaceProps) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = useCallback(() => {
    if (isToggling) return;
    
    setIsToggling(true);
    onToggleGrid();
    
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  }, [isToggling, onToggleGrid]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Game showGrid={showGrid} />
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={handleToggle}
          disabled={isToggling}
          style={{
            padding: "10px 20px",
            backgroundColor: showGrid ? "#4CAF50" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isToggling ? "not-allowed" : "pointer",
            fontSize: "14px",
            userSelect: "none",
            touchAction: "manipulation",
            opacity: isToggling ? 0.7 : 1,
          }}
        >
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
      </div>
    </div>
  );
};

export default GameInterface; 