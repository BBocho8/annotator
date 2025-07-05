export type ToolType = "line" | "arrow" | "circle" | "freehand" | "highlight" | "ellipse" | "eraser" | "select";

export type Annotation = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  tool: ToolType;
  color: string;
  thickness: number;
  points?: { x: number; y: number }[]; // for freehand
};