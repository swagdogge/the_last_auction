import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildAuction,
  buildScriptedAuction,
  fallbackVerdict,
  outBidders,
  passBidders,
  replayScript,
  shuffle,
  STARTING_BID,
} from "../src/lib/auction.js";
import { BIDDERS } from "../src/lib/bidders.js";
import { LOCAL_JURY_MAX_BID } from "../src/lib/local-jury.js";

const verdict = (bidderId, maxBid) => ({
  bidderId,
  maxBid,
  reaction: "…",
  winLine: "mine",
  lossLine: "theirs",
});

const rolls = (values) => {
  let index = 0;
  return () => values[index++] ?? 0.9;
};

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
  const result = buildAuction(
    [verdict("low", 1), verdict("high", 8000000), verdict("mid", 4000000)],
    { hideChance: 0 },
  );

  assert.equal(result.winnerId, "high");
  assert.equal(result.runnerUpId, "mid");
  assert.ok(result.sequence.length > 0);
  assert.ok(result.price >= 1);
  assert.ok(result.price <= 8000000);
  assert.deepEqual(result.sequence.at(-1).bidderId, "high");
  assert.equal(result.sequence.at(-1).amount, result.price);
});

test("a one dollar bid still sells the lot", () => {
  const result = buildAuction([verdict("a", 1), verdict("b", 0)], { hideChance: 0 });
  assert.equal(result.winnerId, "a");
  assert.equal(result.runnerUpId, null);
  assert.equal(result.price, 1);
  assert.equal(result.sequence.length, 1);
  assert.equal(result.sequence[0].bidderId, "a");
  assert.equal(result.sequence[0].amount, 1);
});

test("zero bids produce no sale", () => {
  assert.deepEqual(buildAuction([verdict("a", 0), verdict("b", 0)]), {
    sequence: [],
    reveals: [],
    hiddenIds: [],
    ceilingsById: {},
    commentsById: {},
    final: {},
    winnerId: null,
    runnerUpId: null,
    price: 0,
  });
});

test("every bidder with a ceiling gets a bid at that ceiling", (t) => {
  const verdicts = BIDDERS.map((bidder, index) => verdict(bidder.id, 12000000 - index * 1000000));
  let roll = 0;
  t.mock.method(Math, "random", () => roll);

  for (const nextRoll of [0, 0.25, 0.5, 0.75, 0.99]) {
    roll = nextRoll;
    const { sequence, price, winnerId } = buildAuction(verdicts, { hideChance: 0 });
    assert.equal(new Set(sequence.map((bid) => bid.bidderId)).size, verdicts.length);
    for (const v of verdicts) {
      assert.ok(
        sequence.some((bid) => bid.bidderId === v.bidderId && bid.amount === v.maxBid && bid.atLimit),
        `${v.bidderId} should be mentioned at their maximum`,
      );
    }
    assert.ok(sequence.length >= verdicts.length + 4, "there should be raises in between");
    assert.equal(sequence.at(-1).bidderId, winnerId);
    assert.equal(sequence.at(-1).amount, price);
    assert.ok(price <= 12000000);
    for (let index = 1; index < sequence.length; index += 1) {
      assert.ok(sequence[index].amount > sequence[index - 1].amount);
      assert.notEqual(sequence[index].bidderId, sequence[index - 1].bidderId);
    }
  }
});

test("every ceiling is announced across many random bidding wars", () => {
  const verdicts = BIDDERS.map((bidder, index) => verdict(bidder.id, 2500000 + index * 1300000));

  for (let run = 0; run < 100; run += 1) {
    const { sequence } = buildAuction(verdicts, { hideChance: 0 });
    for (const v of verdicts) {
      assert.ok(
        sequence.some((bid) => bid.bidderId === v.bidderId && bid.amount === v.maxBid && bid.atLimit),
        `${v.bidderId} should reach their ceiling on run ${run}`,
      );
    }
  }
});

test("bids include suspense pauses and challenge raises", () => {
  const verdicts = BIDDERS.map((bidder, index) => verdict(bidder.id, 9000000 - index * 700000));
  const { sequence } = buildAuction(verdicts, { hideChance: 0 });
  assert.ok(sequence.some((bid) => bid.kind === "opening"));
  assert.ok(sequence.some((bid) => bid.kind === "final"));
  assert.ok(sequence.every((bid) => bid.pause > 0));
  assert.ok(sequence.some((bid) => bid.pause > 1000));
});

test("bidders with no maximum are marked as passing", () => {
  const verdicts = [verdict("pass", 0), verdict("bid", 1000000), verdict("alsoPass", 0)];
  assert.deepEqual(passBidders(verdicts), ["pass", "alsoPass"]);
  assert.deepEqual(passBidders(verdicts.slice(1, 2)), []);
  assert.equal(buildAuction(verdicts, { hideChance: 0 }).winnerId, "bid");
});

