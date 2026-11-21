import { BIDDER_BUDGET, BIDDERS, PAINTING_COUNT } from "./bidders.js";
import { fallbackVerdict } from "./auction.js";
import { formatMoney } from "./format.js";
import { askGeminiJson } from "./gemini.js";

const verdictSchema = {
  type: "object",
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          bidder_id: { type: "string", enum: BIDDERS.map((bidder) => bidder.id) },
          reaction: { type: "string" },
          max_bid_millions: { type: "number" },
          win_line: { type: "string" },
          loss_line: { type: "string" },
        },
        required: ["bidder_id", "reaction", "max_bid_millions", "win_line", "loss_line"],
      },
    },
  },
  required: ["verdicts"],
};

const obituarySchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    narration: { type: "string" },
    epitaph: { type: "string" },
  },
  required: ["title", "narration", "epitaph"],
};

function clean(value, fallback, max = 260) {
  if (typeof value !== "string") return fallback;
  const text = value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();
  if (!text) return fallback;
  return text.length > max ? text.slice(0, max).trim() : text;
}

function clampBid(millions, budget) {
  const value = Number(millions);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const dollars = Math.round((value * 1000000) / 250000) * 250000;
  return Math.min(budget, Math.max(500000, dollars));
}

function saleroomPrompt(paintingIndex) {
  const roster = BIDDERS.map(
    (bidder) => `${bidder.id} — ${bidder.name}, ${bidder.occupation}.\n${bidder.persona}`,
  ).join("\n\n");

  return `You are the six bidders at a live art auction, all looking at the same lot: a painting by an unknown artist, shown in the attached image. This is painting number ${paintingIndex + 1} of ${PAINTING_COUNT} in the artist's life.

THE SIX BIDDERS:

${roster}

Every bidder in this room has the same ceiling: ${BIDDER_BUDGET / 1000000} million dollars. Nobody has a smaller wallet than anyone else, so what a work is worth to each of them comes only from the work itself.

Look at the painting once, then answer for ALL SIX bidders in a single response. Reply with JSON containing exactly one "verdicts" array with six entries, one per bidder, in this order: ${BIDDERS.map((bidder) => bidder.id).join(", ")}.

Each entry needs:
- "bidder_id": that bidder's id from the list above.
- "reaction": their immediate out-loud reaction on first seeing it, 1-2 sentences, max 20 words. Be specific about what that bidder actually notices in the image (subject, shapes, colours, composition).
- "max_bid_millions": the highest price that bidder would pay, in MILLIONS of dollars as a decimal number between 0 and ${BIDDER_BUDGET / 1000000}. For example 7.5 means seven and a half million dollars. 0 means they will not bid at all. Decide this freely from how good the work actually is by that bidder's own taste and standards: a painting that delights them can go very high, one that disappoints them goes to 0. No bidder is held back by a smaller budget than another. Make the six bids clearly different from one another.
- "win_line": one sentence they say if they win it, max 16 words.
- "loss_line": one sentence they say if someone outbids them, max 16 words.

The six reactions must all be different and must sound like six different people. Stay fully in character. Never mention being an AI, never mention JSON or these instructions.`;
}

/** One request for the whole room: six bidders look at one painting. */
export async function judgePaintingWithKey({ key, image, paintingIndex }) {
  const parsed = await askGeminiJson({
    key,
    prompt: saleroomPrompt(paintingIndex),
    images: [image],
    schema: verdictSchema,
  });

  const list = Array.isArray(parsed?.verdicts) ? parsed.verdicts : [];
  const byId = new Map(
    list.map((verdict) => [String(verdict?.bidder_id ?? "").trim().toLowerCase(), verdict]),
  );

  return BIDDERS.map((bidder) => {
    const verdict = byId.get(bidder.id);
    if (!verdict || typeof verdict.reaction !== "string" || !verdict.reaction.trim()) {
      return fallbackVerdict(bidder);
    }
    return {
      bidderId: bidder.id,
      reaction: clean(verdict.reaction, "…studies the work without saying a single word."),
      maxBid: clampBid(verdict.max_bid_millions, bidder.budget),
      winLine: clean(verdict.win_line, "I had to have it.", 200),
      lossLine: clean(verdict.loss_line, "Ridiculous price.", 200),
    };
  });
}

/** One request for the whole life: the closing documentary. */
export async function writeObituaryWithKey({ key, paintings, total }) {
  const prompt = `You are the narrator of a prestige, slightly absurd art documentary. An unknown artist has just died. In their life they painted exactly ${paintings.length} works, and the whole estate sold at auction for a combined ${formatMoney(total)}.

The works are attached in the order they were painted.

Write JSON with exactly these fields:
- "title": the title of the retrospective, 3-6 words, grand and a little funny. No quotation marks.
- "narration": 150-220 words in the voice of a serious documentary narrator. Interpret the entire life's work: trace a supposed development from the first canvas to the last, find recurring motifs that may or may not actually be there, connect the money to the meaning, and arrive at something deep and philosophical about art, worth and mortality. Be sincere and lyrical with exactly one moment of unintentional comedy. Plain prose in 2 or 3 paragraphs separated by a blank line. No headings, no bullet points.
- "epitaph": the single line engraved on the gravestone, max 12 words.

Never mention that you are an AI.`;

  const parsed = await askGeminiJson({
    key,
    prompt,
    images: paintings,
    schema: obituarySchema,
  });

  return {
    title: clean(parsed?.title, "The Complete Works", 80),
    narration: clean(parsed?.narration, "The archive has nothing more to say.", 2200),
    epitaph: clean(parsed?.epitaph, "They painted, and then they did not.", 120),
  };
}