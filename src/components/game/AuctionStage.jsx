import { useCallback, useEffect, useState } from "react";
import { paintingForAi } from "@/lib/canvas-image";
import AiErrorChoice from "@/components/game/AiErrorChoice";
import AuctionRoom from "@/components/game/AuctionRoom";
import AuctionResult from "@/components/game/AuctionResult";
import CastIntro from "@/components/game/CastIntro";
import { BIDDERS, PAINTING_COUNT } from "@/lib/bidders";
import { buildAuction, buildScriptedAuction, outBidders, passBidders, shuffle } from "@/lib/auction";
import { auctioneerLine } from "@/lib/auctioneer";
import { buildLotRecord } from "@/lib/lot-history";
import { judgePaintingLocally } from "@/lib/judging";
import { judgePaintingWithKey } from "@/lib/saleroom-ai";

function Examining({ paintingIndex, title }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-[60vh]">
      <div className="rounded-sm bg-black/60 px-6 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          Lot {paintingIndex + 1}
        </p>
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl">
          The bidders are examining the work
        </h2>
        {title && <p className="mt-2 font-heading text-lg text-foreground/80">{title}</p>}
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
    </div>
  );
}

export default function AuctionStage({
  paintingUrl,
  paintingTitle = null,
  paintingIndex,
  lotHistory = [],
  stats,
  onContinue,
  geminiKey = null,
  demoVerdicts = null,
}) {
  const [status, setStatus] = useState("judging");
  const [verdicts, setVerdicts] = useState([]);
  const [finalLines, setFinalLines] = useState(null);
  const [auction, setAuction] = useState(null);
  const [revealed, setRevealed] = useState(0);
  const [revealOrder, setRevealOrder] = useState([]);
  const [step, setStep] = useState(-1);
  const [callIndex, setCallIndex] = useState(-1);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [aiError, setAiError] = useState(null);
  const [aiRaw, setAiRaw] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const settle = useCallback(
    (list, scripted = null) => {
      setVerdicts(list);
      setFinalLines(scripted?.final ?? null);
      setAuction(
        scripted?.replay
          ? buildScriptedAuction(list, scripted.replay, scripted.final)
          : buildAuction(list),
      );
      setRevealOrder(shuffle(list.map((v) => v.bidderId)));
      setRevealed(0);
      setStep(-1);
      setCallIndex(-1);
      setRevealIndex(-1);
      setAiError(null);
      setStatus(paintingIndex === 0 ? "cast" : "reactions");
    },
    [paintingIndex],
  );

  const retry = () => {
    setAiError(null);
    setAttempt((value) => value + 1);
  };

  useEffect(() => {
    let alive = true;
    setAiError(null);
    setAiRaw(null);

    const finish = (list, scripted) => {
      if (alive) settle(list, scripted);
    };

    const timer = setTimeout(async () => {
      if (demoVerdicts?.length) {
        finish(demoVerdicts);
        return;
      }
      if (geminiKey) {
        try {
          const image = await paintingForAi(paintingUrl);
          const { verdicts: list, replay, final } = await judgePaintingWithKey({
            key: geminiKey,
            image,
            paintingIndex,
            title: paintingTitle,
            history: lotHistory,
            onRaw: (text) => {
              if (alive) setAiRaw(text);
            },
          });
          if (!Array.isArray(list) || list.length !== BIDDERS.length) {
            throw new Error("Gemini returned no verdicts");
          }
          finish(list, { replay, final });
        } catch (error) {
          if (alive) setAiError(error?.message || "Gemini did not respond.");
          return;
        }
      } else {
        finish(judgePaintingLocally(stats, paintingIndex));
      }
    }, demoVerdicts?.length ? 900 : 1600);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [
    stats,
    paintingIndex,
    paintingTitle,
    lotHistory,
    geminiKey,
    demoVerdicts,
    paintingUrl,
    attempt,
    settle,
  ]);

  // First impressions, in a different order every lot.
  useEffect(() => {
    if (status !== "reactions" || !verdicts.length) return;
    if (revealed >= verdicts.length) {
      const t = setTimeout(() => setStatus("opening"), 850);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((n) => n + 1), 900);
    return () => clearTimeout(t);
  }, [status, revealed, verdicts.length]);

  // Bids arrive at different speeds. At "going twice" any bidders who were
  // holding back step in, one after another, before the hammer falls.
  useEffect(() => {
    if (status !== "bidding" || !auction) return;
    const reveals = auction.reveals ?? [];
    if (step < auction.sequence.length - 1) {
      const next = auction.sequence[step + 1];
      const delay = step < 0 ? 750 : next?.pause ?? 640;
      const t = setTimeout(() => setStep((s) => s + 1), delay);
      return () => clearTimeout(t);
    }
    if (callIndex < 0 || callIndex === 0) {
      const t = setTimeout(() => setCallIndex((i) => i + 1), 1300);
      return () => clearTimeout(t);
    }
    if (callIndex === 1 && revealIndex < reveals.length - 1) {
      const t = setTimeout(() => setRevealIndex((i) => i + 1), reveals[revealIndex + 1]?.pause ?? 1250);
      return () => clearTimeout(t);
    }
    if (callIndex === 1) {
      const t = setTimeout(() => setCallIndex(2), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStatus("closed"), 1100);
    return () => clearTimeout(t);
  }, [status, step, callIndex, revealIndex, auction]);

  if (status === "judging") {
    if (aiError) {
      return (
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-[30vh]">
          <AiErrorChoice
            error={aiError}
            onRetry={retry}
            onFallback={() => {
              setAiRaw(null);
              settle(judgePaintingLocally(stats, paintingIndex));
            }}
            onKeySaved={retry}
          />
        </div>
      );
    }
    return <Examining paintingIndex={paintingIndex} title={paintingTitle} />;
  }

  if (status === "cast") {
    return <CastIntro paintingIndex={paintingIndex} onOpen={() => setStatus("reactions")} />;
  }

  const reveal =
    callIndex === 1 && revealIndex >= 0 ? (auction?.reveals?.[revealIndex] ?? null) : null;
  // Once the hammer call starts, the last reveal is the standing bid.
  const standingReveal =
    callIndex >= 2 && revealIndex >= 0 ? (auction?.reveals?.[revealIndex] ?? null) : null;
  const current =
    reveal ??
    standingReveal ??
    (auction && step >= 0 ? (auction.sequence[step] ?? null) : null);
  // A pass is only revealed once the room actually opens the bidding.
  const passIds = status === "bidding" || status === "closed" ? passBidders(verdicts) : [];
  const auctioneer = {
    line: auctioneerLine({
      status,
      step,
      sequence: auction?.sequence ?? [],
      callIndex,
      price: current?.amount ?? auction?.price ?? 0,
      reveal,
      revealIndex,
    }),
    tone: callIndex >= 0 || status === "closed" ? "final" : "normal",
  };

  if (status === "closed" && auction) {
    const allBids = Object.fromEntries(
      [...auction.sequence, ...(auction.reveals ?? [])].map((bid) => [bid.bidderId, bid.amount]),
    );
    return (
      <AuctionRoom
        paintingIndex={paintingIndex}
        title={paintingTitle}
        verdicts={verdicts}
        revealed={verdicts.length}
        revealOrder={revealOrder}
        debugRaw={aiRaw}
        leaderId={auction.winnerId}
        bidsById={allBids}
        commentsById={auction.commentsById}
        showReactions={false}
        outIds={[
          ...new Set([
            ...outBidders(verdicts, auction.price, auction.winnerId, auction.ceilingsById),
            ...passIds,
          ]),
        ]}
        passIds={passIds}
        price={auction.price}
        priceLabel="Hammer price"
        caption="Bidding closed."
        auctioneer={auctioneer}
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
        onContinue={() =>
          onContinue({
            price: auction.price,
            record: buildLotRecord({ title: paintingTitle, verdicts, auction, final: finalLines }),
          })
        }
      />
    );
  }

  const placed = auction
    ? [
        ...auction.sequence.slice(0, step + 1),
        ...(auction.reveals ?? []).slice(0, revealIndex + 1),
      ]
    : [];
  const bidsById = {};
  const commentsById = {};
  placed.forEach((bid) => {
    bidsById[bid.bidderId] = bid.amount;
    if (bid.comment) commentsById[bid.bidderId] = bid.comment;
  });
  const outIds = outBidders(
    verdicts,
    current?.amount ?? 0,
    current?.bidderId ?? null,
    auction?.ceilingsById,
  );

  const caption =
    status === "bidding"
      ? reveal
        ? "A late hand from the back of the room."
        : "The bidding is open."
      : status === "opening"
        ? "The room falls quiet."
        : "First impressions.";

  return (
    <AuctionRoom
      paintingIndex={paintingIndex}
      title={paintingTitle}
      verdicts={verdicts}
      revealed={revealed}
      revealOrder={revealOrder}
      debugRaw={aiRaw}
      leaderId={current?.bidderId ?? null}
      bidsById={bidsById}
      commentsById={commentsById}
      showReactions={status === "reactions" || status === "opening"}
      outIds={[...new Set([...outIds, ...passIds])]}
      passIds={passIds}
      price={current?.amount ?? 0}
      caption={caption}
      auctioneer={auctioneer}
      action={
        status === "opening" ? (
          <button
            type="button"
            onClick={() => setStatus("bidding")}
            className="btn-game w-full px-6 py-3.5 text-[13px]"
          >
            Start bidding
          </button>
        ) : undefined
      }
    />
  );
}
