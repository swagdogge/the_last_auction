import BidderCard from "@/components/game/BidderCard";
import { BIDDERS } from "@/lib/bidders";

export default function CastIntro({ paintingIndex, onOpen }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-[60vh]">
      <div className="rounded-sm bg-black/60 px-6 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">The saleroom</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-heading text-3xl leading-tight sm:text-5xl">
          Six bidders. <span className="text-foreground/55">One unknown artist.</span>
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {BIDDERS.map((bidder) => (
          <BidderCard key={bidder.id} bidder={bidder} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={onOpen} className="btn-game px-8 py-3.5 text-[13px]">
          Show them lot {paintingIndex + 1}
        </button>
      </div>
    </div>
  );
}