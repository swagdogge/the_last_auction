import { useEffect, useState } from "react";

// The studio cat. It sits and breathes, swishes its tail, blinks, then curls up
// asleep. Waking, it walks up and down the floorboards for a while, and sits
// down again.
// Every pose is built from the same parts — CatHead (pointed ears, slit eyes,
// whiskers, small nose) and the same stepped tail — so it stays one cat.
// Deliberately self-contained: plain SVG shapes plus SVG's own <animate> /
// <animateTransform>, no CSS classes and no imports beyond React.
const PHASE_MS = { sit: 12000, sleep: 10000, walk: 9000 };
const NEXT = { sit: "sleep", sleep: "walk", walk: "sit" };

// Where it may pace: offsets from the resting spot, kept clear of the easel.
const WALK_MIN = -52;
const WALK_MAX = -6;
const WALK_STEP = 1.2;

const FUR = "#1b1511";
const FUR_DARK = "#100c09";
const SHADE = "#2a2018";
const RIM = "#6d5b45";
const EYE = "#e8dfc8";
const NOSE = "#8d7ba0";
const EAR_INNER = "#5a4038";
const WHISKER = "#b8ac96";

// One tail for the whole animal: stepped, long, rising from the rump.
const TAIL = "M0 0 L-9 0 L-9 -10 L-16 -10";

export default function StudioCat({ x = 74, y = 178 }) {
  const [pose, setPose] = useState("sit");
  const [walk, setWalk] = useState({ x: 0, dir: -1 });

  useEffect(() => {
    const timer = setTimeout(() => setPose((current) => NEXT[current]), PHASE_MS[pose]);
    return () => clearTimeout(timer);
  }, [pose]);

  useEffect(() => {
    if (pose !== "walk") return;
    const id = setInterval(() => {
      setWalk(({ x: spot, dir }) => {
        let nextX = spot + dir * WALK_STEP;
        let nextDir = dir;
        if (nextX <= WALK_MIN) {
          nextX = WALK_MIN;
          nextDir = 1;
        } else if (nextX >= WALK_MAX) {
          nextX = WALK_MAX;
          nextDir = -1;
        }
        return { x: nextX, dir: nextDir };
      });
    }, 60);
    return () => clearInterval(id);
  }, [pose]);

  const mirror = pose === "walk" && walk.dir < 0 ? "scale(-1 1) translate(-18 0)" : undefined;
  const fade = (name) => ({
    opacity: pose === name ? 1 : 0,
    transition: "opacity 600ms ease",
  });

  return (
    <g transform={`translate(${x} ${y}) translate(${walk.x} 0)`} shapeRendering="crispEdges">
      <g transform={mirror}>
        <g style={fade("sit")}>
          <SitPose />
        </g>
        <g style={fade("sleep")}>
          <SleepPose />
        </g>
        <g style={fade("walk")}>
          <WalkPose />
        </g>
      </g>
    </g>
  );
}

/* ---------- the one cat head, used by every pose ---------- */
function CatHead({ x = 0, y = 0, eyes = "open" }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* pointed ears */}
      <polygon points="0,1 2,-6 5,1" fill={FUR} />
      <polygon points="1.3,0 2.2,-3.4 3.5,0" fill={EAR_INNER} />
      <polygon points="7,1 10,-6 12,1" fill={FUR} />
      <polygon points="8.5,0 9.8,-3.4 10.7,0" fill={EAR_INNER} />

      {/* skull */}
      <rect x="0" y="0" width="12" height="10" fill={FUR} />
      <rect x="0" y="0" width="12" height="1" fill={RIM} />
      <rect x="9" y="1" width="3" height="9" fill={SHADE} />

      {/* slit eyes */}
      {eyes === "open" ? (
        <g>
          <animate
            attributeName="opacity"
            values="1;1;0;1;1"
            keyTimes="0;0.86;0.9;0.94;1"
            dur="6.5s"
            repeatCount="indefinite"
          />
          <rect x="2.5" y="4" width="3" height="2" fill={EYE} />
          <rect x="3.5" y="4" width="1" height="2" fill={FUR_DARK} />
          <rect x="7" y="4" width="3" height="2" fill={EYE} />
          <rect x="8" y="4" width="1" height="2" fill={FUR_DARK} />
        </g>
      ) : (
        <>
          <rect x="2.5" y="5" width="3" height="1" fill={RIM} />
          <rect x="7" y="5" width="3" height="1" fill={RIM} />
        </>
      )}

      {/* nose and mouth */}
      <rect x="5" y="7" width="2" height="1" fill={NOSE} />
      <rect x="5.5" y="8" width="1" height="1" fill={RIM} />

      {/* whiskers */}
      <path d="M-4 6.5 H-0.5 M-4 8.5 H-0.5" stroke={WHISKER} strokeWidth="0.7" fill="none" />
      <path d="M12.5 6.5 H16 M12.5 8.5 H16" stroke={WHISKER} strokeWidth="0.7" fill="none" />
    </g>
  );
}

