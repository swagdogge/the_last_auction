import { test } from "node:test";
import assert from "node:assert/strict";
import { BIDDERS } from "../src/lib/bidders.js";
import { buildLotRecord, formatLotHistory } from "../src/lib/lot-history.js";

const verdicts = BIDDERS.map((bidder, index) => ({
  bidderId: bidder.id,
  reaction: `Reaction ${bidder.id}`,
  winLine: `Win ${bidder.id}`,
  lossLine: `Loss ${bidder.id}`,
  maxBid: index === 0 ? 0 : 1200000,
}));

const lot = () =>
  buildLotRecord({
    title: 'Sunset "blob"',
    verdicts,
    auction: { winnerId: "ines", runnerUpId: "julian", price: 1200000 },
  });

test("a lot record keeps the winner, the passed bidders and last lines", () => {
  const record = lot();

  assert.equal(record.title, "Sunset 'blob'");
  assert.equal(record.winnerId, "ines");
  assert.deepEqual(record.passed, ["gordon"]);
  assert.equal(record.lastLines.ines, "Win ines");
  assert.equal(record.lastLines.julian, "Loss julian");
  assert.equal(record.lastLines.gordon, "Reaction gordon");
});

test("the recap is short, named and carries the no-repetition rules", () => {
  const recap = formatLotHistory([lot()]);

  assert.match(recap, /HISTORY/);
  assert.match(recap, /Lot 1 "Sunset 'blob'": Ines Barlow won \(\$1\.2M\), Julian Pretentiousberg lost to them\./);
  assert.match(recap, /Gordon Rage-say: bored, nothing has moved them/);
  assert.match(recap, /Ines Barlow: has won 1, pickier now/);
  assert.match(recap, /Julian Pretentiousberg: lost 1, hungrier/);
  assert.match(recap, /Gordon Rage-say: "Reaction gordon"/);
  assert.match(recap, /LAST LINES \(never reuse their wording or jokes\):/);
  assert.match(recap, /Keep each comic style but invent fresh jokes and observations\./);
  assert.equal(formatLotHistory([]), "");
});
