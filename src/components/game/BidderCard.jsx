import CrudePortrait from "@/components/game/CrudePortrait";
import TypedLine from "@/components/game/TypedLine";
import { cn } from "@/lib/utils";

export const IMPRESSION_SIZE = {
  julian: "text-[15px]",
  leopold: "text-[16px]",
};

export default function BidderCard({
  bidder,
  revealed = true,
  labels = true,
  state = "idle",
  line,
  bid,
  passed = false,
  className,
}) {
  const isLead = state === "lead";
  const isWin = state === "win";
  const isOut = state === "out";

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-sm border bg-card/70 transition-all duration-500",
        isLead || isWin
          ? "border-primary/70 shadow-[3px_3px_0_0_hsl(0_0%_100%/0.3)]"
          : isOut
            ? "border-white/5 opacity-50"
            : "border-white/10",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-black/40">
        <CrudePortrait
          bidderId={bidder.id}
          className={cn(
            "transition-all duration-700",
            !revealed
              ? "blur-md grayscale"
              : isOut
                ? "grayscale"
                : isLead || isWin
                  ? "grayscale-0"
                  : "grayscale-[15%] group-hover:scale-[1.02]",
          )}
        />

        {labels && (
          <div className="lower-third absolute inset-x-0 bottom-0 px-3 pb-3 pt-10">
            <div
              className="mb-2 h-[2px] w-8"
              style={{ backgroundColor: revealed ? bidder.accent : "hsl(0 0% 100% / 0.35)" }}
            />
            <p className="font-heading text-[15px] leading-tight text-foreground">
              {revealed ? bidder.name : "Bidder undisclosed"}
            </p>
            <p className="mt-1 text-[9px] uppercase leading-snug tracking-[0.18em] text-muted-foreground">
              {revealed ? bidder.occupation : "Occupation withheld"}
            </p>
          </div>
        )}

        {(bid !== undefined || passed) && (
          <div
            className={cn(
              "absolute right-2 top-2 rounded-sm border px-2 py-1 font-mono leading-tight",
              passed
                ? "border-white/20 bg-[#141414] text-[9px] uppercase tracking-[0.14em] text-foreground/70"
                : "text-[10px] font-medium",
              isLead || isWin
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/20 bg-[#141414] text-foreground/85",
            )}
          >
            {passed ? "PASS" : bid}
          </div>
        )}
        {isWin && (
          <div className="absolute right-2 top-9 rounded-sm bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
            Sold
          </div>
        )}
      </div>

      {line && (
        <TypedLine
          text={line}
          className={cn("flex-1", IMPRESSION_SIZE[bidder.id], bidder.voice)}
        />
      )}
    </div>
  );
}
