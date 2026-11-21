import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { analyzeCanvas } from "@/lib/paint-analysis";

export const CANVAS_W = 720;
export const CANVAS_H = 960;
export const PAPER = "#f7f2e6";

function hexToRgb(hex) {
  const v = hex.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function floodFill(ctx, startX, startY, color) {
  const w = CANVAS_W;
  const h = CANVAS_H;
  if (startX < 0 || startY < 0 || startX >= w || startY >= h) return;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const si = (startY * w + startX) * 4;
  const tr = d[si];
  const tg = d[si + 1];
  const tb = d[si + 2];
  const ta = d[si + 3];
  const [fr, fg, fb] = hexToRgb(color);
  if (Math.abs(tr - fr) < 6 && Math.abs(tg - fg) < 6 && Math.abs(tb - fb) < 6) return;

  const tol = 40;
  const match = (i) =>
    Math.abs(d[i] - tr) <= tol &&
    Math.abs(d[i + 1] - tg) <= tol &&
    Math.abs(d[i + 2] - tb) <= tol &&
    Math.abs(d[i + 3] - ta) <= tol;

  const stack = [[startX, startY]];
  while (stack.length) {
    const [x, y] = stack.pop();
    let x1 = x;
    while (x1 >= 0 && match((y * w + x1) * 4)) x1--;
    x1++;
    let spanUp = false;
    let spanDown = false;
    while (x1 < w && match((y * w + x1) * 4)) {
      const i = (y * w + x1) * 4;
      d[i] = fr;
      d[i + 1] = fg;
      d[i + 2] = fb;
      d[i + 3] = 255;
      if (y > 0) {
        if (match(((y - 1) * w + x1) * 4)) {
          if (!spanUp) {
            stack.push([x1, y - 1]);
            spanUp = true;
          }
        } else spanUp = false;
      }
      if (y < h - 1) {
        if (match(((y + 1) * w + x1) * 4)) {
          if (!spanDown) {
            stack.push([x1, y + 1]);
            spanDown = true;
          }
        } else spanDown = false;
      }
      x1++;
    }
  }
  ctx.putImageData(img, 0, 0);
}

const PaintCanvas = forwardRef(function PaintCanvas({ color, size, tool }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const history = useRef([]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const pushHistory = () => {
    history.current.push(canvasRef.current.toDataURL());
    if (history.current.length > 12) history.current.shift();
  };

  const pointOf = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const stroke = (from, to) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (from) {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    } else {
      ctx.arc(to.x, to.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.stroke();
  };

  const handleDown = (e) => {
    e.preventDefault();
    const p = pointOf(e);
    pushHistory();
    if (tool === "fill") {
      floodFill(canvasRef.current.getContext("2d"), Math.floor(p.x), Math.floor(p.y), color);
      return;
    }
    drawing.current = true;
    lastPoint.current = p;
    stroke(null, p);
  };

  const handleMove = (e) => {
    if (!drawing.current || tool !== "brush") return;
    const p = pointOf(e);
    stroke(lastPoint.current, p);
    lastPoint.current = p;
  };

  const handleUp = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  useImperativeHandle(ref, () => ({
    undo() {
      const url = history.current.pop();
      if (!url) return;
      const img = new window.Image();
      img.onload = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.drawImage(img, 0, 0);
      };
      img.src = url;
    },
    clear() {
      pushHistory();
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    },
    toDataURL() {
      return canvasRef.current.toDataURL("image/png");
    },
    analyze() {
      return analyzeCanvas(canvasRef.current);
    },
    toBlob(callback) {
      return canvasRef.current.toBlob(callback, "image/png");
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
      onPointerCancel={handleUp}
      className="block h-auto w-full cursor-crosshair touch-none select-none bg-[#f7f2e6]"
    />
  );
});

export default PaintCanvas;