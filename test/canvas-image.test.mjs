import { test } from "node:test";
import assert from "node:assert/strict";
import { coverRect } from "../src/lib/canvas-image.js";

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9);

test("a wide image is centred and cropped at the sides", () => {
  const rect = coverRect(400, 100, 720, 960);
  near(rect.width, 3840);
  near(rect.height, 960);
  near(rect.x, -1560);
  near(rect.y, 0);
});

test("a tall image is centred and cropped at the top and bottom", () => {
  const rect = coverRect(100, 400, 720, 960);
  near(rect.width, 720);
  near(rect.height, 2880);
  near(rect.x, 0);
  near(rect.y, -960);
});

test("a matching aspect fills the canvas without cropping", () => {
  const rect = coverRect(720, 960, 720, 960);
  near(rect.x, 0);
  near(rect.y, 0);
  near(rect.width, 720);
  near(rect.height, 960);
});
