import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import PaintCanvas from "@/components/game/PaintCanvas";
import Palette from "@/components/game/Palette";
import BrushTools from "@/components/game/BrushTools";
import BidderCard from "@/components/game/BidderCard";
import AuctionStage from "@/components/game/AuctionStage";
import Documentary from "@/components/game/Documentary";
import ApiKeyPanel from "@/components/game/ApiKeyPanel";
import DemoButton from "@/components/game/DemoButton";
import PresetPicker from "@/components/game/PresetPicker";
import MenuButton from "@/components/game/MenuButton";
import AtelierBackdrop from "@/components/game/AtelierBackdrop";
import AuctionBackdrop from "@/components/game/AuctionBackdrop";
import MuseumBackdrop from "@/components/game/MuseumBackdrop";
import Easel from "@/components/game/Easel";
import NameWorkDialog from "@/components/game/NameWorkDialog";
import { BIDDERS, PAINTING_COUNT } from "@/lib/bidders";
import { opacityFromTransparency } from "@/lib/studio-tools";
import { usePlayerKey } from "@/lib/player-key";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Last Auction — a life in three paintings" },
      {
        name: "description",
        content:
          "Paint three works. Six AI bidders judge them at auction. The hammer decides what your life was worth.",
      },
    ],
  }),
  component: Game,
});

