import { test } from "node:test";
import assert from "node:assert/strict";
import { pointInRect } from "../src/lib/hit-test.js";

const rect = { left: 1107, top: 370, right: 1296, bottom: 550 };

test("a point inside the printer box is a hit", () => {
  assert.equal(pointInRect(1200, 450, rect), true);
  assert.equal(pointInRect(1107, 370, rect), true);
  assert.equal(pointInRect(1296, 550, rect), true);
});

test("points outside the box miss, and a missing box never hits", () => {
  assert.equal(pointInRect(1106, 450, rect), false);
  assert.equal(pointInRect(1200, 551, rect), false);
  assert.equal(pointInRect(1200, 450, null), false);
});
