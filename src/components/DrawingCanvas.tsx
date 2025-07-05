import { useRef, useEffect, useCallback } from "react";
import { drawAllAnnotations } from "../utils/drawingUtils";
import { Annotation, ToolType } from "@/types/tool";

type DrawingCanvasProps = {
  annotations: Annotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  currentTool: ToolType;
  currentColor: string;
  currentThickness: number;
  drawMode: boolean;
};

export default function DrawingCanvas({
  annotations,
  setAnnotations,
  currentTool,
  currentColor,
  currentThickness,
  drawMode,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const isDrawing = useRef(false);

  /** 🖌 Resize canvas to container size */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawAllAnnotations(canvas, annotations);
    }
  }, [annotations]);

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Initial resize
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  /** 🎯 Mouse down: start drawing */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    startPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    isDrawing.current = true;

    if (currentTool === "freehand") {
      const { x, y } = startPoint.current;
      setAnnotations((prev) => [
        ...prev,
        {
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          tool: "freehand",
          color: currentColor,
          thickness: currentThickness,
          points: [{ x, y }],
        },
      ]);
    }
  };

  /** ✍️ Mouse move: draw live preview */
const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
  if (!canvasRef.current || !startPoint.current) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  const { x: startX, y: startY } = startPoint.current;

  if (currentTool === "eraser" && drawMode) {
    // 🧽 Erase annotations under the cursor
    setAnnotations((prev) =>
      prev.filter((anno) => {
        if (anno.tool === "freehand" && anno.points) {
          return !anno.points.some(
            (p) => Math.hypot(p.x - currentX, p.y - currentY) < currentThickness * 2
          );
        } else {
          return !(
            currentX >= Math.min(anno.startX, anno.endX) &&
            currentX <= Math.max(anno.startX, anno.endX) &&
            currentY >= Math.min(anno.startY, anno.endY) &&
            currentY <= Math.max(anno.startY, anno.endY)
          );
        }
      })
    );

    // Redraw after erasing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAllAnnotations(canvas, annotations);
    return; // 👈 Prevent any drawing
  }

  if (!isDrawing.current) return;

  // 🎨 Clear canvas & redraw existing annotations
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAllAnnotations(canvas, annotations);

  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentThickness;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (currentTool) {
    case "circle": {
      const radius = Math.max(
        Math.hypot(currentX - startX, currentY - startY),
        1
      );
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case "ellipse": {
      const centerX = (startX + currentX) / 2;
      const centerY = (startY + currentY) / 2;
      const radiusX = Math.abs(currentX - startX) / 2;
      const radiusY = Math.abs(currentY - startY) / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case "highlight": {
      const width = currentX - startX;
      const height = currentY - startY;
      ctx.fillStyle = `${currentColor}55`; // Semi-transparent
      ctx.beginPath();
      ctx.rect(startX, startY, width, height);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case "line": {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      break;
    }

    case "arrow": {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      const angle = Math.atan2(currentY - startY, currentX - startX);
      const headLength = 10 + currentThickness;
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(
        currentX - headLength * Math.cos(angle - Math.PI / 6),
        currentY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        currentX - headLength * Math.cos(angle + Math.PI / 6),
        currentY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = currentColor;
      ctx.fill();
      break;
    }

    case "freehand": {
      setAnnotations((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.points) last.points.push({ x: currentX, y: currentY });
        return updated;
      });
      break;
    }

    default:
      break;
  }
};



  /** ✅ Mouse up: finalize annotation */
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current || !startPoint.current) return;

  if (currentTool === "eraser") {
    isDrawing.current = false;
    startPoint.current = null;
    return;
  }

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const { x: startX, y: startY } = startPoint.current;

    if (currentTool !== "freehand") {
      setAnnotations((prev) => [
        ...prev,
        {
          startX,
          startY,
          endX,
          endY,
          tool: currentTool,
          color: currentColor,
          thickness: currentThickness,
        },
      ]);
    }

    isDrawing.current = false;
    startPoint.current = null;
  };

  /** 🔄 Redraw when annotations change */
  useEffect(() => {
    resizeCanvas();
  }, [annotations, resizeCanvas]);

  return (
    <div
      ref={containerRef}
      className={`absolute top-0 left-0 w-full h-full ${
        drawMode ? "" : "pointer-events-none"
      }`}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}