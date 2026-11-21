import BidderCard from "@/components/game/BidderCard";
import CrudePortrait from "@/components/game/CrudePortrait";
import { BIDDERS } from "@/lib/bidders";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AuctionResult({ verdicts, auction, paintingIndex, onContinue, isLast }) {
  const winner = BIDDERS.find((b) => b.id === auction.winnerId);
  const runnerUp = BIDDERS.find((b) => b.id === auction.runnerUpId);
  const winVerdict = verdicts.find((v) => v.bidderId === auction.winnerId);
  const runVerdict = verdicts.find((v) => v.bidderId === auction.runnerUpId);
  const sold = Boolean(winner);
  const byId = Object.fromEntries(verdicts.map((v) => [v.bidderId, v]));

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-[60vh]">
      <div className="rounded-sm bg-black/60 px-6 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          {sold ? "Sold" : "No sale"}
        </p>
        <h2 className="mt-3 font-heading text-5xl sm:text-6xl">
          <span className={sold ? "money" : "text-muted-foreground"}>
            {sold ? formatMoney(auction.price) : "Passed"}
          </span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {sold
            ? `Hammer price, lot ${paintingIndex + 1}`
            : "Nobody in the room raised a hand. The painting goes back to the studio."}
        </p>
      </div>

      {sold ? (
        <div className="mt-4 rounded-sm bg-black/60 p-5">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-white/10">
              <CrudePortrait bidderId={winner.id} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">Winner</p>
              <p className="font-heading text-lg leading-tight">{winner.name}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {winner.occupation}
              </p>
            </div>
          </div>
          <p className={cn("mt-4 text-lg leading-snug text-foreground/90", winner.voice)}>
            “{winVerdict?.winLine}”
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-sm bg-black/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">No sale</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70">
            Six people looked at it, and six people kept their hands down. It comes home with you.
          </p>
        </div>
      )}

      {sold && runnerUp && runVerdict?.lossLine && (
        <div className="mt-4 rounded-sm bg-black/60 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Underbidder · {runnerUp.name}
          </p>
          <p className={cn("mt-2 text-base leading-relaxed text-foreground/70", runnerUp.voice)}>
            “{runVerdict.lossLine}”
          </p>
        </div>
      )}

      <p className="mt-8 bg-black/60 px-4 py-2 text-center text-[10px] uppercase tracking-[0.25em] text-foreground/50">
        The room, unedited
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BIDDERS.map((bidder) => (
          <BidderCard
            key={bidder.id}
            bidder={bidder}
            state={bidder.id === auction.winnerId ? "win" : "idle"}
            line={byId[bidder.id]?.reaction}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={onContinue} className="btn-game px-8 py-3.5 text-[13px]">
          {isLast ? "The artist dies" : "Next canvas"}
        </button>
      </div>
    </div>
  );
}