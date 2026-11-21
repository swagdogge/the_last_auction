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

  assert.match(recap, /WHAT HAS HAPPENED SO FAR/);
  assert.match(recap, /Lot 1 "Sunset 'blob'": winner Ines Barlow \(\$1\.2M\)/);
  assert.match(recap, /Gordon Rage-say passed/);
  assert.match(recap, /Gordon Rage-say's last line: "Reaction gordon"/);
  assert.match(recap, /must NOT reuse phrases, jokes or the same kind of observation/);
  assert.match(recap, /lost twice is hungrier, someone who just won is pickier/);
  assert.equal(formatLotHistory([]), "");
});
