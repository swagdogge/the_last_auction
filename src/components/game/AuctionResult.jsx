import { IMPRESSION_SIZE } from "@/components/game/BidderCard";
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
  const winnerLine = auction.final?.winnerLine || winVerdict?.winLine || winVerdict?.reaction;
  const runnerUpLine =
    auction.final?.runnerUpLine || runVerdict?.lossLine || runVerdict?.reaction;

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
        <div className="mt-3 flex items-center gap-3 rounded-sm bg-black/60 px-4 py-3">
          <div className="h-[72px] w-14 shrink-0 overflow-hidden rounded-sm border border-white/10">
            <CrudePortrait bidderId={winner.id} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/50">
              Winner · {formatMoney(auction.price)}
            </p>
            <p className="font-heading text-base leading-tight">{winner.name}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {winner.occupation}
            </p>
            <p className={cn("mt-1.5 text-[13px] leading-snug text-foreground/90", winner.voice)}>
              &ldquo;{winnerLine}&rdquo;
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-sm bg-black/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">No sale</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70">
            Six people looked at it, and six people kept their hands down. It comes home with you.
          </p>
        </div>
      )}

      {sold && runnerUp && runnerUpLine && (
        <div className="mt-2 flex items-center gap-3 rounded-sm bg-black/60 px-4 py-3">
          <div className="h-[72px] w-14 shrink-0 overflow-hidden rounded-sm border border-white/10">
            <CrudePortrait bidderId={runnerUp.id} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Underbidder
            </p>
            <p className="font-heading text-base leading-tight">{runnerUp.name}</p>
            <p className={cn("mt-1.5 text-[13px] leading-snug text-foreground/70", runnerUp.voice)}>
              &ldquo;{runnerUpLine}&rdquo;
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex justify-center">
        <button type="button" onClick={onContinue} className="btn-game px-8 py-3.5 text-[13px]">
          {isLast ? "The artist dies" : "Next canvas"}
        </button>
      </div>

      <p className="mt-5 bg-black/60 px-4 py-2 text-center text-[10px] uppercase tracking-[0.25em] text-foreground/50">
        The room, unedited
      </p>
      <div className="mt-2 space-y-2">
        {BIDDERS.map((bidder) => {
          const isWinner = bidder.id === auction.winnerId;
          const isRunnerUp = bidder.id === auction.runnerUpId;
          return (
            <div
              key={bidder.id}
              className={cn(
                "flex items-center gap-3 rounded-sm bg-black/60 px-3 py-2",
                isWinner && "border border-primary/50",
              )}
            >
              <div className="h-14 w-11 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black/40">
                <CrudePortrait bidderId={bidder.id} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className="font-heading text-[13px] leading-tight">{bidder.name}</p>
                  {isWinner && (
                    <span className="text-[9px] uppercase tracking-[0.2em] text-primary">
                      Winner
                    </span>
                  )}
                  {isRunnerUp && (
                    <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Underbidder
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 text-[13px] leading-snug text-foreground/85",
                    IMPRESSION_SIZE[bidder.id],
                    bidder.voice,
                  )}
                >
                  &ldquo;{byId[bidder.id]?.reaction}&rdquo;
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
