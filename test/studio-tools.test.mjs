import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BRUSH_SIZES,
  CANVAS_W,
  opacityFromTransparency,
  STUDIO_TOOLS,
  previewWidth,
  strokeWidth,
} from "../src/lib/studio-tools.js";

test("the studio has four implements and four shared sizes", () => {
  assert.deepEqual(
    STUDIO_TOOLS.map((tool) => tool.id),
    ["brush", "fine", "spray", "roller"],
  );
  assert.equal(BRUSH_SIZES.length, 4);
  assert.deepEqual([...BRUSH_SIZES].sort((a, b) => a - b), BRUSH_SIZES);
});

test("the fine brush keeps its old thin widths while the other tools grow", () => {
  assert.deepEqual(BRUSH_SIZES, [8, 20, 44, 96]);
  const fineWidths = BRUSH_SIZES.map((size) => strokeWidth("fine", size));
  [1.5, 3, 6.6, 14.4].forEach((expected, i) => {
    assert.ok(Math.abs(fineWidths[i] - expected) < 1e-9);
  });
  for (const size of BRUSH_SIZES) {
    assert.ok(strokeWidth("fine", size) < size);
    assert.ok(strokeWidth("roller", size) > size);
    assert.ok(strokeWidth("spray", size) > size);
    assert.equal(strokeWidth("brush", size), size);
  }
});

test("size previews scale to the canvas's displayed width", () => {
  assert.equal(previewWidth("brush", CANVAS_W, CANVAS_W), CANVAS_W);
  assert.equal(previewWidth("brush", 96, 360), 48);
  assert.ok(Math.abs(previewWidth("roller", 96, 360) - 55.2) < 1e-9);
  assert.ok(Math.abs(previewWidth("spray", 96, 360) - 62.4) < 1e-9);
});

test("transparency maps to canvas alpha and clamps to 0-100", () => {
  assert.equal(opacityFromTransparency(0), 1);
  assert.equal(opacityFromTransparency(50), 0.5);
  assert.equal(opacityFromTransparency(100), 0);
  assert.equal(opacityFromTransparency(-20), 1);
  assert.equal(opacityFromTransparency(180), 0);
});
