import CrudePortrait from "@/components/game/CrudePortrait";
import { BIDDERS } from "@/lib/bidders";

export default function CastIntro({ paintingIndex, onOpen }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10">
      <div className="rounded-sm bg-black/60 px-5 py-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">The saleroom</p>
        <h2 className="mx-auto mt-2 max-w-2xl font-heading text-2xl leading-tight sm:text-4xl">
          Six bidders. <span className="text-foreground/55">One unknown artist.</span>
        </h2>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-6">
        {BIDDERS.map((bidder) => (
          <div
            key={bidder.id}
            className="rounded-sm border border-white/10 bg-black/60 px-2 py-2 text-center"
          >
            <div className="mx-auto aspect-[4/5] w-12 overflow-hidden rounded-sm border border-white/10 sm:w-14">
              <CrudePortrait bidderId={bidder.id} />
            </div>
            <p className="mt-1.5 font-heading text-[10px] leading-tight">{bidder.name}</p>
            <p className="mt-1 text-[8px] uppercase leading-tight tracking-[0.1em] text-muted-foreground">
              {bidder.occupation}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <button type="button" onClick={onOpen} className="btn-game px-8 py-3.5 text-[13px]">
          Show them lot {paintingIndex + 1}
        </button>
      </div>
    </div>
  );
}
