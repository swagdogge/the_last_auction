import { LOCAL_JURY_MAX_BID } from "./local-jury.js";

export const STARTING_BID = 500000;

export function fallbackVerdict(bidder) {
  const maxBid =
    Math.round((LOCAL_JURY_MAX_BID * (0.12 + Math.random() * 0.55)) / 250000) * 250000;
  return {
    bidderId: bidder.id,
    reaction: "…studies the work without saying a single word.",
    maxBid,
    winLine: "I had to have it.",
    lossLine: "Someone in this room has more money than sense.",
  };
}

/**
 * Turns secret maximum bids into a playable sequence of bids.
 * Bidding never goes above the winner's own ceiling.
 */
export function buildAuction(verdicts) {
  const pool = verdicts
    .filter((v) => v.maxBid >= STARTING_BID)
    .sort((a, b) => b.maxBid - a.maxBid);

  if (pool.length === 0) return { sequence: [], winnerId: null, runnerUpId: null, price: 0 };

  const winner = pool[0];
  const rivals = pool.slice(1, 4);
  const cap = winner.maxBid;
  const sequence = [];
  let price = 0;
  let leader = null;
  let guard = 0;

  const increment = (p) => {
    const base = p < 3000000 ? 250000 : p < 9000000 ? 500000 : 1000000;
    return base * (1 + Math.floor(Math.random() * 2));
  };

  while (price < cap && guard < 22) {
    guard += 1;
    const next = Math.min(cap, Math.max(STARTING_BID, price + increment(price)));
    const able = [winner, ...rivals].filter(
      (c) =>
        c.bidderId !== leader &&
        (c.bidderId === winner.bidderId ? c.maxBid >= next : c.maxBid > next),
    );
    if (!able.length) break;
    const pick = able[Math.floor(Math.random() * able.length)];
    price = next;
    leader = pick.bidderId;
    sequence.push({ bidderId: pick.bidderId, amount: price });
  }

  if (leader !== winner.bidderId) {
    price = Math.min(cap, Math.max(STARTING_BID, price));
    sequence.push({ bidderId: winner.bidderId, amount: price });
  }

  if (!sequence.length) {
    price = Math.min(cap, STARTING_BID);
    sequence.push({ bidderId: winner.bidderId, amount: price });
  }

  return {
    sequence,
    winnerId: winner.bidderId,
    runnerUpId: pool[1]?.bidderId ?? null,
    price: sequence[sequence.length - 1].amount,
  };
}