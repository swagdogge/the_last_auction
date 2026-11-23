import { BIDDERS } from "./bidders.js";
import { formatCompact } from "./format.js";

const nameOf = (id) =>
  (BIDDERS.find((bidder) => bidder.id === id)?.name || id).replace(/"/g, "'");

const clean = (text) =>
  String(text || "").replace(/\s+/g, " ").replace(/"/g, "'").trim();

// Only the AI's recap needs shortening; the lot record keeps full buyer lines.
const clip = (text, max) => {
  const oneLine = clean(text);
  if (oneLine.length <= max) return oneLine;
  const cut = oneLine.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
};

/** Snapshot of one finished lot, kept for the next lots' bidders to remember. */
export function buildLotRecord({ title, verdicts = [], auction = {}, final = null }) {
  const byId = new Map(verdicts.map((verdict) => [verdict.bidderId, verdict]));
  const lines = final || auction.final || {};
  const comments = auction.commentsById || {};
  const lastLines = {};

  for (const bidder of BIDDERS) {
    const verdict = byId.get(bidder.id);
    if (!verdict) continue;
    const line =
      bidder.id === auction.winnerId
        ? lines.winnerLine || verdict.winLine || verdict.reaction
        : bidder.id === auction.runnerUpId
          ? lines.runnerUpLine || verdict.lossLine || verdict.reaction
          : comments[bidder.id] || verdict.reaction;
    if (line) lastLines[bidder.id] = clean(line);
  }

  return {
    title: clip(title, 40) || "Untitled",
    winnerId: auction.winnerId || null,
    runnerUpId: auction.runnerUpId || null,
    price: auction.price || 0,
    passed: BIDDERS.filter((bidder) => (byId.get(bidder.id)?.maxBid ?? 0) <= 0).map(
      (bidder) => bidder.id,
    ),
    lastLines,
  };
}

/** Short recap for the AI bidders on lot 2 and 3. Empty for the first lot. */
export function formatLotHistory(history) {
  if (!history?.length) return "";

  const stats = Object.fromEntries(
    BIDDERS.map((b) => [b.id, { won: 0, lost: 0, passed: 0, last: "" }]),
  );

  const lotLines = history.map((lot, i) => {
    for (const b of BIDDERS) {
      const s = stats[b.id];
      if (lot.winnerId === b.id) s.won++;
      else if (lot.passed?.includes(b.id)) s.passed++;
      else s.lost++;
      if (lot.lastLines?.[b.id]) s.last = clip(lot.lastLines[b.id], 70);
    }
    const result = lot.winnerId
      ? `${nameOf(lot.winnerId)} won (${formatCompact(lot.price)})` +
        (lot.runnerUpId ? `, ${nameOf(lot.runnerUpId)} lost to them` : "")
      : "no sale";
    return `Lot ${i + 1} "${lot.title}": ${result}.`;
  });

  const n = history.length;
  const moods = BIDDERS.map((b) => {
    const s = stats[b.id];
    if (s.won >= 1)
      return `${nameOf(b.id)}: has won ${s.won}, budget spent, should sit this one out unless it is extraordinary`;
    if (s.lost >= 1) return `${nameOf(b.id)}: lost ${s.lost}, hungrier`;
    if (s.passed === n) return `${nameOf(b.id)}: bored, nothing has moved them`;
    return null;
  }).filter(Boolean);

  const recent = BIDDERS.filter((b) => stats[b.id].last).map(
    (b) => `${nameOf(b.id)}: "${stats[b.id].last}"`,
  );

  return [
    "HISTORY",
    ...lotLines,
    moods.length ? "MOODS: " + moods.join("; ") + "." : "",
    "LAST LINES (never reuse their wording or jokes):",
    ...recent,
    "Keep each comic style but invent fresh jokes and observations.",
  ]
    .filter(Boolean)
    .join("\n");
}