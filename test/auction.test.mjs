import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAuction, fallbackVerdict } from "../src/lib/auction.js";
import { BIDDERS } from "../src/lib/bidders.js";
import { LOCAL_JURY_MAX_BID } from "../src/lib/local-jury.js";

const verdict = (bidderId, maxBid) => ({
  bidderId,
  maxBid,
  reaction: "…",
  winLine: "mine",
  lossLine: "theirs",
});

test("fallbackVerdict stays inside the local jury ceiling", (t) => {
  t.mock.method(Math, "random", () => 0.5);
  const result = fallbackVerdict(BIDDERS[0]);

  assert.equal(result.bidderId, BIDDERS[0].id);
  assert.ok(result.maxBid >= LOCAL_JURY_MAX_BID * 0.12);
  assert.ok(result.maxBid <= LOCAL_JURY_MAX_BID * 0.67);
  assert.equal(result.maxBid % 250000, 0);
  assert.equal(typeof result.reaction, "string");
});

test("the highest max bid wins and the second highest is runner-up", () => {
  const result = buildAuction([
    verdict("low", 1),
    verdict("high", 8000000),
    verdict("mid", 4000000),
  ]);

  assert.equal(result.winnerId, "high");
  assert.equal(result.runnerUpId, "mid");
  assert.ok(result.sequence.length > 0);
  assert.ok(result.price >= 1);
  assert.ok(result.price <= 8000000);
  assert.deepEqual(result.sequence.at(-1), { bidderId: "high", amount: result.price });
});

test("a one dollar bid still sells the lot", () => {
  assert.deepEqual(buildAuction([verdict("a", 1), verdict("b", 0)]), {
    sequence: [{ bidderId: "a", amount: 1 }],
    winnerId: "a",
    runnerUpId: null,
    price: 1,
  });
});

test("zero bids produce no sale", () => {
  assert.deepEqual(buildAuction([verdict("a", 0), verdict("b", 0)]), {
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
