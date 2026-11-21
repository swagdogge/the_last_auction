import { test } from "node:test";
import assert from "node:assert/strict";
import { judgePaintingLocally } from "../src/lib/judging.js";
import { BIDDERS } from "../src/lib/bidders.js";
import { LOCAL_JURY_MAX_BID } from "../src/lib/local-jury.js";

const stats = {
  coverage: 0.42,
  edge: 0.3,
  symmetry: 0.6,
  banding: 0.2,
  variety: 4,
  saturation: 0.5,
  lightness: 0.6,
  warm: 0.4,
  cool: 0.2,
  green: 0.1,
  dark: 0.05,
  color: "crimson",
  empty: false,
};

test("every bidder gets a complete verdict with no leftover placeholders", (t) => {
  t.mock.method(Math, "random", () => 0.5);
  const verdicts = judgePaintingLocally(stats, 0);

  assert.equal(verdicts.length, BIDDERS.length);
  assert.deepEqual(
    verdicts.map((verdict) => verdict.bidderId),
    BIDDERS.map((bidder) => bidder.id),
  );

  for (const verdict of verdicts) {
    for (const line of ["reaction", "winLine", "lossLine"]) {
      assert.equal(typeof verdict[line], "string", verdict.bidderId);
      assert.ok(!verdict[line].includes("{"), verdict.bidderId);
    }
    assert.ok(verdict.maxBid >= 0 && verdict.maxBid <= LOCAL_JURY_MAX_BID);
    assert.equal(verdict.maxBid % 250000, 0);
  }
});

test("taste profiles pull bids in opposite directions", (t) => {
  t.mock.method(Math, "random", () => 0.5);
  const base = { ...stats, coverage: 0.5, variety: 1 };

  const warm = judgePaintingLocally({ ...base, warm: 1, cool: 0, green: 0, saturation: 0.8 }, 0);
  const landscape = judgePaintingLocally(
    { ...base, warm: 0, cool: 0.5, green: 0.5, banding: 1, edge: 0, symmetry: 0 },
    0,
  );
  const bidFor = (verdicts, id) => verdicts.find((verdict) => verdict.bidderId === id).maxBid;

  assert.ok(bidFor(warm, "gordon") > bidFor(warm, "ines"));
  assert.ok(bidFor(landscape, "ines") > bidFor(landscape, "gordon"));
});
