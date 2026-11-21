const PAPER = [247, 242, 230];
const SAMPLE_W = 120;
const SAMPLE_H = 160;
const HUE_NAMES = [
  "crimson",
  "rust",
  "amber",
  "gold",
  "olive",
  "moss green",
  "forest green",
  "teal",
  "deep blue",
  "indigo",
  "violet",
  "plum",
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Reads the painting itself: how much is painted, in what colours, how dense, how tidy. */
export function analyzeCanvas(canvas) {
  const off = document.createElement("canvas");
  off.width = SAMPLE_W;
  off.height = SAMPLE_H;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(canvas, 0, 0, SAMPLE_W, SAMPLE_H);
  const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
  const total = SAMPLE_W * SAMPLE_H;

  const lum = new Float32Array(total);
  const painted = new Uint8Array(total);
  const hues = new Array(12).fill(0);
  let paintedCount = 0;
  let warm = 0;
  let cool = 0;
  let green = 0;
  let satSum = 0;
  let lightSum = 0;
  let dark = 0;
  let pale = 0;

  for (let i = 0; i < total; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    lum[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const dist =
      Math.abs(r - PAPER[0]) + Math.abs(g - PAPER[1]) + Math.abs(b - PAPER[2]);
    if (dist < 60) continue;

    painted[i] = 1;
    paintedCount += 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2 / 255;
    const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    lightSum += l;
    satSum += s;

    if (s < 0.16) {
      if (l < 0.35) dark += 1;
      else pale += 1;
      continue;
    }

    let h;
    if (max === r) h = 60 * (((g - b) / (max - min)) % 6);
    else if (max === g) h = 60 * ((b - r) / (max - min) + 2);
    else h = 60 * ((r - g) / (max - min) + 4);
    if (h < 0) h += 360;

    hues[Math.floor(h / 30) % 12] += 1;
    if (h < 50 || h >= 330) warm += 1;
    else if (h >= 170 && h < 265) cool += 1;
    else if (h >= 65 && h < 170) green += 1;
  }

  const coverage = paintedCount / total;

  let edge = 0;
  for (let y = 0; y < SAMPLE_H - 1; y++) {
    for (let x = 0; x < SAMPLE_W - 1; x++) {
      const i = y * SAMPLE_W + x;
      edge += Math.abs(lum[i] - lum[i + 1]) + Math.abs(lum[i] - lum[i + SAMPLE_W]);
    }
  }
  const edgeDensity = clamp01(edge / (total * 0.24));

  let matched = 0;
  for (let y = 0; y < SAMPLE_H; y++) {
    for (let x = 0; x < SAMPLE_W / 2; x++) {
      if (painted[y * SAMPLE_W + x] === painted[y * SAMPLE_W + (SAMPLE_W - 1 - x)]) {
        matched += 1;
      }
    }
  }
  const symmetry = matched / ((SAMPLE_W / 2) * SAMPLE_H);

  const rows = new Array(SAMPLE_H).fill(0);
  for (let y = 0; y < SAMPLE_H; y++) {
    let count = 0;
    for (let x = 0; x < SAMPLE_W; x++) count += painted[y * SAMPLE_W + x];
    rows[y] = count / SAMPLE_W;
  }
  let banding = 0;
  for (let y = 1; y < SAMPLE_H; y++) {
    banding = Math.max(banding, Math.abs(rows[y] - rows[y - 1]));
  }

  const chromatic = hues.reduce((a, b) => a + b, 0);
  const variety = hues.filter((n) => n / Math.max(1, chromatic) >= 0.04).length;
  const dominantIndex = hues.indexOf(Math.max(...hues));
  const color =
    chromatic < 40
      ? dark > pale
        ? "black"
        : "chalk white"
      : HUE_NAMES[dominantIndex];

  const paintedSafe = Math.max(1, paintedCount);

  return {
    coverage,
    edge: edgeDensity,
    symmetry,
    banding: clamp01(banding * 2),
    variety,
    saturation: clamp01(satSum / paintedSafe),
    lightness: clamp01(lightSum / paintedSafe),
    warm: warm / paintedSafe,
    cool: cool / paintedSafe,
    green: green / paintedSafe,
    dark: dark / paintedSafe,
    color,
    empty: coverage < 0.012,
  };
}

export function coveragePhrase(coverage) {
  if (coverage < 0.012) return "an untouched sheet";
  if (coverage < 0.07) return "almost nothing";
  if (coverage < 0.2) return "a few marks";
  if (coverage < 0.45) return "a scattering of marks";
  if (coverage < 0.72) return "a busy field";
  return "the whole surface";
}