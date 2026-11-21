import Backdrop from "@/components/game/Backdrop";
import BackdropSlot from "@/components/game/BackdropSlot";
import { Image } from "@/components/ui/image";

// The three frames on the gallery wall, in backdrop units. Each inner mat is
// 48x64, the same 3:4 shape as a canvas, so a work drops straight into it.
const FRAMES = [
  { x: 39, y: 35 },
  { x: 136, y: 27 },
  { x: 233, y: 35 },
];

// The gallery: three framed works, a bench, a rope and a tiled floor. On the
// title screen the frames hang empty (drawn blocks); at the end of a life the
// finished works hang in them, fixed in place while the text scrolls past.
export default function MuseumBackdrop({ works = [] }) {
  return (
    <Backdrop
      overlay={works.map((work, i) =>
        work && FRAMES[i] ? (
          <BackdropSlot key={i} x={FRAMES[i].x} y={FRAMES[i].y} w={48} h={64}>
            <Image src={work.url} alt={`Work ${i + 1}`} className="block h-full w-full" />
          </BackdropSlot>
        ) : null,
      )}
    >
      <rect width="320" height="200" fill="#cfc7b4" />
      <rect width="320" height="12" fill="#dcd6c4" />

      {/* left frame */}
      <rect x="34" y="30" width="58" height="74" fill="#c8bb9d" />
      <rect x="39" y="35" width="48" height="64" fill="#f7f2e6" />
      <rect x="45" y="43" width="20" height="14" fill="#8c1c13" />
      <rect x="65" y="49" width="16" height="26" fill="#2f6b4f" />
      <rect x="45" y="65" width="36" height="8" fill="#1f4e79" />

      {/* centre frame, hung a little high */}
      <rect x="131" y="22" width="58" height="74" fill="#c8bb9d" />
      <rect x="136" y="27" width="48" height="64" fill="#f7f2e6" />
      <rect x="142" y="35" width="36" height="18" fill="#c9a0dc" />
      <rect x="142" y="57" width="16" height="32" fill="#d64b3f" />
      <rect x="162" y="71" width="16" height="18" fill="#7fae7a" />

      {/* right frame */}
      <rect x="228" y="30" width="58" height="74" fill="#c8bb9d" />
      <rect x="233" y="35" width="48" height="64" fill="#f7f2e6" />
      <rect x="239" y="43" width="36" height="10" fill="#5b8fc9" />
      <rect x="239" y="57" width="18" height="30" fill="#8c1c13" />
      <rect x="261" y="63" width="14" height="24" fill="#7a4a25" />

      {/* tiled floor */}
      <rect y="146" width="320" height="54" fill="#9a8f7c" />
      <rect y="146" width="320" height="4" fill="#8a7f6c" />
      <rect y="172" width="320" height="3" fill="#8a7f6c" />
      <rect x="80" y="146" width="3" height="54" fill="#8a7f6c" />
      <rect x="200" y="146" width="3" height="54" fill="#8a7f6c" />

      {/* rope barrier */}
      <rect x="24" y="140" width="4" height="40" fill="#c9c4bb" />
      <rect x="292" y="140" width="4" height="40" fill="#c9c4bb" />
      <rect x="26" y="154" width="268" height="3" fill="#a94a3d" />

      {/* bench */}
      <rect x="118" y="152" width="84" height="10" fill="#8a6a44" />
      <rect x="124" y="162" width="6" height="22" fill="#6b4d36" />
      <rect x="190" y="162" width="6" height="22" fill="#6b4d36" />

      {/* cut-out rim, same white edge the portraits have */}
      <rect width="3" height="200" fill="#f7f7f2" />
    </Backdrop>
  );
}