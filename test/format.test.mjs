import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCompact, formatMoney } from "../src/lib/format.js";

test("formatMoney renders whole dollars with separators", () => {
  assert.equal(formatMoney(0), "$0");
  assert.equal(formatMoney(1234567), "$1,234,567");
  assert.equal(formatMoney(1234.6), "$1,235");
  assert.equal(formatMoney("nope"), "$0");
});

test("formatCompact switches units at 1K and 1M", () => {
  assert.equal(formatCompact(999), "$999");
  assert.equal(formatCompact(1500), "$2K");
  assert.equal(formatCompact(1000000), "$1M");
  assert.equal(formatCompact(7500000), "$7.5M");
  assert.equal(formatCompact(12345678), "$12.3M");
});
