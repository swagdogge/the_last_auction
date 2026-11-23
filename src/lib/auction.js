import { LOCAL_JURY_MAX_BID } from "./local-jury.js";

export const STARTING_BID = 500000;
const MIN_STEP = 0.05;

export function fallbackVerdict(bidder) {
  const maxBid =
    Math.round((LOCAL_JURY_MAX_BID * (0.12 + Math.random() * 0.55)) / 250000) * 250000;
  return {
    bidderId: bidder.id,
    reaction: "…studies the work without saying a single word.",
    maxBid,
  };
}

/** Fisher-Yates, returning a new array. Used for the impression reveal order. */
export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Bidders who never entered the bidding at all. */
export function passBidders(verdicts) {
  return verdicts.filter((v) => v.maxBid === 0).map((v) => v.bidderId);
}

/**
 * A bidder is out once the standing bid has reached their visible ceiling and
 * somebody else holds the lead. Hidden bidders use their lower, fake ceiling
 * until they step back in at "going twice".
 */
export function outBidders(verdicts, price, leaderId, ceilings = null) {
  return verdicts
    .filter((v) => {
      if (v.maxBid <= 0 || v.bidderId === leaderId) return false;
      const ceiling = ceilings?.[v.bidderId] ?? v.maxBid;
      return price >= ceiling;
    })
    .map((v) => v.bidderId);
}

const stepFor = (price) =>
  price < 1000000 ? 50000 : price < 4000000 ? 100000 : price < 9000000 ? 250000 : 500000;

const cleanLine = (value, max) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

/**
 * Replays the AI's script under the game's rules. maxes: Map(bidderId -> maxBid).
 * Invalid bids are dropped or folded into the leader's standing bid, so the
 * played sequence is always one the room could actually have called.
 */
export function replayScript(script, maxes = new Map()) {
  const events = [];
  let leader = null;
  let price = 0;

  for (const raw of Array.isArray(script) ? script : []) {
    if (events.length >= 16) break;
    const id = String(raw?.bidder_id ?? "").trim().toLowerCase();
    const max = maxes.get(id);
    const rawAmount = Number(String(raw?.amount_dollars ?? "").replace(/[$,\s]/g, ""));
    if (max == null || max <= 0 || !Number.isFinite(rawAmount)) continue;

    // Clamp to their own ceiling; the next bid has to beat what actually stood.
    const amount = Math.min(Math.round(rawAmount), max);
    const floor = leader ? Math.ceil(price * (1 + MIN_STEP)) : STARTING_BID;
    if (amount < floor) continue;

    if (id === leader) {
      // Models often write the winner raising twice in a row, sometimes with a
      // rival's illegal bid in between. Fold the higher number into the bid
      // already on the table rather than letting them overbid themselves.
      const standing = events[events.length - 1];
      standing.amount = amount;
      const comment = cleanLine(raw?.comment, 140);
      if (comment) standing.comment = comment;
      price = amount;
      continue;
    }

    events.push({ bidderId: id, amount, comment: cleanLine(raw?.comment, 140) });
    leader = id;
    price = amount;
  }

  const runnerUpId = [...events].reverse().find((event) => event.bidderId !== leader)?.bidderId ?? null;
  return { events, winnerId: leader, runnerUpId, price };
}

/** Turns a validated AI replay into the same shape the playback stage expects. */
export function buildScriptedAuction(verdicts, replay, final = {}) {
  const events = replay?.events ?? [];
  const maxes = new Map(verdicts.map((verdict) => [verdict.bidderId, verdict.maxBid]));
  const last = events.length - 1;
  const sequence = events.map((event, index) => ({
    bidderId: event.bidderId,
    amount: event.amount,
    comment: event.comment,
    kind: index === 0 ? "opening" : index === last ? "final" : "bid",
    atLimit: event.amount === maxes.get(event.bidderId),
    pause: index === 0 ? 900 : index === last ? 900 : 700,
  }));

  return {
    sequence,
    reveals: [],
    hiddenIds: [],
    ceilingsById: Object.fromEntries(maxes),
    commentsById: Object.fromEntries(events.filter((event) => event.comment).map((event) => [event.bidderId, event.comment])),
    winnerId: replay?.winnerId ?? null,
    runnerUpId: replay?.runnerUpId ?? null,
    price: replay?.price ?? 0,
    final: {
      winnerLine: final.winnerLine,
      runnerUpLine: final.runnerUpLine,
    },
  };
}

const EMPTY_AUCTION = {
  sequence: [],
  reveals: [],
  hiddenIds: [],
  ceilingsById: {},
  commentsById: {},
  final: {},
  winnerId: null,
  runnerUpId: null,
  price: 0,
};

/**
 * Turns secret maximum bids into a long, dramatic bidding war. Every bidder
 * with a ceiling gets a visible bid at that ceiling, with extra raises between
 * them. Some bidders hide their real ceiling, appear to drop out, and then
 * step back in at "going twice"; several can do this at once.
 */
