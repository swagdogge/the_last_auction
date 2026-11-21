import { BIDDERS } from "./bidders.js";
import { LOCAL_JURY_MAX_BID } from "./local-jury.js";
import { coveragePhrase } from "./paint-analysis.js";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const round250 = (v) => Math.round(v / 250000) * 250000;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function priceFor(score, ceiling) {
  if (score < 0.2) return 0;
  const curve = 0.08 + Math.pow(score, 1.5) * 0.92;
  return Math.max(500000, round250(ceiling * curve));
}

const TASTE = {
  gordon: (s) => clamp01(0.1 + s.warm * 1.1 + (s.coverage > 0.12 ? 0.12 : 0) - s.variety * 0.02),
  julian: (s) =>
    clamp01(0.16 + (1 - s.coverage) * 0.72 + (s.variety <= 2 ? 0.26 : 0) + s.saturation * 0.22),
  leopold: (s) => clamp01(0.08 + s.coverage * 0.52 + s.edge * 0.62 + s.symmetry * 0.26),
  marguerite: (s) =>
    clamp01(0.1 + s.edge * 0.5 + (1 - s.symmetry) * 0.42 + s.variety * 0.07 + (s.coverage > 0.04 ? 0.1 : 0)),
  ines: (s) => clamp01(0.08 + s.banding * 0.62 + (s.cool + s.green) * 0.55 + (s.coverage > 0.18 ? 0.1 : 0)),
  chad: (s) => clamp01(0.1 + s.saturation * 0.66 + (s.variety <= 2 ? 0.2 : 0) + s.coverage * 0.28),
};

const LINES = {
  gordon: {
    rave: [
      "FINALLY. A {color} plate of something. I could serve this.",
      "That {color} is a reduction. That is a sauce. THAT is cooking.",
      "I would put this on my menu and charge forty pounds for it.",
      "RAW in the middle, and I mean that as the highest compliment.",
    ],
    mixed: [
      "Where is the seasoning? {color}, yes, but it is {cov}.",
      "I have seen better on a motorway services menu.",
      "It is nearly food. Nearly is not food.",
      "Fine. FINE. A garnish nobody asked for.",
    ],
    sneer: [
      "WHERE IS THE FOOD? This is {cov}.",
      "DISGUSTING. Not a plate, not a fish, not one ingredient.",
      "You painted {color} and called it a meal. Get out of my kitchen.",
      "I would not feed this to the critics I hate.",
    ],
  },
  julian: {
    rave: [
      "A {color} field of pure praxis. This is the liminal we keep failing to name.",
      "The negative space does the talking. I would hang this in the white cube tomorrow.",
      "Formally rigorous, emotionally vacant in exactly the right way.",
      "This is a painting that argues with itself. Discourse.",
    ],
    mixed: [
      "There is gesture here, though the {color} is doing rather a lot of work.",
      "It gestures toward the liminal without ever arriving.",
      "Competent. Theory-adjacent. Not yet a position.",
      "I see {cov} and I think: undergraduate.",
    ],
    sneer: [
      "Illustration. Cute, legible, finished. Everything a painting should not be.",
      "This is {cov}. I cannot hang anecdote.",
      "It wants to be liked. That is the problem.",
      "There is no praxis here, only product.",
    ],
  },
  leopold: {
    rave: [
      "One can see the hours in it. My restorer would weep with respect.",
      "Almost heraldic, that symmetry. My ancestors would approve of the frame.",
      "Dense, patient, considered. This is how the old masters earned their bread.",
      "I shall hang it opposite the Rembrandt and let them argue.",
    ],
    mixed: [
      "There is effort here, though the {color} sits a little thin.",
      "My great-aunt painted with more discipline, but she had more time.",
      "The composition holds. The patience does not.",
      "It is {cov}, and one does notice.",
    ],
    sneer: [
      "A few lazy marks. My estate has wallpaper with more labour in it.",
      "This is {cov}. I have signed cheques with more detail.",
      "The hand is hasty. The eye is bored. I shall pass.",
      "One does not hang haste in a family collection.",
    ],
  },
  marguerite: {
    rave: [
      "The mark is haunted and the {color} is screaming. I feel unwell in the best way.",
      "Nothing lines up. That is the only honesty left.",
      "I would perform inside this painting until security arrived.",
      "Someone tripped and the universe came out. Divine accident.",
    ],
    mixed: [
      "There is a spirit in the {color}, though it is {cov}.",
      "It dreams, but quietly. I wanted it to scream.",
      "Nearly unhinged. Not quite. Nearly.",
      "The ghost is here, but it is wearing a cardigan.",
    ],
    sneer: [
      "Tidy. Obedient. Dead.",
      "This painting has never once lost control of itself.",
      "I see {cov} and no séance. Pass.",
      "The soul of the mark has left the building.",
    ],
  },
  ines: {
    rave: [
      "There is a horizon here. I can feel the weather in it.",
      "That {color} sky, the sense of a place I have never been. I want to stand in it.",
      "A landscape of the heart, and I am buying it.",
      "Warm, sincere, and it remembers somewhere.",
    ],
    mixed: [
      "I keep looking for a horizon and finding {cov}.",
      "It is lovely, though I am not sure where I am standing.",
      "The {color} is kind. The view is unclear.",
      "A place, perhaps. A postcard from nowhere.",
    ],
    sneer: [
      "I am so sorry, but I cannot find the land in this.",
      "It is {cov}, and I feel politely lost.",
      "No horizon, no weather, no home.",
      "Forgive me. I need a sky.",
    ],
  },
  chad: {
    rave: [
      "no cap this {color} goes hard. i would frame this immediately.",
      "this is a reaction image waiting to happen. huge.",
      "it reads at thumbnail size and that's the whole game.",
      "this is so real. i'm putting it in the group chat.",
    ],
    mixed: [
      "mid tbh. the {color} is nice tho.",
      "kinda {cov} but it's growing on me.",
      "would scroll past. would also maybe scroll back.",
      "solid 6/10. frameable if the vibes improve.",
    ],
    sneer: [
      "mid. genuinely mid. this is {cov} and i'm bored.",
      "no meme potential. none. sorry.",
      "looks like a screensaver from 2009.",
      "i would not even repost this ironically.",
    ],
  },
};

