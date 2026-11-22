import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { getStroke } from "perfect-freehand";
import { analyzeCanvas } from "@/lib/paint-analysis";
import {
  advanceRollerDirection,
  BRUSH_OPTIONS,
  CANVAS_H,
  CANVAS_W,
  ROLLER_HEIGHT,
  ROLLER_MIN_STEP,
  rollerHandleOffset,
  rollerHead,
  strokeWidth,
} from "@/lib/studio-tools";

export { CANVAS_W, CANVAS_H } from "@/lib/studio-tools";

export const PAPER = "#f7f2e6";

const average = (a, b) => (a + b) / 2;

// Turn a brush outline into a rounded, closed canvas path.
function getSvgPathFromStroke(points, closed = true) {
  const len = points.length;
  if (len < 4) return "";

  let a = points[0];
  let b = points[1];
  const c = points[2];
  let path = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    path += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
  }
  if (closed) path += "Z";
  return path;
}

function hexToRgb(hex) {
  const v = hex.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function floodFill(ctx, startX, startY, color, opacity) {
  const w = CANVAS_W;
  const h = CANVAS_H;
  if (startX < 0 || startY < 0 || startX >= w || startY >= h) return;
  if (opacity <= 0) return;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const si = (startY * w + startX) * 4;
  const tr = d[si];
  const tg = d[si + 1];
  const tb = d[si + 2];
  const ta = d[si + 3];
  const [fr, fg, fb] = hexToRgb(color);
  if (Math.abs(tr - fr) < 6 && Math.abs(tg - fg) < 6 && Math.abs(tb - fb) < 6) return;

  const mix = (from, to) => Math.round(from + (to - from) * opacity);

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
      d[i] = mix(d[i], fr);
      d[i + 1] = mix(d[i + 1], fg);
      d[i + 2] = mix(d[i + 2], fb);
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

const PaintCanvas = forwardRef(function PaintCanvas(
  { color, size, tool, opacity = 1, onDisplayWidth },
  ref,
) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const activeStroke = useRef(null);
  const rollerStroke = useRef(null);
  const rollerDirection = useRef({ x: 0, y: 1 });
  const snapshot = useRef(null);
  const history = useRef([]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onDisplayWidth) return;
    const report = () => onDisplayWidth(canvas.getBoundingClientRect().width);
    report();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(report);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [onDisplayWidth]);

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

  // Rebuild the whole brush stroke over the canvas as it was before the
  // pointer went down. Rebuilding the spline on every sample keeps it seamless.
  const renderOutline = (last = false) => {
    const { points, base, options } = activeStroke.current;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;
    ctx.drawImage(snapshot.current, 0, 0);

    const outline = getStroke(points, {
      ...options,
      size: base,
      last,
      end: { cap: true, taper: last ? options.endTaper : 0, easing: (t) => t },
    });
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    const path = getSvgPathFromStroke(outline);
    if (path) {
      ctx.fill(new Path2D(path));
    } else {
      ctx.beginPath();
      ctx.arc(points[0][0], points[0][1], base / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const prepareSnapshot = () => {
    if (!snapshot.current) {
      snapshot.current = document.createElement("canvas");
      snapshot.current.width = CANVAS_W;
      snapshot.current.height = CANVAS_H;
    }
    const snapCtx = snapshot.current.getContext("2d");
    snapCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    snapCtx.drawImage(canvasRef.current, 0, 0);
  };

  const startOutline = (p, base, options) => {
    prepareSnapshot();
    activeStroke.current = { points: [[p.x, p.y]], base, options };
    renderOutline(false);
  };

  const extendOutline = (p) => {
    activeStroke.current.points.push([p.x, p.y]);
    renderOutline(false);
  };

  // A roller mark is a fixed-width band swept along the head's trail. Letting
  // the canvas stroke that path gives continuous joins; extending each end by
  // half the contact height gives the flat rectangular press mark.
  const renderRoller = () => {
    const { points, width } = rollerStroke.current;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;
    ctx.drawImage(snapshot.current, 0, 0);

    // Look outwards until two distinct points are found. A single stalled
    // pointer sample must not decide the direction of the roller's end cap.
    const directionAt = (index) => {
      for (let radius = 1; radius < points.length; radius++) {
        const previous = points[Math.max(0, index - radius)];
        const next = points[Math.min(points.length - 1, index + radius)];
        const dx = next.x - previous.x;
        const dy = next.y - previous.y;
        if (Math.hypot(dx, dy) > 0.001) {
          const length = Math.hypot(dx, dy);
          return { x: dx / length, y: dy / length };
        }
      }
      return rollerDirection.current;
    };

    const first = points[0];
    const last = points[points.length - 1];
    const firstDirection = directionAt(0);
    const halfHeight = ROLLER_HEIGHT / 2;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(
      first.x - firstDirection.x * halfHeight,
      first.y - firstDirection.y * halfHeight,
    );
    if (points.length === 1) {
      const end = {
        x: first.x + firstDirection.x * halfHeight,
        y: first.y + firstDirection.y * halfHeight,
      };
      ctx.lineTo(end.x, end.y);
    } else {
      ctx.lineTo(first.x, first.y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      const lastDirection = directionAt(points.length - 1);
      ctx.lineTo(
        last.x + lastDirection.x * halfHeight,
        last.y + lastDirection.y * halfHeight,
      );
    }
    ctx.stroke();
    ctx.restore();
  };

  const startRoller = (p, size) => {
    prepareSnapshot();
    rollerDirection.current = { x: 0, y: 1 };
    const offset = rollerHandleOffset(size);
    rollerStroke.current = {
      points: [rollerHead(p, rollerDirection.current, offset)],
      width: strokeWidth("roller", size),
      offset,
    };
    renderRoller();
  };

  const extendRoller = (p) => {
    const from = lastPoint.current || p;
    const delta = { x: p.x - from.x, y: p.y - from.y };
    if (Math.hypot(delta.x, delta.y) < ROLLER_MIN_STEP) return false;

    rollerDirection.current = advanceRollerDirection(
      rollerDirection.current,
      delta,
      rollerStroke.current.offset,
    );
    rollerStroke.current.points.push(
      rollerHead(p, rollerDirection.current, rollerStroke.current.offset),
    );
    renderRoller();
    return true;
  };

  const stroke = (from, to, width) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (from) {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else {
      ctx.arc(to.x, to.y, width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const spray = (from, to) => {
    const ctx = canvasRef.current.getContext("2d");
    const radius = Math.max(2, strokeWidth("spray", size) / 2);
    const dx = from ? to.x - from.x : 0;
    const dy = from ? to.y - from.y : 0;
    const steps = from ? Math.max(1, Math.ceil(Math.hypot(dx, dy) / (radius * 0.6))) : 1;
    const dots = Math.max(6, Math.round(radius * 1.6));

    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2 * opacity;
    for (let step = 0; step < steps; step++) {
      const cx = from ? from.x + (dx * step) / steps : to.x;
      const cy = from ? from.y + (dy * step) / steps : to.y;
      for (let dot = 0; dot < dots; dot++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * radius;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(angle) * distance,
          cy + Math.sin(angle) * distance,
          0.8 + Math.random() * 0.7,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const paintSegment = (from, to) => {
    if (tool === "brush") return extendOutline(to);
    if (tool === "spray") return spray(from, to);
    stroke(from, to, strokeWidth("fine", size));
  };

  const handleDown = (e) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is a nicety, not a requirement for drawing.
    }
    const p = pointOf(e);
    pushHistory();
    if (tool === "fill") {
      floodFill(
        canvasRef.current.getContext("2d"),
        Math.floor(p.x),
        Math.floor(p.y),
        color,
        opacity,
      );
      return;
    }
    drawing.current = true;
    lastPoint.current = p;
    if (tool === "brush") {
      startOutline(p, strokeWidth("brush", size), BRUSH_OPTIONS);
    } else if (tool === "roller") {
      startRoller(p, size);
    } else {
      paintSegment(null, p);
    }
  };

  const handleMove = (e) => {
    if (!drawing.current) return;
    const p = pointOf(e);
    if (tool === "roller") {
      // Only accept a sample once the pointer has moved far enough. This
      // keeps slow dragging from piling up near-duplicate head points.
      if (extendRoller(p)) lastPoint.current = p;
      return;
    }
    paintSegment(lastPoint.current, p);
    lastPoint.current = p;
  };

  const handleUp = (e) => {
    drawing.current = false;
    if (tool === "brush" && activeStroke.current) {
      renderOutline(true);
      activeStroke.current = null;
    }
    if (tool === "roller") rollerStroke.current = null;
    lastPoint.current = null;
    if (e?.currentTarget?.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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
