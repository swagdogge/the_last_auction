import { cn } from "@/lib/utils";

// The saleroom's own blocky cut-out, drawn from the same flat shapes and
// colours as the bidders. He never speaks unless the room is listening.
export default function Auctioneer({ line, tone = "normal" }) {
  const final = tone === "final";

  return (
    <div
      className={cn(
        "mt-4 flex items-stretch gap-3 overflow-hidden rounded-sm border bg-black/75 px-3 py-3 transition-colors duration-500 sm:px-4",
        final ? "border-primary/70" : "border-white/15",
      )}
    >
      <svg
        viewBox="0 0 64 72"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="h-16 w-14 shrink-0 sm:h-20 sm:w-16"
      >
        {/* podium */}
        <rect x="2" y="54" width="60" height="16" fill="#5f4f47" />
        <rect x="2" y="54" width="60" height="4" fill="#8a6a45" />
        {/* suit and lapels */}
        <rect x="16" y="28" width="32" height="28" fill="#241c15" />
        <rect x="21" y="30" width="7" height="20" fill="#3c3444" />
        <rect x="36" y="30" width="7" height="20" fill="#3c3444" />
        <rect x="28" y="30" width="8" height="18" fill="#f7f4e8" />
        <rect x="28" y="32" width="8" height="4" fill="#d72048" />
        {/* head */}
        <rect x="28" y="23" width="8" height="7" fill="#f9cf9d" />
        <rect x="22" y="7" width="20" height="18" fill="#f9cf9d" />
        <rect x="20" y="5" width="24" height="7" fill="#c5b7cb" />
        <rect x="20" y="10" width="3" height="10" fill="#c5b7cb" />
        <rect x="41" y="10" width="3" height="10" fill="#c5b7cb" />
        <rect x="27" y="15" width="3" height="2" fill="#0d0305" />
        <rect x="35" y="15" width="3" height="2" fill="#0d0305" />
        <rect x="30" y="20" width="6" height="2" fill="#7d322f" />
        {/* gavel and block */}
        <rect x="47" y="34" width="3" height="17" fill="#8a6a45" />
        <rect x="43" y="30" width="11" height="6" fill="#6b4d36" />
        <rect x="43" y="51" width="12" height="3" fill="#c5b7cb" />
      </svg>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          auctioneer
        </p>
        <p
          className={cn(
            "mt-1.5 font-heading leading-tight text-foreground/95",
            final ? "money text-xl sm:text-3xl" : "text-[15px] sm:text-xl",
          )}
        >
          &ldquo;{line}&rdquo;
        </p>
        {final && <div className="mt-2 h-[2px] w-16 bg-primary" />}
      </div>
    </div>
  );
}
