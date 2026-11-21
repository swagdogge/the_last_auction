import { useEffect, useMemo, useState } from "react";
import { composeObituary } from "@/lib/obituary";
import { formatMoney } from "@/lib/format";
import { writeObituaryWithKey } from "@/lib/saleroom-ai";
import { paintingForAi } from "@/lib/canvas-image";

const NUMERALS = ["I", "II", "III", "IV", "V"];

export default function Documentary({ works, total, onRestart, geminiKey = null }) {
  const local = useMemo(() => composeObituary(works, total), [works, total]);
  const [aiText, setAiText] = useState(null);

  useEffect(() => {
    if (!geminiKey) return;

    let alive = true;
    Promise.all(works.map((work) => paintingForAi(work.url)))
      .then((paintings) => writeObituaryWithKey({ key: geminiKey, paintings, total }))
      .then((result) => {
        if (alive && result?.narration) setAiText(result);
      })
      .catch(() => {
        // The local obituary already stands in.
      });
    return () => {
      alive = false;
    };
  }, [works, total, geminiKey]);

  const text = aiText || local;

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

      <div className="mt-4 min-h-[220px] space-y-5 rounded-sm bg-black/60 px-6 py-6">
        {text.narration.split(/\n+/).filter(Boolean).map((para, i) => (
          <p key={i} className="font-body text-[17px] leading-[1.75] text-foreground/85 sm:text-lg">
            {para}
          </p>
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