function Game() {
  const [phase, setPhase] = useState("title");
  const [works, setWorks] = useState([]);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [currentStats, setCurrentStats] = useState(null);
  const [color, setColor] = useState("#0d0305");
  const [size, setSize] = useState(20);
  const [transparency, setTransparency] = useState(0);
  const [tool, setTool] = useState("brush");
  const [canvasWidth, setCanvasWidth] = useState(430);
  const playerKey = usePlayerKey();
  const [demoMode, setDemoMode] = useState(false);
  const [pickedPreset, setPickedPreset] = useState(null);
  const [currentPreset, setCurrentPreset] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [naming, setNaming] = useState(false);
  const canvasRef = useRef(null);

  const total = works.reduce((sum, w) => sum + w.price, 0);
  const lotHistory = useMemo(() => works.map((work) => work.record).filter(Boolean), [works]);

  const handleSell = () => {
    if (demoMode) {
      if (!pickedPreset) return;
      setCurrentPreset(pickedPreset);
      setCurrentUrl(pickedPreset.url);
      setCurrentTitle(pickedPreset.title);
      setCurrentStats(null);
      setPhase("auction");
      return;
    }
    if (!canvasRef.current) return;
    setNaming(true);
  };

  const confirmTitle = (title) => {
    if (!canvasRef.current) return;
    setCurrentTitle(title.trim() || `Untitled ${works.length + 1}`);
    setCurrentUrl(canvasRef.current.toDataURL());
    setCurrentStats(canvasRef.current.analyze());
    setNaming(false);
    setPhase("auction");
  };

  const handleAuctionDone = ({ price, record }) => {
    const next = [...works, { url: currentUrl, title: currentTitle, price, record }];
    setWorks(next);
    setCurrentUrl(null);
    setCurrentTitle("");
    setCurrentStats(null);
    setCurrentPreset(null);
    setPickedPreset(null);
    setPhase(next.length >= PAINTING_COUNT ? "documentary" : "paint");
  };

  const resetLife = () => {
    setWorks([]);
    setCurrentUrl(null);
    setCurrentTitle("");
    setCurrentStats(null);
    setCurrentPreset(null);
    setPickedPreset(null);
    setNaming(false);
  };

  // Starting from the title always means a real game, never a leftover demo.
  const startGame = () => {
    resetLife();
    setDemoMode(false);
    setPhase("key");
  };

  const startDemo = () => {
    resetLife();
    setDemoMode(true);
    setPhase("paint");
  };

  const restart = () => {
    resetLife();
    // "Another life" stays in whichever mode the player is already in.
    setPhase("paint");
  };

  const goToMenu = () => {
    resetLife();
    setDemoMode(false);
    setPhase("title");
  };

  return (
    <div className="min-h-screen text-foreground">
      <div className="min-h-screen">
        {phase !== "title" && <MenuButton onConfirm={goToMenu} />}

        {phase === "title" && (
          <>
            <MuseumBackdrop />
            <TitleScreen onStart={startGame} onStartDemo={startDemo} />
          </>
        )}

        {phase === "key" && (
          <>
            <AtelierBackdrop />
            <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
              <ApiKeyPanel onContinue={() => setPhase("paint")} />
            </div>
          </>
        )}

        {phase === "paint" && (
          <>
            <AtelierBackdrop showCat />
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
            <header className="flex items-end justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">The studio</p>
                <h1 className="mt-1 font-heading text-2xl sm:text-3xl">
                  Canvas {works.length + 1}{" "}
                  <span className="text-muted-foreground/50">/ {PAINTING_COUNT}</span>
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden gap-1.5 sm:flex">
                  {Array.from({ length: PAINTING_COUNT }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 w-6 rounded-full",
                        i < works.length ? "bg-primary" : "bg-white/15",
                      )}
                    />
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Earned
                  </p>
                  <p className="money font-mono text-base sm:text-lg">
                    {formatMoney(total)}
                  </p>
                </div>
              </div>
            </header>

            {demoMode ? (
              <div className="mx-auto mt-6 max-w-4xl">
                <PresetPicker selectedId={pickedPreset?.id} onPick={setPickedPreset} />
              </div>
            ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-start">
              <div className="order-2 lg:order-1 lg:pt-8">
                <BrushTools
                  color={color}
                  size={size}
                  tool={tool}
                  transparency={transparency}
                  canvasWidth={canvasWidth}
                  onSize={setSize}
                  onTool={setTool}
                  onTransparency={setTransparency}
                  onUndo={() => canvasRef.current?.undo()}
                  onClear={() => canvasRef.current?.clear()}
                />
              </div>

              <div className="order-1 lg:order-2">
                <Easel>
                  <PaintCanvas
                    ref={canvasRef}
                    color={color}
                    size={size}
                    tool={tool}
                    opacity={opacityFromTransparency(transparency)}
                    onDisplayWidth={setCanvasWidth}
                  />
                </Easel>
              </div>

              <div className="order-3 lg:pt-8">
                <Palette color={color} onChange={setColor} />
              </div>
            </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleSell}
                disabled={demoMode && !pickedPreset}
                className="btn-game px-8 py-3.5 text-[13px] disabled:pointer-events-none disabled:opacity-40"
              >
                Send to auction
              </button>
              <p className="text-[11px] text-muted-foreground">
                {demoMode && !pickedPreset
                  ? "Choose a work first."
                  : "Once it leaves the easel, it is out of your hands."}
              </p>
            </div>
            </div>
          </>
        )}

        {phase === "auction" && currentUrl && (
          <>
            <AuctionBackdrop paintingUrl={currentUrl} />
            <AuctionStage
              paintingUrl={currentUrl}
              paintingTitle={currentTitle}
              paintingIndex={works.length}
              lotHistory={lotHistory}
              stats={currentStats}
              geminiKey={demoMode ? null : playerKey}
              demoVerdicts={currentPreset?.verdicts}
              onContinue={handleAuctionDone}
            />
          </>
        )}

        {phase === "documentary" && (
          <>
            <MuseumBackdrop works={works} />
            <Documentary
              works={works}
              total={total}
              geminiKey={demoMode ? null : playerKey}
              onRestart={restart}
            />
          </>
        )}

        {naming && (
          <NameWorkDialog
            number={works.length + 1}
            onConfirm={confirmTitle}
            onCancel={() => setNaming(false)}
          />
        )}
      </div>
    </div>
  );
}

function TitleScreen({ onStart, onStartDemo }) {
  const giveAGoClass = "text-[#e6e6fa] underline-offset-2 hover:underline";
  const base44Class = "text-[#ffa500] underline-offset-2 hover:underline";

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-2xl rounded-sm bg-black/60 px-6 py-8 sm:px-10">
        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          Game Garage (<a href="https://www.giveago.co/" target="_blank" rel="noreferrer" className={giveAGoClass}>Give(a)Go</a> x <a href="https://app.base44.com/" target="_blank" rel="noreferrer" className={base44Class}>Base44</a>)
        </p>

        <h1 className="mt-8 text-center font-heading text-5xl leading-[0.95] sm:text-7xl md:text-8xl">
          The Last <span className="text-foreground/55">Auction</span>
        </h1>

        <div className="gold-rule mx-auto mt-8 h-px w-40" />

        <p className="mx-auto mt-8 max-w-xl text-center text-[15px] leading-relaxed text-foreground/70">
          You have {PAINTING_COUNT} canvases and one lifetime. Paint each one, hand it to the
          saleroom, and let six bidders with very particular taste decide what it is worth.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {BIDDERS.map((bidder) => (
          <BidderCard key={bidder.id} bidder={bidder} labels={false} />
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStart}
            className="btn-game px-10 py-4 text-[15px]"
          >
            Enter the studio
          </button>
          <DemoButton onStart={onStartDemo} />
        </div>
        <p className="text-center text-[11px] text-muted-foreground [text-shadow:0_0_2px_#000,0_1px_2px_#000]">
          Vibecoded by swagdogge with Base44<br />during the &quot;Game Garage (Give(a)Go x Base44)&quot; Event<br />21.11.2026, Heilbronn<br />no squirrels harmed
        </p>
        {import.meta.env.DEV && (
          <Link
            to="/standalone"
            className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 underline underline-offset-4"
          >
            Download the standalone project
          </Link>
        )}
      </div>
    </div>
  );
}