test("bidders stay out once the room passes their ceiling", () => {
  const verdicts = BIDDERS.map((bidder, index) => verdict(bidder.id, 2500000 + index * 1300000));
  const { sequence } = buildAuction(verdicts, { hideChance: 0 });
  const seenOut = new Set();

  for (const bid of sequence) {
    const out = outBidders(verdicts, bid.amount, bid.bidderId);
    assert.ok(!out.includes(bid.bidderId), "the leading bidder is never greyed out");
    for (const id of seenOut) assert.ok(out.includes(id), `${id} came back from being out`);
    out.forEach((id) => seenOut.add(id));
  }

  assert.ok(seenOut.size > 0, "some bidders do get priced out");
  assert.ok(sequence.at(-1).bidderId !== undefined);
  assert.equal(outBidders(verdicts, 0, null).length, 0);
});

test("a hidden bidder steps in only when someone else holds the lead", () => {
  const verdicts = [verdict("hidden", 10000000), verdict("other", 8000000)];
  const result = buildAuction(verdicts, { random: rolls([0.1, 0.5, 0.9]) });

  assert.deepEqual(result.hiddenIds, ["hidden"]);
  assert.ok(result.ceilingsById.hidden < 8000000);
  assert.equal(result.sequence.at(-1).bidderId, "other");
  assert.equal(result.reveals.length, 1);
  assert.equal(result.reveals[0].bidderId, "hidden");
  assert.equal(result.reveals[0].amount, 10000000);
  assert.equal(result.winnerId, "hidden");
  assert.equal(result.price, 10000000);
});

test("a hidden bidder never becomes the public leader, so their true max can still win", () => {
  const verdicts = [verdict("hidden", 10000000), verdict("other", 4000000)];
  const result = buildAuction(verdicts, { random: rolls([0.1, 0.5, 0.9]) });

  assert.deepEqual(result.hiddenIds, ["hidden"]);
  assert.equal(result.sequence.at(-1).bidderId, "other");
  assert.equal(result.reveals.length, 1);
  assert.equal(result.winnerId, "hidden");
  assert.equal(result.price, 10000000);
});

