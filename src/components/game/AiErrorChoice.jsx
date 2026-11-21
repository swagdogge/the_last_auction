import { useState } from "react";
import { savePlayerKey } from "@/lib/player-key";

const KEY_URL = "https://aistudio.google.com/apikey";

/** Shown when a Gemini call fails, instead of quietly dropping to the local jury. */
export default function AiErrorChoice({ error, onRetry, onFallback, onKeySaved }) {
  const [changingKey, setChangingKey] = useState(false);
  const [draft, setDraft] = useState("");

  const submitKey = (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    savePlayerKey(trimmed);
    setDraft("");
    setChangingKey(false);
    onKeySaved?.();
  };

  return (
    <div className="rounded-sm border border-white/15 bg-black/60 px-6 py-8 text-center">
      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">AI unavailable</p>
      <h2 className="mt-4 font-heading text-2xl">Gemini didn&apos;t answer</h2>
      <p className="mx-auto mt-3 max-w-md text-[12px] leading-relaxed text-foreground/65">
        {error || "The request failed or returned no response."} Nothing has been decided yet.
      </p>

      {changingKey ? (
        <form onSubmit={submitKey} className="mx-auto mt-6 max-w-sm text-left">
          <label
            htmlFor="gemini-key-retry"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            New Gemini API key
          </label>
          <input
            id="gemini-key-retry"
            type="password"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="AIza…"
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 w-full rounded-sm border border-white/20 bg-black/50 px-3 py-2 font-mono text-[12px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-white/50"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <a
              href={KEY_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline decoration-white/30 underline-offset-4 hover:text-foreground"
            >
              Get a free key
            </a>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="btn-game px-4 py-2 text-[11px] disabled:pointer-events-none disabled:opacity-40"
            >
              Save &amp; retry
            </button>
          </div>
          <button
            type="button"
            onClick={() => setChangingKey(false)}
            className="mt-4 w-full text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 underline decoration-white/30 underline-offset-4 hover:text-foreground"
          >
            Back
          </button>
        </form>
      ) : (
        <div className="mt-7 flex flex-col items-center gap-3">
          <button type="button" onClick={onRetry} className="btn-game px-8 py-3.5 text-[13px]">
            Try again
          </button>
          <button
            type="button"
            onClick={() => setChangingKey(true)}
            className="text-[11px] text-muted-foreground underline decoration-white/30 underline-offset-4 hover:text-foreground"
          >
            Change key
          </button>
          <button
            type="button"
            onClick={onFallback}
            className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 underline decoration-white/30 underline-offset-4 hover:text-foreground"
          >
            Use local fallback instead
          </button>
        </div>
      )}
    </div>
  );
}
