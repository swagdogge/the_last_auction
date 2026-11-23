import { BIDDERS } from "./bidders.js";
import { formatMoney } from "./format.js";

const LAST_NAMES = Object.fromEntries(
  BIDDERS.map((bidder) => [bidder.id, bidder.name.trim().split(/\s+/).at(-1)]),
);

/** The auctioneer only ever uses the surname, never the full name. */
export function bidderShortName(bidderId) {
  return LAST_NAMES[bidderId] ?? "the room";
}

export const FINAL_CALLS = [
  (price) => `Going once… ${formatMoney(price)}.`,
  (price) => `Going twice… ${formatMoney(price)}.`,
  (price) => `Sold! ${formatMoney(price)}.`,
];

const BID_CALLS = [
  (money, name) => `${money} from ${name}.`,
  (money, name) => `I have ${money} with ${name}.`,
  (money, name) => `${money}, ${name} — thank you.`,
  (money, name) => `The bid is ${money}, ${name}.`,
  (money, name) => `${name} is in with ${money},`,
  (money, name) => `Now ${money} from ${name}.`,
];

const CHALLENGE_CALLS = [
  (money) => `Any advance on ${money}?`,
  (money) => `Do I hear more than ${money}?`,
  (money) => `${money} stands. Will anyone go on?`,
];

const REVEAL_CALLS = [
  (money, name) => `${money} from ${name} — back in!`,
  (money, name) => `Wait — ${money} from ${name}!`,
  (money, name) => `${name} is back at ${money}.`,
];

/** The auctioneer's running commentary for a moment of the sale. */
export function auctioneerLine({
  status,
  step,
  sequence,
  callIndex = -1,
  price = 0,
  reveal = null,
  revealIndex = 0,
}) {
  if (reveal) {
    const call = REVEAL_CALLS[revealIndex % REVEAL_CALLS.length];
    return call(formatMoney(reveal.amount), bidderShortName(reveal.bidderId));
  }
  if (callIndex >= 0 && FINAL_CALLS[callIndex]) {
    return FINAL_CALLS[callIndex](price);
  }
  if (status === "opening") return "Thank you. Let us open the bidding.";
  if (status === "closed") return `Sold! ${formatMoney(price)}.`;
  if (status === "bidding") {
    const bid = step >= 0 ? sequence?.[step] : null;
    if (!bid) return "Do I have an opening bid?";
    const money = formatMoney(bid.amount);
    const name = bidderShortName(bid.bidderId);
    if (bid.kind === "opening") return `Opening at ${money} from ${name}.`;
    if (bid.kind === "final") return `${money} — the top of the room, from ${name}.`;
    if (bid.kind === "challenge") {
      return CHALLENGE_CALLS[step % CHALLENGE_CALLS.length](money);
    }
    return BID_CALLS[step % BID_CALLS.length](money, name);
  }
  return "Ladies and gentlemen, the saleroom is open.";
}
