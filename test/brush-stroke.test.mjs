import { test } from "node:test";
import assert from "node:assert/strict";
import { getStroke } from "perfect-freehand";
import {
  advanceRollerDirection,
  BRUSH_SIZES,
  BRUSH_OPTIONS,
  ROLLER_HEIGHT,
  ROLLER_MIN_STEP,
  rollerHandleOffset,
  rollerHead,
  strokeWidth,
} from "../src/lib/studio-tools.js";

function outlineHeight(points) {
  const outline = getStroke(points, { ...BRUSH_OPTIONS, size: 96, last: true });
  const ys = outline.map((point) => point[1]);
  return Math.max(...ys) - Math.min(...ys);
}

test("a fast brush stroke is thinner than a slow one", () => {
  const slow = Array.from({ length: 30 }, (_, i) => [i * 3, 100]);
  const fast = Array.from({ length: 5 }, (_, i) => [i * 40, 100]);

  assert.ok(outlineHeight(fast) < outlineHeight(slow) * 0.85);
});

test("brush settings simulate pressure instead of using raw pointer pressure", () => {
  assert.equal(BRUSH_OPTIONS.simulatePressure, true);
  assert.equal(BRUSH_OPTIONS.thinning, 0.75);
  assert.equal(BRUSH_OPTIONS.start.taper, 0);
});

test("the roller's size changes its width but never its contact height", () => {
  assert.equal(ROLLER_HEIGHT, 22);
  const widths = BRUSH_SIZES.map((size) => strokeWidth("roller", size));
  assert.deepEqual([...widths].sort((a, b) => a - b), widths);
  assert.ok(widths[0] < widths[widths.length - 1]);
});

test("the roller head trails the pointer by a handle offset", () => {
  const offsets = BRUSH_SIZES.map((size) => rollerHandleOffset(size));
  assert.ok(offsets.every((offset) => offset > 0));
  assert.deepEqual([...offsets].sort((a, b) => a - b), offsets);

  const offset = rollerHandleOffset(44);
  const head = rollerHead({ x: 100, y: 100 }, { x: 0, y: 1 }, offset);
  assert.equal(head.x, 100);
  assert.equal(head.y, 100 - offset);
});

test("sub-pixel pointer noise does not rotate the roller handle", () => {
  const direction = { x: 0, y: 1 };
  assert.equal(
    advanceRollerDirection(direction, { x: 0.1, y: 0 }, rollerHandleOffset(44)),
    direction,
  );
});

test("slow movement does not make the roller head jump around", () => {
  const handleOffset = rollerHandleOffset(96);
  let direction = { x: 0, y: 1 };
  let pointer = { x: 200, y: 200 };
  let head = rollerHead(pointer, direction, handleOffset);
  let largestHeadStep = 0;

  for (let i = 0; i < 80; i++) {
    const delta = { x: ROLLER_MIN_STEP, y: 0 };
    pointer = { x: pointer.x + delta.x, y: pointer.y + delta.y };
    direction = advanceRollerDirection(direction, delta, handleOffset);
    const nextHead = rollerHead(pointer, direction, handleOffset);
    largestHeadStep = Math.max(
      largestHeadStep,
      Math.hypot(nextHead.x - head.x, nextHead.y - head.y),
    );
    head = nextHead;
  }

  assert.ok(
    largestHeadStep <= ROLLER_MIN_STEP * 2,
    `roller head jumped ${largestHeadStep}px for a ${ROLLER_MIN_STEP}px pointer step`,
  );
});
