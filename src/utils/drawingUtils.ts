import { Annotation } from "@/types/tool";

export function drawAllAnnotations(
  canvas: HTMLCanvasElement | null,
  annotations: Annotation[],
  selectedIndex?: number // 🆕 optional for highlighting
) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear the canvas before redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  annotations.forEach((anno, index) => {
    // 🆕 Highlight if selected
    if (index === selectedIndex) {
      ctx.strokeStyle = "#1E90FF"; // Dodger blue for selection
      ctx.lineWidth = anno.thickness + 2; // Slightly thicker border
      ctx.setLineDash([5, 5]); // Dashed line for selection
    } else {
      ctx.strokeStyle = anno.color;
      ctx.fillStyle = anno.color;
      ctx.lineWidth = anno.thickness;
      ctx.setLineDash([]); // Solid line
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (anno.tool) {
      case "circle": {
        const dx = anno.endX - anno.startX;
        const dy = anno.endY - anno.startY;
        const radius = Math.hypot(dx, dy);
        ctx.beginPath();
        ctx.arc(anno.startX, anno.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case "ellipse": {
        const dx = anno.endX - anno.startX;
        const dy = anno.endY - anno.startY;
        const centerX = anno.startX + dx / 2;
        const centerY = anno.startY + dy / 2;
        const radiusX = Math.abs(dx) / 2;
        const radiusY = Math.abs(dy) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case "arrow": {
        ctx.beginPath();
        ctx.moveTo(anno.startX, anno.startY);
        ctx.lineTo(anno.endX, anno.endY);
        ctx.stroke();

        const angle = Math.atan2(anno.endY - anno.startY, anno.endX - anno.startX);
        const headLength = 15 + anno.thickness;

        ctx.beginPath();
        ctx.moveTo(anno.endX, anno.endY);
        ctx.lineTo(
          anno.endX - headLength * Math.cos(angle - Math.PI / 6),
          anno.endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          anno.endX - headLength * Math.cos(angle + Math.PI / 6),
          anno.endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        break;
      }

      case "freehand": {
        if (anno.points && anno.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(anno.points[0].x, anno.points[0].y);
          anno.points.forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
        break;
      }

      case "highlight": {
        const width = anno.endX - anno.startX;
        const height = anno.endY - anno.startY;

        ctx.fillStyle = `${anno.color}55`; // semi-transparent
        ctx.strokeStyle = anno.color;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(anno.startX, anno.startY, width, height);
        ctx.fill();
        ctx.stroke();
        break;
      }

      default: {
        // Default to simple line
        ctx.beginPath();
        ctx.moveTo(anno.startX, anno.startY);
        ctx.lineTo(anno.endX, anno.endY);
        ctx.stroke();
        break;
      }
    }
  });
}
