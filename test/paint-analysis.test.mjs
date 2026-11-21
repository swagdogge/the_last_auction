import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeCanvas, coveragePhrase } from "../src/lib/paint-analysis.js";

// analyzeCanvas samples every painting down to this grid before measuring it.
const WIDTH = 120;
const HEIGHT = 160;
const PAPER = [247, 242, 230];

function imageData(colorAt) {
  const data = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  for (let index = 0; index < WIDTH * HEIGHT; index += 1) {
    const [r, g, b] = colorAt(index % WIDTH, Math.floor(index / WIDTH));
    data.set([r, g, b, 255], index * 4);
  }
  return { data };
}

function analyze(colorAt) {
  const previous = globalThis.document;
  globalThis.document = {
    createElement: () => ({
      getContext: () => ({ drawImage() {}, getImageData: () => imageData(colorAt) }),
    }),
  };
  try {
    return analyzeCanvas({});
  } finally {
    globalThis.document = previous;
  }
}

test("coveragePhrase covers the whole range in order", () => {
  [
    [0, "an untouched sheet"],
    [0.011, "an untouched sheet"],
    [0.02, "almost nothing"],
    [0.1, "a few marks"],
    [0.3, "a scattering of marks"],
    [0.6, "a busy field"],
    [0.9, "the whole surface"],
  ].forEach(([coverage, phrase]) => assert.equal(coveragePhrase(coverage), phrase));
});

test("a blank sheet reads as empty and perfectly symmetric", () => {
  const stats = analyze(() => PAPER);
  assert.equal(stats.coverage, 0);
  assert.equal(stats.empty, true);
  assert.equal(stats.symmetry, 1);
  assert.equal(stats.edge, 0);
  assert.equal(stats.color, "chalk white");
});

test("painting half the canvas reports half coverage and warm colour", () => {
  const stats = analyze((x) => (x < WIDTH / 2 ? [220, 30, 20] : PAPER));
  assert.ok(Math.abs(stats.coverage - 0.5) < 0.01);
  assert.equal(stats.empty, false);
  assert.equal(stats.warm, 1);
  assert.equal(stats.green, 0);
  assert.equal(stats.color, "crimson");
  assert.ok(stats.symmetry < 0.05);
});

test("a black canvas is fully covered and reads as black", () => {
  const stats = analyze(() => [0, 0, 0]);
  assert.equal(stats.coverage, 1);
  assert.equal(stats.color, "black");
  assert.equal(stats.saturation, 0);
});
