import { useEffect, useState } from "react";
import { paintingForAi } from "@/lib/canvas-image";
import AuctionRoom from "@/components/game/AuctionRoom";
import AuctionResult from "@/components/game/AuctionResult";
import CastIntro from "@/components/game/CastIntro";
import { BIDDERS, PAINTING_COUNT } from "@/lib/bidders";
import { buildAuction } from "@/lib/auction";
import { judgePaintingLocally } from "@/lib/judging";
import { judgePaintingWithKey } from "@/lib/saleroom-ai";

function Examining({ paintingIndex }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-[60vh]">
      <div className="rounded-sm bg-black/60 px-6 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          Lot {paintingIndex + 1}
        </p>
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl">
          The bidders are examining the work
        </h2>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {BIDDERS.map((bidder) => (
          <div
            key={bidder.id}
            className="aspect-[4/5] rounded-sm border border-white/10 bg-black/40"
          />
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: `${i * 220}ms` }}
          />
        ))}
      </div>
      <p className="mx-auto mt-4 w-fit bg-black/60 px-3 py-1.5 text-center text-[11px] text-muted-foreground">
        Six pairs of eyes, one painting, no explanations.
      </p>
    </div>
  );
}

export default function AuctionStage({
  paintingUrl,
  paintingIndex,
  stats,
  onContinue,
  geminiKey = null,
  demoVerdicts = null,
}) {
  const [status, setStatus] = useState("judging");
  const [verdicts, setVerdicts] = useState([]);
  const [auction, setAuction] = useState(null);
  const [revealed, setRevealed] = useState(0);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    let alive = true;

    const settle = (list) => {
      if (!alive) return;
      setVerdicts(list);
      setAuction(buildAuction(list));
      setStatus(paintingIndex === 0 ? "cast" : "reactions");
    };

    const timer = setTimeout(async () => {
      if (demoVerdicts?.length) {
        settle(demoVerdicts);
        return;
      }
      if (geminiKey) {
        try {
          const image = await paintingForAi(paintingUrl);
          const list = await judgePaintingWithKey({ key: geminiKey, image, paintingIndex });
          if (list?.length === BIDDERS.length) return settle(list);
        } catch (error) {
          // The saleroom judges locally when the call cannot be made.
          console.warn("bidder AI unavailable:", error?.message || error);
        }
      }
      settle(judgePaintingLocally(stats, paintingIndex));
    }, demoVerdicts?.length ? 900 : 1600);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [stats, paintingIndex, geminiKey, demoVerdicts, paintingUrl]);

  useEffect(() => {
    if (status !== "reactions" || !verdicts.length) return;
    if (revealed >= verdicts.length) {
      const t = setTimeout(() => setStatus("bidding"), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((n) => n + 1), 900);
    return () => clearTimeout(t);
  }, [status, revealed, verdicts.length]);

  useEffect(() => {
    if (status !== "bidding" || !auction) return;
    if (step >= auction.sequence.length - 1) {
      const t = setTimeout(() => setStatus("closed"), 1300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), step < 0 ? 600 : 750);
    return () => clearTimeout(t);
  }, [status, step, auction]);

  if (status === "judging") {
    return <Examining paintingIndex={paintingIndex} />;
  }

  if (status === "cast") {
    return <CastIntro paintingIndex={paintingIndex} onOpen={() => setStatus("reactions")} />;
  }

  if (status === "closed" && auction) {
    return (
      <AuctionRoom
        paintingIndex={paintingIndex}
        verdicts={verdicts}
        revealed={verdicts.length}
        leaderId={null}
        price={auction.price}
        priceLabel="Hammer price"
        caption="Bidding closed. Their verdicts are in — read them all, then look."
        action={
          <button
            type="button"
            onClick={() => setStatus("result")}
            className="btn-game w-full px-6 py-3.5 text-[13px]"
          >
            Show winner
          </button>
        }
      />
    );
  }

  if (status === "result" && auction) {
    return (
      <AuctionResult
        verdicts={verdicts}
        auction={auction}
        paintingIndex={paintingIndex}
        isLast={paintingIndex === PAINTING_COUNT - 1}
        onContinue={() => onContinue(auction.price)}
      />
    );
  }

  const current = auction && step >= 0 ? auction.sequence[step] : null;

  return (
    <AuctionRoom
      paintingIndex={paintingIndex}
      verdicts={verdicts}
      revealed={revealed}
      leaderId={current?.bidderId ?? null}
      price={current?.amount ?? 0}
      caption={status === "bidding" ? "The bidding is open." : "First impressions."}
    />
  );
}