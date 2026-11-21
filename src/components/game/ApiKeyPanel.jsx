import { useState } from "react";
import { clearPlayerKey, savePlayerKey, usePlayerKey } from "@/lib/player-key";

const KEY_URL = "https://aistudio.google.com/apikey";

export default function ApiKeyPanel({ onContinue }) {
  const key = usePlayerKey();
  const [draft, setDraft] = useState("");

  const save = (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    savePlayerKey(trimmed);
    setDraft("");
    onContinue();
  };

  const useLocalJury = () => {
    clearPlayerKey();
    onContinue();
  };

  if (key) {
    return (
      <div className="w-full max-w-xl rounded-sm border border-white/15 bg-black/60 px-6 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">AI bidders</p>
        <p className="mt-3 text-[13px] leading-relaxed text-foreground/70">
          Your Gemini key is loaded. Six AI bidders will judge each canvas and write the
          documentary, on your own quota.
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="btn-game mt-8 px-8 py-3.5 text-[13px]"
        >
          Continue to the studio
        </button>
        <button
          type="button"
          onClick={useLocalJury}
          className="mt-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline decoration-white/30 underline-offset-4 hover:text-foreground"
        >
          Remove key, use the local jury
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-sm border border-white/15 bg-black/60 px-6 py-8">
      <p className="text-center text-[10px] uppercase tracking-[0.22em] text-foreground/50">
        Before you enter the studio
      </p>
      <h2 className="mt-3 text-center font-heading text-2xl">Who should judge your work?</h2>
      <p className="mt-4 text-[12px] leading-relaxed text-foreground/65">
        With your own Google Gemini key, six AI bidders look at each painting. Without one, the
        saleroom&apos;s local jury judges every canvas. The game is free and complete either way.
      </p>

      <form onSubmit={save} className="mt-7">
        <label
          htmlFor="gemini-key"
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          Gemini API key
        </label>
        <input
          id="gemini-key"
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
            Use my key
          </button>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
          The key is only used to ask Google&apos;s Gemini API to judge each canvas: your browser
          talks to Google directly, with no server or account in between. Four requests per life:
          one per canvas, one for the documentary. The key is kept in this tab&apos;s memory only,
          never saved, and sent to nobody but Google. Anything typed into a web page is visible to
          that page, so use a key you can revoke.
        </p>
      </form>

      <div className="mt-6 border-t border-white/10 pt-5 text-center">
        <button
          type="button"
          onClick={useLocalJury}
          className="text-[11px] text-muted-foreground underline decoration-white/30 underline-offset-4 hover:text-foreground"
        >
          No thanks, use local fallback
        </button>
      </div>
    </div>
  );
}