const WIN_LINES = {
  gordon: ["MINE. And I am serving it on a plate.", "I outbid you because it is FOOD."],
  julian: ["I had to own the discourse.", "You cannot hang what I now own."],
  leopold: ["A trifle, but it belongs with the family now.", "It will hang beside my Titian."],
  marguerite: ["It wanted to come home with me.", "The mark chose me, not the money."],
  ines: ["I could not let this place disappear.", "It needed someone who remembers."],
  chad: ["i had to have it. no cap.", "this is going in my feed, not yours."],
};

const LOSS_LINES = {
  gordon: ["Somebody paid more for nothing.", "A tragedy. A food tragedy."],
  julian: ["Ridiculous money for such a thin proposition.", "Let them own it. Let them."],
  leopold: ["One does not fight over a trifle.", "My restorer will be relieved."],
  marguerite: ["The money was not ready for it.", "It went to the wrong hands. It always does."],
  ines: ["I hope whoever got it can see the place in it.", "Someone else will keep it, then."],
  chad: ["losing is so mid.", "no way, that was so mine."],
};

function tierOf(score) {
  if (score >= 0.6) return "rave";
  if (score >= 0.36) return "mixed";
  return "sneer";
}

/** Every bidder looks at the actual painting and forms an opinion of their own. */
export function judgePaintingLocally(stats, paintingIndex) {
  const cov = coveragePhrase(stats.coverage);

  return BIDDERS.map((bidder) => {
    const jitter = 0.9 + Math.random() * 0.2;
    const score = clamp01(TASTE[bidder.id](stats) * jitter);
    const tier = tierOf(score);
    const line = pick(LINES[bidder.id][tier])
      .replace(/\{color\}/g, stats.color)
      .replace(/\{cov\}/g, cov);

    return {
      bidderId: bidder.id,
      reaction: line,
      maxBid: priceFor(score, LOCAL_JURY_MAX_BID),
      winLine: pick(WIN_LINES[bidder.id]),
      lossLine: pick(LOSS_LINES[bidder.id]),
    };
  });
}