import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAuction, fallbackVerdict, STARTING_BID } from "../src/lib/auction.js";
import { BIDDER_BUDGET, BIDDERS } from "../src/lib/bidders.js";

const verdict = (bidderId, maxBid) => ({
  bidderId,
  maxBid,
  reaction: "…",
  winLine: "mine",
  lossLine: "theirs",
});

test("fallbackVerdict stays inside the shared budget", (t) => {
  t.mock.method(Math, "random", () => 0.5);
  const result = fallbackVerdict(BIDDERS[0]);

  assert.equal(result.bidderId, BIDDERS[0].id);
  assert.ok(result.maxBid >= BIDDER_BUDGET * 0.12);
  assert.ok(result.maxBid <= BIDDER_BUDGET * 0.67);
  assert.equal(result.maxBid % 250000, 0);
  assert.equal(typeof result.reaction, "string");
});

test("the highest max bid wins and the second highest is runner-up", () => {
  const result = buildAuction([
    verdict("low", STARTING_BID),
    verdict("high", 8000000),
    verdict("mid", 4000000),
  ]);

  assert.equal(result.winnerId, "high");
  assert.equal(result.runnerUpId, "mid");
  assert.ok(result.sequence.length > 0);
  assert.ok(result.price >= STARTING_BID);
  assert.ok(result.price <= 8000000);
  assert.deepEqual(result.sequence.at(-1), { bidderId: "high", amount: result.price });
});

test("bids below the starting price produce an empty auction", () => {
  assert.deepEqual(buildAuction([verdict("a", 100), verdict("b", 0)]), {
    sequence: [],
    winnerId: null,
    runnerUpId: null,
    price: 0,
  });
});

test("the sequence never repeats a bidder in a row or exceeds the winner's ceiling", (t) => {
  const verdicts = BIDDERS.map((bidder, index) => verdict(bidder.id, 12000000 - index * 1000000));
  let roll = 0;
  t.mock.method(Math, "random", () => roll);

  for (const nextRoll of [0, 0.25, 0.5, 0.75, 0.99]) {
    roll = nextRoll;
    const { sequence, price } = buildAuction(verdicts);
    assert.ok(price <= 12000000);
    assert.ok(new Set(sequence.map((bid) => bid.bidderId)).size <= 4);
    for (let index = 1; index < sequence.length; index += 1) {
      assert.notEqual(sequence[index].bidderId, sequence[index - 1].bidderId);
    }
  }
});
