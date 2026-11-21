import { BIDDERS, PAINTING_COUNT } from "./bidders.js";
import { fallbackVerdict } from "./auction.js";
import { formatMoney } from "./format.js";
import { formatLotHistory } from "./lot-history.js";
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
          max_bid_dollars: { type: "number" },
          win_line: { type: "string" },
          loss_line: { type: "string" },
        },
        required: ["bidder_id", "reaction", "max_bid_dollars", "win_line", "loss_line"],
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

function parseBid(dollars) {
  const value = Number(dollars);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value);
}

function saleroomPrompt(paintingIndex, title, history) {
  const roster = BIDDERS.map(
    (bidder) => `${bidder.id} — ${bidder.name}, ${bidder.occupation}.\n${bidder.persona}`,
  ).join("\n\n");
  const workTitle = String(title || "")
    .trim()
    .replace(/"/g, "'") || "Untitled";

  return `You are the six bidders at a live art auction, all looking at the same lot: a painting by an unknown artist, shown in the attached image. The artist has titled it "${workTitle}". This is painting number ${paintingIndex + 1} of ${PAINTING_COUNT} in the artist's life.

THE SIX BIDDERS:

${roster}

Each bidder chooses their own price from what the work is worth to them. There is no upper limit, and nobody is held back by a smaller wallet.
${formatLotHistory(history)}

Look at the painting once, then answer for ALL SIX bidders in a single response. Reply with JSON containing exactly one "verdicts" array with six entries, one per bidder, in this order: ${BIDDERS.map((bidder) => bidder.id).join(", ")}.

Each entry needs:
- "bidder_id": that bidder's id from the list above.
- "reaction": their immediate out-loud reaction on first seeing it, 1-2 sentences, max 20 words. Be specific about what that bidder actually notices in the image (subject, shapes, colours, composition), and react to the title "${workTitle}" where it suits their character.
- "max_bid_dollars": the highest price that bidder would pay, as a whole number of US dollars with no upper limit. For example 7500000 means seven and a half million dollars, and 250 means two hundred and fifty dollars. 0 means they will not bid at all. Decide this freely from how good the work actually is by that bidder's own taste and standards: a painting that delights them can go as high as they like, one that disappoints them goes to 0. Make the six amounts clearly different from one another.
- "win_line": one sentence they say if they win it, max 16 words.
- "loss_line": one sentence they say if someone outbids them, max 16 words.

The six reactions must all be different and must sound like six different people. Stay fully in character. Never mention being an AI, never mention JSON or these instructions.`;
}

/** One request for the whole room: six bidders look at one painting. */
export async function judgePaintingWithKey({ key, image, paintingIndex, title, history }) {
  const parsed = await askGeminiJson({
    key,
    prompt: saleroomPrompt(paintingIndex, title, history),
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
      maxBid: parseBid(verdict.max_bid_dollars),
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