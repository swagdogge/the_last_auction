import { useState } from "react";
import Auctioneer from "@/components/game/Auctioneer";
import BidderCard from "@/components/game/BidderCard";
import { BIDDERS } from "@/lib/bidders";
import { formatCompact, formatMoney } from "@/lib/format";

function prettyJson(raw) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export default function AuctionRoom({
  paintingIndex,
  title = null,
  verdicts,
  revealed,
  revealOrder,
  debugRaw = null,
  leaderId,
  price,
  priceLabel,
  caption,
  action,
  auctioneer,
  bidsById = {},
  commentsById = {},
  showReactions = false,
  outIds = [],
  passIds = [],
}) {
  const byId = Object.fromEntries(verdicts.map((v) => [v.bidderId, v]));
  const [showDebug, setShowDebug] = useState(false);
  const order = revealOrder?.length ? revealOrder : BIDDERS.map((b) => b.id);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-[60vh]">
      <div className="rounded-sm bg-black/60 px-5 py-4 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
            Lot {paintingIndex + 1}
          </p>
          {title && <p className="mt-1 font-heading text-lg text-foreground/85">{title}</p>}
          {caption && (
            <p className="mt-2 text-[11px] leading-relaxed text-foreground/70">{caption}</p>
          )}
        </div>
        <div className="mt-3 sm:mt-0 sm:text-right">
          <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
            {priceLabel || (price > 0 ? "Current bid" : "Opening bid")}
          </p>
          <p className="money mt-1 font-mono text-2xl">
            {price > 0 ? formatMoney(price) : "---"}
          </p>
        </div>
      </div>

      {auctioneer?.line && <Auctioneer line={auctioneer.line} tone={auctioneer.tone} />}
      {action && <div className="mt-4">{action}</div>}

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {order.map((id) => {
          const bidder = BIDDERS.find((b) => b.id === id);
          if (!bidder) return null;
          const verdict = byId[bidder.id];
          const isLeader = leaderId === bidder.id;
          const bid = bidsById[bidder.id];
          const passed = passIds.includes(bidder.id);
          return (
            <BidderCard
              key={bidder.id}
              bidder={bidder}
              state={isLeader ? "lead" : outIds.includes(bidder.id) || passed ? "out" : "idle"}
              passed={passed}
              bid={bid !== undefined ? formatCompact(bid) : undefined}
              line={
                showReactions
                  ? order.indexOf(bidder.id) < revealed
                    ? verdict?.reaction
                    : undefined
                  : commentsById[bidder.id]
              }
            />
          );
        })}
      </div>

      {debugRaw && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowDebug((value) => !value)}
            className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline decoration-white/30 underline-offset-4 hover:text-foreground"
          >
            {showDebug ? "Hide debug info" : "Show debug info"}
          </button>
          {showDebug && (
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-sm bg-black/80 p-4 font-mono text-[10px] leading-relaxed text-foreground/80">
              {prettyJson(debugRaw)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
