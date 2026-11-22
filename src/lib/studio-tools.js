// The four studio implements share one physical size scale. The canvas is
// 720 internal pixels wide, so every width here can be converted to the
// on-screen width the player actually sees by multiplying by the display
// scale. That is what makes the size previews true to scale.

export const CANVAS_W = 720;
export const CANVAS_H = 960;

export const BRUSH_SIZES = [8, 20, 44, 96];

export const STUDIO_TOOLS = [
  { id: "brush", label: "Paintbrush" },
  { id: "fine", label: "Fine brush" },
  { id: "spray", label: "Airbrush" },
  { id: "roller", label: "Paint roller" },
];

export const FALLBACK_CANVAS_WIDTH = 430;

// Settings for the pressure-simulated brush outline (perfect-freehand).
export const BRUSH_OPTIONS = {
  thinning: 0.75,
  smoothing: 0.5,
  streamline: 0.5,
  simulatePressure: true,
  easing: (t) => t,
  start: { cap: true, taper: 0 },
  endTaper: 12,
};

// A roller's cover touches the surface in a short, fixed-height patch; the
// size control chooses the length of the roller (the width of that patch).
export const ROLLER_HEIGHT = 22;

// Ignore sub-pixel pointer noise. Without this, a slow drag can add many
// near-duplicate head points whose tangents flip between samples.
export const ROLLER_MIN_STEP = 0.5;

/** The roller head trails the pointer: the handle sits between the two. */
export function rollerHandleOffset(size) {
  return Math.max(10, strokeWidth("roller", size) * 0.35);
}

function unitVector({ x, y }) {
  const length = Math.hypot(x, y);
  if (length < 0.0001) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

/** Where the roller head sits for a pointer position and handle direction. */
export function rollerHead(pointer, direction, handleOffset) {
  const unit = unitVector(direction);
  return {
    x: pointer.x - unit.x * handleOffset,
    y: pointer.y - unit.y * handleOffset,
  };
}

/**
 * Rotate the trailing handle towards the pointer's motion. The blend depends
 * on distance travelled, not on how many pointer events arrived, so moving
 * slowly produces the same path as moving quickly.
 */
export function advanceRollerDirection(current, delta, handleOffset) {
  const distance = Math.hypot(delta.x, delta.y);
  if (distance < ROLLER_MIN_STEP) return current;

  const target = unitVector(delta);
  const smoothingDistance = Math.max(handleOffset, ROLLER_MIN_STEP);
  const blend = 1 - Math.exp(-distance / smoothingDistance);
  return unitVector({
    x: current.x * (1 - blend) + target.x * blend,
    y: current.y * (1 - blend) + target.y * blend,
  });
}

/** Width an implement lays down, in internal canvas pixels. */
export function strokeWidth(tool, size) {
  // The fine brush keeps its old, careful widths; the other implements use the
  // full (now larger) size scale so a whole canvas does not take forever.
  if (tool === "fine") return Math.max(1.5, size * 0.15);
  if (tool === "roller") return size * 1.15;
  if (tool === "spray") return size * 1.3;
  return size;
}

/** On-screen diameter of that stroke, for the size previews. */
export function previewWidth(tool, size, displayWidth = FALLBACK_CANVAS_WIDTH) {
  return strokeWidth(tool, size) * (displayWidth / CANVAS_W);
}

/** Convert a 0-100 transparency percentage into a canvas alpha value. */
export function opacityFromTransparency(transparency) {
  const percent = Math.min(100, Math.max(0, Number(transparency) || 0));
  return 1 - percent / 100;
}
