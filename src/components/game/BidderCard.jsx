import CrudePortrait from "@/components/game/CrudePortrait";
import { cn } from "@/lib/utils";

export default function BidderCard({
  bidder,
  revealed = true,
  labels = true,
  state = "idle",
  line,
  bid,
  className,
}) {
  const isLead = state === "lead";
  const isWin = state === "win";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-sm border bg-card/70 transition-all duration-500",
        isLead || isWin
          ? "border-primary/70 shadow-[3px_3px_0_0_hsl(0_0%_100%/0.3)]"
          : "border-white/10",
        state === "out" && "opacity-45",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
        <CrudePortrait
          bidderId={bidder.id}
          className={cn(
            "transition-all duration-700",
            revealed ? "grayscale-[15%]" : "blur-md grayscale",
            isLead || isWin ? "grayscale-0" : "group-hover:scale-[1.02]",
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

        {isLead && (
          <div className="absolute right-2 top-2 rounded-sm bg-primary px-2 py-1 font-mono text-[10px] font-medium text-primary-foreground">
            {bid}
          </div>
        )}
        {isWin && (
          <div className="absolute right-2 top-2 rounded-sm bg-primary px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
            Sold
          </div>
        )}
      </div>

      {line && (
        <p
          className={cn(
            "border-t border-white/10 bg-black/30 px-3 py-2.5 text-[13px] leading-snug text-foreground/85",
            bidder.voice,
          )}
        >
          “{line}”
        </p>
      )}
    </div>
  );
}