import Backdrop from "@/components/game/Backdrop";
import BackdropSlot from "@/components/game/BackdropSlot";
import { Image } from "@/components/ui/image";

// The saleroom. The lot hangs on the easel in the middle of the room: the real
// painting is placed on that painted canvas by BackdropSlot and stays put while
// the page's text scrolls past underneath it.
export default function AuctionBackdrop({ paintingUrl }) {
  return (
    <Backdrop
      overlay={
        paintingUrl ? (
          <BackdropSlot x={130} y={26} w={60} h={80}>
            <Image src={paintingUrl} alt="Your painting, on the easel" className="block h-full w-full" />
          </BackdropSlot>
        ) : null
      }
    >
      <rect width="320" height="200" fill="#4a3a52" />
      <rect width="320" height="12" fill="#3a2b45" />

      {/* the easel the lot hangs on */}
      <rect x="126" y="22" width="68" height="88" fill="#c8bb9d" />
      <rect x="130" y="26" width="60" height="80" fill="#f7f2e6" />
      <rect x="122" y="110" width="76" height="5" fill="#8a6a44" />
      <rect x="122" y="115" width="76" height="2" fill="#6b4d36" />
      <rect x="133" y="112" width="5" height="54" fill="#8a6a44" />
      <rect x="182" y="112" width="5" height="54" fill="#8a6a44" />

      {/* flat hanging lamps */}
      <rect x="52" y="0" width="3" height="26" fill="#3a2b45" />
      <rect x="38" y="26" width="32" height="10" fill="#c9c4bb" />
      <rect x="44" y="36" width="20" height="4" fill="#f7f4ea" />
      <rect x="264" y="0" width="3" height="26" fill="#3a2b45" />
      <rect x="250" y="26" width="32" height="10" fill="#c9c4bb" />
      <rect x="256" y="36" width="20" height="4" fill="#f7f4ea" />

      {/* floor */}
      <rect y="150" width="320" height="50" fill="#3b2b45" />
      <rect y="150" width="320" height="3" fill="#33253c" />

      {/* the auctioneer's podium, off to the side */}
      <rect x="22" y="120" width="52" height="50" fill="#7a4a25" />
      <rect x="16" y="114" width="64" height="8" fill="#c98f5a" />
      <rect x="34" y="106" width="20" height="8" fill="#8a6a44" />
      <rect x="52" y="98" width="4" height="10" fill="#8a6a44" />
      <rect x="50" y="92" width="12" height="8" fill="#c9c4bb" />

      {/* chair backs, front row */}
      <rect x="214" y="176" width="30" height="24" fill="#2f3542" />
      <rect x="248" y="176" width="30" height="24" fill="#2f3542" />
      <rect x="282" y="176" width="30" height="24" fill="#2f3542" />
      <rect x="214" y="174" width="30" height="3" fill="#3b3b3d" />
      <rect x="248" y="174" width="30" height="3" fill="#3b3b3d" />
      <rect x="282" y="174" width="30" height="3" fill="#3b3b3d" />

      {/* cut-out rim, same white edge the portraits have */}
      <rect width="3" height="200" fill="#f7f7f2" />
    </Backdrop>
  );
}