export function buildAuction(verdicts, { random = Math.random, hideChance = 0.2 } = {}) {
  const pool = verdicts.filter((v) => v.maxBid > 0);
  if (pool.length === 0) return { ...EMPTY_AUCTION };

  const ceilingsById = {};
  const hiddenIds = [];
  const entries = pool.map((v) => {
    const unit = stepFor(v.maxBid);
    const wantsToHide = random() < hideChance;
    if (wantsToHide && v.maxBid > unit * 2) {
      const target = v.maxBid * (0.45 + random() * 0.2);
      const rounded = Math.round(target / unit) * unit;
      const ceiling = Math.max(unit, Math.min(rounded, v.maxBid - unit));
      ceilingsById[v.bidderId] = ceiling;
      hiddenIds.push(v.bidderId);
      return { ...v, ceiling };
    }
    ceilingsById[v.bidderId] = v.maxBid;
    return { ...v, ceiling: v.maxBid };
  });

  // A hidden bidder must never be the public leader: that would leave nobody
  // to overbid them at "going twice" and the hammer would miss their real max.
  if (hiddenIds.length === pool.length) {
    const top = entries.slice().sort((a, b) => b.maxBid - a.maxBid)[0];
    const index = entries.findIndex((v) => v.bidderId === top.bidderId);
    entries[index] = { ...entries[index], ceiling: top.maxBid };
    ceilingsById[top.bidderId] = top.maxBid;
    hiddenIds.splice(hiddenIds.indexOf(top.bidderId), 1);
  }

  const publicLeaderCeiling = Math.max(
    ...entries.filter((v) => !hiddenIds.includes(v.bidderId)).map((v) => v.ceiling),
  );
  entries.forEach((v) => {
    if (!hiddenIds.includes(v.bidderId)) return;
    const capped = Math.max(
      1,
      Math.min(v.ceiling, publicLeaderCeiling - stepFor(publicLeaderCeiling)),
    );
    v.ceiling = capped;
    ceilingsById[v.bidderId] = capped;
  });

  const ascending = entries.slice().sort((a, b) => a.ceiling - b.ceiling);
  const publicWinner = ascending[ascending.length - 1];
  const sequence = [];
  const used = new Set();

  const addBid = (bidder, amount, kind) => {
    const previousBid = sequence[sequence.length - 1];
    if (
      !bidder ||
      bidder.bidderId === previousBid?.bidderId ||
      amount <= (previousBid?.amount ?? 0)
    ) {
      return;
    }
    sequence.push({
      bidderId: bidder.bidderId,
      amount,
      kind,
      atLimit: amount === bidder.ceiling,
      pause: kind === "challenge" ? 1150 : kind === "opening" ? 900 : 640,
    });
    used.add(bidder.bidderId);
  };

  for (let index = 0; index < ascending.length; index += 1) {
    const bidder = ascending[index];
    const next = ascending[index + 1];
    const isPublicWinner = bidder.bidderId === publicWinner.bidderId;

    addBid(
      bidder,
      bidder.ceiling,
      index === 0 ? "opening" : isPublicWinner ? "final" : "bid",
    );

    if (!next || next.ceiling <= bidder.ceiling) continue;

    const gap = next.ceiling - bidder.ceiling;
    const extra = Math.min(3, Math.floor(gap / (stepFor(bidder.ceiling) * 2)));
    let previous = bidder.ceiling;

    for (let slot = 0; slot < extra; slot += 1) {
      const price = previous + Math.max(1, Math.floor(gap / (extra + 1)));
      if (price >= next.ceiling) break;

      const eligible = entries.filter(
        (v) =>
          v.ceiling > price &&
          v.bidderId !== bidder.bidderId &&
          v.bidderId !== next.bidderId &&
          v.bidderId !== publicWinner.bidderId &&
          v.bidderId !== sequence[sequence.length - 1]?.bidderId,
      );
      const fresh = eligible.filter((v) => !used.has(v.bidderId));
      const options = fresh.length ? fresh : eligible;
      if (!options.length) break;

      const pick = options[Math.floor(random() * options.length)];
      addBid(pick, price, slot === extra - 1 ? "challenge" : "bid");
      previous = price;
    }
  }

  const finalPublicBid = sequence[sequence.length - 1] ?? null;
  const publicTop = finalPublicBid?.amount ?? 0;
  let runningPrice = publicTop;
  const reveals = [];

  // Hidden bidders are capped below the public leader, so someone else always
  // holds the lead at "going twice" and the real ceiling can be revealed.
  entries
    .filter(
      (v) =>
        hiddenIds.includes(v.bidderId) &&
        v.bidderId !== finalPublicBid?.bidderId &&
        v.maxBid > publicTop,
    )
    .sort((a, b) => a.maxBid - b.maxBid)
    .forEach((v) => {
      if (v.maxBid <= runningPrice || v.bidderId === reveals[reveals.length - 1]?.bidderId) {
        return;
      }
      reveals.push({
        bidderId: v.bidderId,
        amount: v.maxBid,
        kind: "reveal",
        atLimit: true,
        pause: 1250,
      });
      runningPrice = v.maxBid;
    });

  const allBids = [...sequence, ...reveals];
  const winnerBid = allBids[allBids.length - 1];
  const runnerBid = [...allBids]
    .reverse()
    .find((bid) => bid.bidderId !== winnerBid?.bidderId);
  const verdictById = new Map(pool.map((verdict) => [verdict.bidderId, verdict]));

  return {
    sequence,
    reveals,
    hiddenIds,
    ceilingsById,
    commentsById: {},
    final: {
      winnerLine: verdictById.get(winnerBid?.bidderId)?.winLine,
      runnerUpLine: verdictById.get(runnerBid?.bidderId)?.lossLine,
    },
    winnerId: winnerBid?.bidderId ?? null,
    runnerUpId: runnerBid?.bidderId ?? null,
    price: runningPrice,
  };
}
