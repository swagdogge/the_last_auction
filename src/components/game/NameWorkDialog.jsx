import { useState } from "react";

export default function NameWorkDialog({ number, onConfirm, onCancel }) {
  const [title, setTitle] = useState("");

  const submit = (event) => {
    event.preventDefault();
    onConfirm(title);
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-title-heading"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-sm border border-white/15 bg-[#0d0d0d] px-6 py-8"
      >
        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          Canvas {number}
        </p>
        <h2 id="work-title-heading" className="mt-4 text-center font-heading text-2xl">
          Name your work
        </h2>
        <p className="mt-3 text-center text-[12px] leading-relaxed text-foreground/65">
          The saleroom will see this title alongside the painting. Leave it blank for an untitled
          work.
        </p>

        <label
          htmlFor="work-title"
          className="mt-7 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          Title
        </label>
        <input
          id="work-title"
          type="text"
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={80}
          placeholder="Untitled"
          className="mt-1.5 w-full rounded-sm border border-white/20 bg-black/50 px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-white/50"
        />

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] text-muted-foreground underline decoration-white/30 underline-offset-4 hover:text-foreground"
          >
            Keep painting
          </button>
          <button type="submit" className="btn-game px-6 py-2.5 text-[12px]">
            Send to auction
          </button>
        </div>
      </form>
    </div>
  );
}
