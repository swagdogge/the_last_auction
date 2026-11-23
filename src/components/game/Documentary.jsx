import { useEffect, useMemo, useState } from "react";
import AiErrorChoice from "@/components/game/AiErrorChoice";
import { composeObituary } from "@/lib/obituary";
import { formatMoney } from "@/lib/format";
import { NARRATOR_IDS, writeObituaryWithKey } from "@/lib/saleroom-ai";
import { paintingForAi } from "@/lib/canvas-image";

const NUMERALS = ["I", "II", "III", "IV", "V"];

export default function Documentary({ works, total, onRestart, geminiKey = null }) {
  const local = useMemo(() => composeObituary(works, total), [works, total]);
  const lots = useMemo(
    () => works.map((work) => ({ ...work.record, title: work.title, price: work.price })),
    [works],
  );
  const [narratorId] = useState(
    () => NARRATOR_IDS[Math.floor(Math.random() * NARRATOR_IDS.length)],
  );
  const [aiText, setAiText] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [localFallback, setLocalFallback] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [dots, setDots] = useState(0);

  const loading = Boolean(geminiKey) && !aiText && !aiError && !localFallback;

  const retry = () => {
    setAiError(null);
    setLocalFallback(false);
    setAttempt((value) => value + 1);
  };

  useEffect(() => {
    if (!loading) return;
    setDots(0);
    const timer = setInterval(() => setDots((value) => (value + 1) % 4), 350);
    return () => clearInterval(timer);
  }, [loading, attempt]);

  useEffect(() => {
    if (!geminiKey) return;

    let alive = true;
    setAiError(null);
    setLocalFallback(false);
    Promise.all(works.map((work) => paintingForAi(work.url)))
      .then((paintings) =>
        writeObituaryWithKey({ key: geminiKey, paintings, total, lots, narratorId }),
      )
      .then((result) => {
        if (!alive) return;
        if (!result?.narration) throw new Error("Gemini returned no obituary");
        setAiText(result);
      })
      .catch((error) => {
        if (alive) setAiError(error?.message || "Gemini did not respond.");
      });
    return () => {
      alive = false;
    };
  }, [works, lots, total, geminiKey, narratorId, attempt]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-[56vh]">
        <div className="rounded-sm bg-black/60 px-6 py-8 text-center">
          <p className="font-body text-[17px] text-foreground/85" aria-live="polite">
            (documentary is being generated{".".repeat(dots)})
          </p>
        </div>
      </div>
    );
  }

  const text = aiText || local;
  const segments = text?.segments?.length
    ? text.segments
    : String(text?.narration || "")
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => ({ heading: null, text: paragraph }));

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-[56vh]">
      <div className="rounded-sm bg-black/60 px-6 py-7">
        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          In memoriam
        </p>

        <h1 className="mt-5 text-center font-heading text-4xl leading-tight sm:text-6xl">
          <span className="gold-text">{text?.title ?? "The Complete Works"}</span>
        </h1>
        <div className="gold-rule mx-auto mt-6 h-px w-32" />
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Narrated by {text?.narrator || "The Estate Catalogue"}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {works.map((work, i) => (
            <span
              key={i}
              className={
                work.price > 0
                  ? "money font-mono text-[10px] uppercase tracking-[0.2em]"
                  : "font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
              }
            >
              {NUMERALS[i] ?? i + 1} · {work.price > 0 ? formatMoney(work.price) : "unsold"}
            </span>
          ))}
        </div>
      </div>

      {aiError && geminiKey && (
        <div className="mt-4">
          <AiErrorChoice
            error={aiError}
            onRetry={retry}
            onFallback={() => {
              setLocalFallback(true);
              setAiError(null);
            }}
            onKeySaved={retry}
          />
        </div>
      )}

      <div className="mt-4 min-h-[220px] space-y-5 rounded-sm bg-black/60 px-6 py-6">
        {segments.map((segment, i) => (
          <div key={i}>
            {segment.heading && (
              <h2 className="font-heading text-lg text-foreground/90">{segment.heading}</h2>
            )}
            <p className="font-body text-[17px] leading-[1.75] text-foreground/85 sm:text-lg">
              {segment.text}
            </p>
          </div>
        ))}
        <p className="border-l-2 border-white/30 pl-4 pt-2 font-heading text-lg text-foreground/80">
          {text.epitaph}
        </p>
      </div>

      <div className="mt-4 rounded-sm bg-black/60 px-6 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Total at auction
        </p>
        <p className="money mt-3 font-heading text-4xl sm:text-5xl">{formatMoney(total)}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {works.filter((w) => w.price > 0).length} of {works.length} works found a buyer
        </p>
        <button type="button" onClick={onRestart} className="btn-game mt-8 px-8 py-3 text-[13px]">
          Another life
        </button>
      </div>
    </div>
  );
}