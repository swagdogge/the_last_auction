import { useState } from "react";
import { clearPlayerKey, savePlayerKey, usePlayerKey } from "@/lib/player-key";

const KEY_URL = "https://aistudio.google.com/apikey";

export default function ApiKeyPanel() {
  const key = usePlayerKey();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  const save = (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    savePlayerKey(trimmed);
    setDraft("");
    setOpen(false);
  };

  if (key) {
    return (
      <div className="mx-auto mt-8 w-full max-w-xl rounded-sm border border-white/15 bg-black/60 px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">AI bidders</p>
        <p className="mt-2 text-[12px] leading-relaxed text-foreground/70">
          Your Gemini key is loaded. Six AI bidders will judge each canvas and write the
          documentary, on your own quota.
        </p>
        <button
          type="button"
          onClick={clearPlayerKey}
          className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline decoration-white/30 underline-offset-4 hover:text-foreground"
        >
          Remove key, use the local jury
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-xl rounded-sm border border-white/15 bg-black/60 px-4 py-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">
          Optional · AI bidders
        </span>
        <span className="font-mono text-[12px] leading-none text-muted-foreground">
          {open ? "–" : "+"}
        </span>
      </button>

      <p className="mt-2 text-[12px] leading-relaxed text-foreground/65">
        Without a key the game is free and complete: the saleroom's local jury judges every
        canvas. With your own Google Gemini key, six AI bidders look at each painting and write
        the obituary.
      </p>

      {open && (
        <form onSubmit={save} className="mt-4">
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

          <div className="mt-3 flex items-center justify-between gap-3">
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

          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Four requests per life: one per canvas, one for the documentary. The key is kept in
            this tab's memory only, never saved, and sent to nobody but Google. Anything typed
            into a web page is visible to that page, so use a key you can revoke.
          </p>
        </form>
      )}
    </div>
  );
}