/* ---------- awake: sitting up, breathing, tail in the air ---------- */
function SitPose() {
  return (
    <>
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 -7; -12 0 -7; 0 0 -7; 7 0 -7; 0 0 -7"
          dur="5s"
          repeatCount="indefinite"
        />
        <g transform="translate(0 -7)">
          <path d={TAIL} fill="none" stroke={FUR} strokeWidth="3" strokeLinejoin="miter" />
        </g>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1 1;1 1.02;1 1"
          dur="3.6s"
          repeatCount="indefinite"
        />
        {/* body, upright with a round rump */}
        <rect x="-1" y="-6" width="3" height="6" fill={FUR} />
        <rect x="0" y="-12" width="15" height="12" fill={FUR} />
        <rect x="0" y="-12" width="15" height="1" fill={RIM} />
        <rect x="11" y="-11" width="4" height="11" fill={SHADE} />

        {/* front legs */}
        <rect x="4" y="-7" width="2.5" height="7" fill={FUR} />
        <rect x="8" y="-7" width="2.5" height="7" fill={FUR} />
        <rect x="3" y="-1" width="4" height="1" fill={FUR_DARK} />
        <rect x="8" y="-1" width="4" height="1" fill={FUR_DARK} />

        <CatHead x="2" y="-22" />
      </g>
    </>
  );
}

/* ---------- asleep: curled up, eyes shut, tail wrapped round ---------- */
function SleepPose() {
  return (
    <>
      <g>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1 1;1 1.03;1 1"
          dur="4.5s"
          repeatCount="indefinite"
        />
        {/* tail, curled along the floor in front of the paws */}
        <path
          d="M0 -4 L-7 -4 L-7 -2 L6 -2"
          fill="none"
          stroke={FUR}
          strokeWidth="3"
          strokeLinejoin="miter"
        />

        {/* back, a rounded mound */}
        <rect x="0" y="-9" width="15" height="9" fill={FUR} />
        <rect x="2" y="-11" width="9" height="2" fill={FUR} />
        <rect x="0" y="-9" width="15" height="1" fill={RIM} />
        <rect x="11" y="-8" width="4" height="8" fill={SHADE} />

        <CatHead x="10" y="-9" eyes="shut" />
      </g>

      {[0, 1.4, 2.8].map((delay, i) => (
        <g key={i} transform={`translate(${24 + i * 2} ${-14 - i * 2})`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`${24 + i * 2} ${-14 - i * 2}; ${27 + i * 2} ${-22 - i * 2}`}
            dur="3.6s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.2;0.6;1"
            dur="3.6s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <rect x="0" y="0" width="4" height="1" fill={EYE} />
          <rect x="1" y="1" width="2" height="1" fill={EYE} />
          <rect x="0" y="2" width="4" height="1" fill={EYE} />
        </g>
      ))}
    </>
  );
}

/* ---------- awake: pacing the floorboards ---------- */
function WalkPose() {
  return (
    <>
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 -10; -10 0 -10; 0 0 -10; 10 0 -10; 0 0 -10"
          dur="2.2s"
          repeatCount="indefinite"
        />
        <g transform="translate(0 -10)">
          <path d={TAIL} fill="none" stroke={FUR} strokeWidth="3" strokeLinejoin="miter" />
        </g>
      </g>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -1; 0 0"
          dur="0.84s"
          repeatCount="indefinite"
        />
        <rect x="0" y="-13" width="15" height="9" fill={FUR} />
        <rect x="0" y="-13" width="15" height="1" fill={RIM} />
        <rect x="11" y="-12" width="4" height="8" fill={SHADE} />

        <CatHead x="11" y="-20" />
      </g>

      {[
        { x: 1, step: "4;3;4" },
        { x: 5, step: "3;4;3" },
        { x: 10, step: "3;4;3" },
        { x: 13, step: "4;3;4" },
      ].map((leg) => (
        <rect key={leg.x} x={leg.x} y="-4" width="2.5" height="4" fill={FUR_DARK}>
          <animate attributeName="height" values={leg.step} dur="0.84s" repeatCount="indefinite" />
        </rect>
      ))}
    </>
  );
}