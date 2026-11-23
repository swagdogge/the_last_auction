import { test } from "node:test";
import assert from "node:assert/strict";
import { auctioneerLine, bidderShortName, FINAL_CALLS } from "../src/lib/auctioneer.js";
import { BIDDERS } from "../src/lib/bidders.js";

const sequence = BIDDERS.slice(0, 4).map((bidder, index) => ({
  bidderId: bidder.id,
  amount: 1000000 * (index + 1),
  kind: index === 0 ? "opening" : index === 2 ? "challenge" : "bid",
}));

test("the auctioneer calls going once, twice and sold", () => {
  assert.match(auctioneerLine({ status: "bidding", step: 3, sequence, callIndex: 0, price: 4000000 }), /Going once/);
  assert.match(auctioneerLine({ status: "bidding", step: 3, sequence, callIndex: 1, price: 4000000 }), /Going twice/);
  assert.match(auctioneerLine({ status: "bidding", step: 3, sequence, callIndex: 2, price: 4000000 }), /Sold/);
  assert.equal(FINAL_CALLS.length, 3);
});

test("the running commentary reacts to the kind of bid", () => {
  assert.match(auctioneerLine({ status: "opening" }), /open the bidding/);
  assert.match(auctioneerLine({ status: "bidding", step: 0, sequence }), /Opening at \$1,000,000/);
  assert.match(auctioneerLine({ status: "bidding", step: 2, sequence }), /advance|more|go on/i);
  assert.match(auctioneerLine({ status: "closed", price: 4000000 }), /Sold! \$4,000,000/);
});

test("ordinary bids name the bidder by surname and do not all repeat one phrase", (t) => {
  const bids = BIDDERS.map((bidder, index) => ({
    bidderId: bidder.id,
    amount: 1000000 * (index + 1),
    kind: "bid",
  }));
  const lines = bids.map((_, step) => auctioneerLine({ status: "bidding", step, sequence: bids }));

  assert.equal(new Set(lines).size, lines.length, "every bid gets its own call");
  assert.equal(lines.filter((line) => /thank you/i.test(line)).length, 1);
  lines.forEach((line, index) => {
    assert.match(line, /\$[\d,]+/);
    assert.match(line, new RegExp(bidderShortName(bids[index].bidderId)));
    assert.ok(!line.includes(BIDDERS[index].name), "never uses the whole name");
  });
});

test("late reveals get their own announcement", () => {
  const reveal = { bidderId: "marguerite", amount: 19000000, kind: "reveal" };
  const lines = [0, 1, 2].map((revealIndex) =>
    auctioneerLine({
      status: "bidding",
      callIndex: 1,
      price: 19000000,
      reveal,
      revealIndex,
    }),
  );

  assert.match(lines[0], /\$19,000,000 from Quirk — back in!/);
  assert.match(lines[1], /Wait — \$19,000,000 from Quirk!/);
  assert.match(lines[2], /Quirk is back at \$19,000,000/);
  assert.match(
    auctioneerLine({ status: "bidding", callIndex: 1, price: 19000000 }),
    /Going twice/,
  );
});

test("challenge raises rotate through real auctioneer prompts", () => {
  const bids = BIDDERS.map((bidder, index) => ({
    bidderId: bidder.id,
    amount: 1000000 * (index + 1),
    kind: "challenge",
  }));
  const lines = bids.map((_, step) => auctioneerLine({ status: "bidding", step, sequence: bids }));
  assert.ok(new Set(lines).size > 1);
  lines.forEach((line) => assert.match(line, /\$[\d,]+/));
});
