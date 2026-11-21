import { STARTING_BID } from "./auction.js";
import { BIDDERS } from "./bidders.js";
import { formatCompact } from "./format.js";

const nameOf = (id) =>
  (BIDDERS.find((bidder) => bidder.id === id)?.name || id).replace(/"/g, "'");
const quoteSafe = (text) => String(text || "").replace(/"/g, "'").trim();

/** Snapshot of one finished lot, kept for the next lots' bidders to remember. */
export function buildLotRecord({ title, verdicts = [], auction = {} }) {
  const byId = new Map(verdicts.map((verdict) => [verdict.bidderId, verdict]));
  const lastLines = {};

  for (const bidder of BIDDERS) {
    const verdict = byId.get(bidder.id);
    if (!verdict) continue;
    const line =
      bidder.id === auction.winnerId
        ? verdict.winLine || verdict.reaction
        : bidder.id === auction.runnerUpId
          ? verdict.lossLine || verdict.reaction
          : verdict.reaction;
    if (line) lastLines[bidder.id] = quoteSafe(line);
  }

  return {
    title: quoteSafe(title) || "Untitled",
    winnerId: auction.winnerId || null,
    price: auction.price || 0,
    passed: BIDDERS.filter((bidder) => (byId.get(bidder.id)?.maxBid ?? 0) < STARTING_BID).map(
      (bidder) => bidder.id,
    ),
    lastLines,
  };
}

/** Short recap for the AI bidders on lot 2 and 3. Empty for the first lot. */
export function formatLotHistory(history) {
  if (!history?.length) return "";

  const lines = ["WHAT HAS HAPPENED SO FAR"];
  history.forEach((lot, index) => {
    const result = lot.winnerId
      ? `winner ${nameOf(lot.winnerId)} (${formatCompact(lot.price)})`
      : "no sale — every bidder passed";
    const passed = lot.passed?.length ? ` ${lot.passed.map(nameOf).join(", ")} passed.` : "";
    lines.push(`Lot ${index + 1} "${quoteSafe(lot.title)}": ${result}.${passed}`);
    for (const [id, line] of Object.entries(lot.lastLines || {})) {
      lines.push(`${nameOf(id)}'s last line: "${quoteSafe(line)}"`);
    }
  });

  lines.push(
    "Bidders remember earlier lots. They must NOT reuse phrases, jokes or the same kind of " +
      "observation from their earlier lines. Let their opinions evolve: someone who has lost " +
      "twice is hungrier, someone who just won is pickier.",
  );
  return lines.join("\n");
}