test("the hammer always equals the game's highest max, even when everyone hides", () => {
  const verdicts = [
    verdict("a", 3000000),
    verdict("b", 7000000),
    verdict("c", 11000000),
  ];

  for (const values of [
    [0.1, 0.5, 0.1, 0.5, 0.1, 0.5],
    [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
  ]) {
    const result = buildAuction(verdicts, { random: rolls(values) });
    const allBids = [...result.sequence, ...result.reveals];

    assert.equal(result.price, 11000000);
    assert.equal(result.winnerId, "c");
    assert.equal(allBids.at(-1).amount, 11000000);
    for (let i = 1; i < allBids.length; i += 1) {
      assert.notEqual(allBids[i].bidderId, allBids[i - 1].bidderId);
      assert.ok(allBids[i].amount > allBids[i - 1].amount);
    }
    if (result.reveals.length) {
      assert.ok(!result.hiddenIds.includes(result.sequence.at(-1).bidderId));
    }
  }
});

test("several hidden bidders can stack their late reveals", () => {
  const verdicts = [
    verdict("a", 4000000),
    verdict("b", 12000000),
    verdict("c", 15000000),
    verdict("d", 9000000),
  ];
  const result = buildAuction(verdicts, { random: rolls([0.9, 0.1, 0.5, 0.1, 0.5, 0.9]) });

  assert.deepEqual(result.hiddenIds, ["b", "c"]);
  assert.deepEqual(result.reveals.map((bid) => bid.bidderId), ["b", "c"]);
  assert.deepEqual(result.reveals.map((bid) => bid.amount), [12000000, 15000000]);
  assert.equal(result.sequence.at(-1).bidderId, "d");
  assert.equal(result.winnerId, "c");
  assert.equal(result.runnerUpId, "b");
  assert.equal(result.price, 15000000);
});

test("hidden bidders grey out at their fake ceiling", () => {
  const verdicts = [verdict("hidden", 10000000), verdict("other", 8000000)];
  const { ceilingsById } = buildAuction(verdicts, { random: rolls([0.1, 0.5, 0.9]) });

  assert.ok(ceilingsById.hidden < 10000000);
  assert.ok(outBidders(verdicts, ceilingsById.hidden, "other", ceilingsById).includes("hidden"));
  assert.ok(!outBidders(verdicts, ceilingsById.hidden - 1, "other", ceilingsById).includes("hidden"));
});

test("the replay validator keeps only legal bids in the AI's script", () => {
  const maxes = new Map([
    ["a", 2000000],
    ["b", 3000000],
    ["c", 0],
  ]);
  const replay = replayScript(
    [
      { bidder_id: "A", amount_dollars: 600000, comment: "  A fine start.  " },
      { bidder_id: "a", amount_dollars: 500000 },
      { bidder_id: "b", amount_dollars: 620000 },
      { bidder_id: "b", amount_dollars: 1200000, comment: "Not bad." },
      { bidder_id: "c", amount_dollars: 9000000 },
      { bidder_id: "a", amount_dollars: 99999999 },
      { bidder_id: "b", amount_dollars: 2050000 },
    ],
    maxes,
  );

  assert.deepEqual(replay.events, [
    { bidderId: "a", amount: 600000, comment: "A fine start." },
    { bidderId: "b", amount: 1200000, comment: "Not bad." },
    { bidderId: "a", amount: 2000000, comment: "" },
  ]);
  assert.equal(replay.winnerId, "a");
  assert.equal(replay.runnerUpId, "b");
  assert.equal(replay.price, 2000000);
});

test("a leader's later raise replaces their bid instead of being dropped", () => {
  const maxes = new Map([
    ["gordon", 850000],
    ["julian", 1400000],
    ["marguerite", 900000],
    ["chad", 4206900],
  ]);
  const replay = replayScript(
    [
      { bidder_id: "gordon", amount_dollars: 500000, comment: "Smells like toasted hazelnuts!" },
      { bidder_id: "julian", amount_dollars: 600000 },
      { bidder_id: "marguerite", amount_dollars: 700000 },
      { bidder_id: "gordon", amount_dollars: 800000 },
      { bidder_id: "julian", amount_dollars: 900000, comment: "Pure post-ironic spatial critique." },
      { bidder_id: "chad", amount_dollars: 1500000, comment: "touch grass losers" },
      { bidder_id: "julian", amount_dollars: 1600000 },
      { bidder_id: "chad", amount_dollars: 4206900, comment: "ez clap get wrecked" },
    ],
    maxes,
  );

  assert.equal(replay.events.length, 6);
  assert.deepEqual(replay.events.at(-1), {
    bidderId: "chad",
    amount: 4206900,
    comment: "ez clap get wrecked",
  });
  for (let i = 1; i < replay.events.length; i += 1) {
    assert.notEqual(replay.events[i].bidderId, replay.events[i - 1].bidderId);
    assert.ok(replay.events[i].amount >= Math.ceil(replay.events[i - 1].amount * 1.05));
  }
  assert.equal(replay.winnerId, "chad");
  assert.equal(replay.runnerUpId, "julian");
  assert.equal(replay.price, 4206900);
});

test("an empty AI script is a no sale", () => {
  assert.deepEqual(replayScript([], new Map()), {
    events: [],
    winnerId: null,
    runnerUpId: null,
    price: 0,
  });
  assert.deepEqual(replayScript(null), {
    events: [],
    winnerId: null,
    runnerUpId: null,
    price: 0,
  });
});

test("a scripted auction keeps the AI's order, comments and final lines", () => {
  const verdicts = [verdict("a", 3000000), verdict("b", 4000000)];
  const maxes = new Map(verdicts.map((v) => [v.bidderId, v.maxBid]));
  const replay = replayScript(
    [
      { bidder_id: "a", amount_dollars: STARTING_BID, comment: "Opening gambit." },
      { bidder_id: "b", amount_dollars: 2000000 },
      { bidder_id: "a", amount_dollars: 2500000, comment: "I'll have that." },
    ],
    maxes,
  );
  const auction = buildScriptedAuction(verdicts, replay, {
    winnerLine: "Frame it.",
    runnerUpLine: "Pah.",
  });

  assert.deepEqual(auction.sequence.map((bid) => bid.bidderId), ["a", "b", "a"]);
  assert.deepEqual(auction.sequence.map((bid) => bid.amount), [STARTING_BID, 2000000, 2500000]);
  assert.equal(auction.sequence[0].kind, "opening");
  assert.equal(auction.sequence[2].kind, "final");
  assert.equal(auction.sequence[2].atLimit, false);
  assert.deepEqual(auction.commentsById, { a: "I'll have that." });
  assert.deepEqual(auction.final, { winnerLine: "Frame it.", runnerUpLine: "Pah." });
  assert.deepEqual(auction.reveals, []);
  assert.equal(auction.winnerId, "a");
  assert.equal(auction.runnerUpId, "b");
  assert.equal(auction.price, 2500000);
});

test("shuffle keeps every bidder exactly once", (t) => {
  t.mock.method(Math, "random", () => 0.4);
  const ids = BIDDERS.map((b) => b.id);
  assert.deepEqual([...shuffle(ids)].sort(), [...ids].sort());
  assert.notDeepEqual(shuffle(ids), shuffle(ids.slice().reverse()));
});
