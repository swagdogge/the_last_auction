import { test } from "node:test";
import assert from "node:assert/strict";
import { PALETTE } from "../src/lib/bidders.js";

// Kirb32 by PureAsbestos: https://lospec.com/palette-list/kirb32
const KIRB32 = [
  "#0d0305",
  "#3c3444",
  "#6e576e",
  "#917d9b",
  "#c5b7cb",
  "#f7f4e8",
  "#5f4f47",
  "#851246",
  "#d72048",
  "#7d322f",
  "#9d4c2f",
  "#c65e2d",
  "#f96a2d",
  "#ffa300",
  "#e29138",
  "#f7c233",
  "#f9ec41",
  "#11442c",
  "#287a33",
  "#52b139",
  "#8ae931",
  "#0e131e",
  "#203c62",
  "#2a69b0",
  "#00a1de",
  "#6bdad5",
  "#a52eb8",
  "#f7406e",
  "#fc83a2",
  "#f9cf9d",
  "#fba176",
  "#f66f67",
];

test("the pigment tray uses the complete Kirb32 palette", () => {
  assert.deepEqual(PALETTE, KIRB32);
  assert.equal(new Set(PALETTE).size, 32);
});

test("the palette covers the basic rainbow range", () => {
  const rainbow = [
    "#d72048", // red
    "#ffa300", // orange
    "#f9ec41", // yellow
    "#52b139", // green
    "#2a69b0", // blue
    "#a52eb8", // violet
  ];
  for (const hex of rainbow) {
    assert.ok(PALETTE.includes(hex), `missing rainbow colour ${hex}`);
  }
});
