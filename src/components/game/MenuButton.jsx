import { useState } from "react";

// Leaves the running game and returns to the title screen. It asks first, so a
// stray click mid-painting never throws away a life.
export default function MenuButton({ onConfirm }) {
  const [asking, setAsking] = useState(false);

  return (
    <div className="pointer-events-auto fixed right-3 top-3 z-50 flex flex-col items-end gap-2 sm:right-5 sm:top-5">
      {!asking ? (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="btn-game px-3 py-2 text-[10px]"
        >
          Main menu
        </button>
      ) : (
        <div className="rounded-sm border-2 border-white/70 bg-black/85 px-3 py-2.5 text-right shadow-[4px_4px_0_0_rgba(0,0,0,0.55)]">
          <p className="font-heading text-[12px] leading-tight text-foreground">
            Are you sure?
          </p>
          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
            This game will be lost.
          </p>
          <div className="mt-2.5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="rounded-sm border border-white/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-foreground/80 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-sm border border-white bg-primary px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-primary-foreground hover:brightness-110"
            >
              Yes, leave
            </button>
          </div>
        </div>
      )}
    </div>
  );
}