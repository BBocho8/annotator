import { useState, useRef, useEffect } from "react";
import { ToolType } from "@/types/tool";
import ColorPicker from "./ColorPicker";
import ThicknessSlider from "./ThicknessSlider";
import "./../styles/toolbar.css";

type ToolbarProps = {
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  currentThickness: number;
  setCurrentThickness: (thickness: number) => void;
  drawMode: boolean;
  setDrawMode: (mode: boolean) => void;
  undo: () => void;
  clear: () => void;
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
};

export default function Toolbar({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  currentThickness,
  setCurrentThickness,
  drawMode,
  setDrawMode,
  undo,
  clear,
  menuVisible,
  setMenuVisible,
}: ToolbarProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 }); // 🖱️ Initial position
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const hasMoved = useRef(false); // ✅ Track movement to differentiate drag vs click

  /** Start dragging */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    isDragging.current = true;
    hasMoved.current = false; // Reset movement detection
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  /** Track dragging */
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Mark as moved if position changes
      if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
        hasMoved.current = true;
      }

      setPosition({ x: newX, y: newY });
    }
  };

  /** Stop dragging */
  const handleMouseUp = () => {
    isDragging.current = false;
  };

  /** Add/remove event listeners for dragging */
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /** FAB click handler */
  const handleFabClick = () => {
    if (!hasMoved.current) {
      setMenuVisible(true); // Only toggle if not dragged
    }
  };

  const handleNewVideo = () => {
    window.location.reload(); // Simply refresh page for prototype
  };

  const tools: { type: ToolType; label: string; icon: string }[] = [
    { type: "freehand", label: "Freehand", icon: "✏️" },
    { type: "line", label: "Line", icon: "📏" },
    { type: "ellipse", label: "Ellipse", icon: "🔵" },
    { type: "arrow", label: "Arrow", icon: "➡️" },
    { type: "highlight", label: "Highlight", icon: "🟨" },
    { type: "circle", label: "Circle", icon: "⚪" },
    { type: "eraser", label: "Eraser", icon: "🧽" },
  ];

  return (
    <>
      {menuVisible ? (
        <div
          className="toolbar"
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            zIndex: 50,
            cursor: isDragging.current ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
        >
          {/* 🖊️ Draw Mode Toggle */}
          <button
            onClick={() => setDrawMode(!drawMode)}
            className={`tool-btn tool-btn-large ${drawMode ? "active" : ""}`}
            title={drawMode ? "Disable Drawing" : "Enable Drawing"}
          >
            <span className="tool-icon-large">{drawMode ? "🖊️" : "🎥"}</span>
            <span className="tool-text-large">
              {drawMode ? "DRAWING ON" : "DRAWING OFF"}
            </span>
          </button>

          {/* 🎨 Tool Buttons */}
          <div className="tool-group">
            {tools.map((tool) => (
              <button
                key={tool.type}
                onClick={() => setCurrentTool(tool.type)}
                className={`tool-btn ${
                  currentTool === tool.type ? "active" : ""
                }`}
                title={tool.label}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-label-small">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* 🎨 Color Picker */}
          <div className="tool-section">
            <span className="tool-label">🎨 Color</span>
            <ColorPicker
              currentColor={currentColor}
              setCurrentColor={setCurrentColor}
            />
          </div>

          {/* 📏 Thickness Slider */}
          <div className="tool-section">
            <span className="tool-label">📏 Thickness</span>
            <ThicknessSlider
              currentThickness={currentThickness}
              setCurrentThickness={setCurrentThickness}
            />
          </div>

          {/* 🔄 Undo / Clear */}
          <div className="tool-group">
            <button onClick={undo} className="tool-btn" title="Undo">
              ↩️ Undo
            </button>
            <button onClick={clear} className="tool-btn" title="Clear All">
              🗑️ Clear
            </button>
          </div>

          {/* 🔄 New Video */}
          <button
            onClick={handleNewVideo}
            className="tool-btn tool-btn-refresh"
            title="Load a New Video"
          >
            🔄 New Video
          </button>

          {/* ❌ Hide Toolbar */}
          <button
            onClick={() => setMenuVisible(false)}
            className="tool-btn hide-btn"
            title="Hide Toolbar"
          >
            Hide
          </button>
        </div>
      ) : (
        <div
          className="show-toolbar-fab"
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            cursor: isDragging.current ? "grabbing" : "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={handleMouseDown}
          onClick={handleFabClick}
          title="Show Dock"
        >
          🛠️
        </div>
      )}
    </>
  );
}
