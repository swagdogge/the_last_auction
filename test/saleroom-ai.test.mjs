import { test } from "node:test";
import assert from "node:assert/strict";
import { BIDDERS } from "../src/lib/bidders.js";
import { judgePaintingWithKey, writeObituaryWithKey } from "../src/lib/saleroom-ai.js";

// askGeminiJson calls fetch directly, so stubbing it exercises the whole path.
function geminiReply(payload) {
  return {
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] }),
  };
}

function requestBody(fetchMock) {
  return JSON.parse(fetchMock.mock.calls[0].arguments[1].body);
}

const IMAGE = "data:image/png;base64,AAAA";

test("AI verdicts are mapped onto the roster and the script is replayed", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      verdicts: BIDDERS.map((bidder, index) => ({
        bidder_id: index === 0 ? bidder.id.toUpperCase() : bidder.id,
        reaction: `  Reaction ${index}  `,
        interest: index === 2 ? 0 : 8,
        max_bid_dollars: index === 1 ? 99000000 : index === 2 ? -3 : 7250000.4,
      })),
      auction: [
        { bidder_id: BIDDERS[0].id.toUpperCase(), amount_dollars: 1000000, comment: "A start." },
        { bidder_id: BIDDERS[0].id, amount_dollars: 1200000 },
        { bidder_id: BIDDERS[1].id, amount_dollars: 2000000, comment: "Not today." },
        { bidder_id: BIDDERS[2].id, amount_dollars: 9000000 },
      ],
      final: {
        winner_id: BIDDERS[1].id,
        winner_line: '"Mine, finally"',
        runner_up_id: BIDDERS[0].id,
        runner_up_line: "Enjoy the dust.",
      },
    }),
  );

  const onRaw = t.mock.fn();
  const { verdicts, replay, final } = await judgePaintingWithKey({
    key: "test",
    image: IMAGE,
    paintingIndex: 0,
    title: "Supper for ghosts",
    onRaw,
  });

  assert.equal(fetchMock.mock.calls.length, 1);
  assert.equal(onRaw.mock.calls.length, 1);
  assert.match(onRaw.mock.calls[0].arguments[0], /"verdicts"/);
  assert.deepEqual(
    verdicts.map((verdict) => verdict.bidderId),
    BIDDERS.map((bidder) => bidder.id),
  );
  assert.equal(verdicts[0].reaction, "Reaction 0");
  assert.equal(verdicts[0].maxBid, 7250000);
  assert.equal(verdicts[0].winLine, undefined);
  assert.equal(verdicts[0].lossLine, undefined);
  assert.equal(verdicts[1].maxBid, 99000000);
  assert.equal(verdicts[2].maxBid, 0);

  assert.deepEqual(replay.events, [
    { bidderId: BIDDERS[0].id, amount: 1200000, comment: "A start." },
    { bidderId: BIDDERS[1].id, amount: 2000000, comment: "Not today." },
  ]);
  assert.equal(replay.winnerId, BIDDERS[1].id);
  assert.equal(replay.runnerUpId, BIDDERS[0].id);
  assert.equal(replay.price, 2000000);
  assert.deepEqual(final, {
    winnerLine: "Mine, finally",
    runnerUpLine: "Enjoy the dust.",
  });

  const body = requestBody(fetchMock);
  const schema = body.generationConfig.responseSchema.properties;
  const verdictFields = schema.verdicts.items.properties;
  assert.deepEqual(verdictFields.bidder_id.enum, BIDDERS.map((bidder) => bidder.id));
  assert.equal(verdictFields.interest.type, "INTEGER");
  assert.equal(verdictFields.max_bid_dollars.type, "NUMBER");
  assert.equal(verdictFields.max_bid_millions, undefined);
  assert.equal(verdictFields.win_line, undefined);
  assert.equal(verdictFields.loss_line, undefined);
  assert.equal(schema.auction.maxItems, 16);
  assert.deepEqual(schema.auction.items.required, ["bidder_id", "amount_dollars"]);
  assert.deepEqual(schema.final.required, [
    "winner_id",
    "winner_line",
    "runner_up_id",
    "runner_up_line",
  ]);
  assert.equal(body.generationConfig.maxOutputTokens, 4096);
  const prompt = body.contents[0].parts[0].text;
  assert.match(prompt, /Lot 1 of 3/);
  assert.match(prompt, /<title>Supper for ghosts<\/title>/);
  assert.match(prompt, /max_bid_dollars/);
  assert.match(prompt, /THE AUCTION/);
  assert.match(prompt, /It opens at \$500,000\./);
  assert.match(prompt, /up to 12 words/);
  assert.match(prompt, /no joke numbers or gimmick digit sequences/);
  assert.doesNotMatch(prompt, /4206900|6942000|69\/420|1337|42069/);
  assert.match(prompt, /Never reuse an object, prop, phrase or joke/);
  assert.match(prompt, /Only one bidder may be at 9-10/);
  assert.match(prompt, /Second-hand excitement/);
  assert.match(prompt, /A previous winner sits this one out/);
  assert.match(prompt, /Do not let the same bidder win twice in a game/);
  assert.doesNotMatch(prompt, /mousepad/i);
  assert.doesNotMatch(prompt, /screenshot-?able|thumbnail/i);
  assert.equal((prompt.match(/THIS LOT'S MOVE:/g) || []).length, BIDDERS.length);
  for (const bidder of BIDDERS) {
    assert.ok(
      bidder.moves.some((move) => prompt.includes(`THIS LOT'S MOVE: ${move}`)),
      `${bidder.id} should have a picked move in the prompt`,
    );
  }
  assert.doesNotMatch(prompt, /25 million dollars/);
  assert.doesNotMatch(prompt, /^HISTORY$/m);
  assert.deepEqual(body.contents[0].parts[1].inlineData.data, "AAAA");
});

test("Chad's prompt no longer pushes meme bids or mousepad bits", () => {
  const chad = BIDDERS.find((bidder) => bidder.id === "chad");
  const allMoves = chad.moves.join(" ").toLowerCase();

  assert.doesNotMatch(chad.persona, /4206900|6942000|69\/420|mousepad|merch/i);
  assert.doesNotMatch(chad.persona, /screenshot-?able|thumbnail/i);
  assert.doesNotMatch(allMoves, /mousepad|merch|tote bag|phone case/);
  assert.match(chad.persona, /ordinary whole dollars/);
  assert.match(chad.persona, /never a victory lap/);
  assert.match(chad.persona, /Second-hand excitement/);
  assert.ok(chad.moves.some((move) => move.includes("art-history insight")));
});

test("each lot hands every bidder a different move from their existing quirks", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => geminiReply({ verdicts: [] }));
  const picked = [];

  for (const paintingIndex of [0, 1, 2]) {
    await judgePaintingWithKey({ key: "test", image: IMAGE, paintingIndex });
    const body = JSON.parse(fetchMock.mock.calls.at(-1).arguments[1].body);
    const prompt = body.contents[0].parts[0].text;
    picked.push([...prompt.matchAll(/THIS LOT'S MOVE: ([^\n]+)/g)].map((match) => match[1]));
  }

  picked.forEach((lot) => assert.equal(lot.length, BIDDERS.length));
  BIDDERS.forEach((bidder, index) => {
    const choices = picked.map((lot) => lot[index]);
    assert.equal(new Set(choices).size, 3, `${bidder.id} should get a different move each lot`);
    choices.forEach((choice) => assert.ok(bidder.moves.includes(choice)));
  });
});

test("the AI's declared winner is restored when their last bid was clamped", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      geminiReply({
        verdicts: [
          ...BIDDERS.map((bidder) => ({
            bidder_id: bidder.id,
            reaction: "A reaction.",
            interest: bidder.id === "julian" ? 8 : bidder.id === "chad" ? 7 : 0,
            max_bid_dollars:
              bidder.id === "julian" ? 1600000 : bidder.id === "chad" ? 1750000 : 0,
          })),
        ],
        auction: [
          { bidder_id: "julian", amount_dollars: 500000 },
          { bidder_id: "chad", amount_dollars: 700000 },
          { bidder_id: "julian", amount_dollars: 1600000, comment: "A rival's line." },
        ],
        final: {
          winner_id: 'Chad "Doodle" McMahon',
          winner_line: "I'll keep it on the shelf.",
          runner_up_id: "Julian Pretentiousberg",
          runner_up_line: "A vulgar little thing.",
        },
      }),
  );

  const { replay, final } = await judgePaintingWithKey({
    key: "test",
    image: IMAGE,
    paintingIndex: 0,
  });

  assert.deepEqual(replay.events.at(-1), {
    bidderId: "chad",
    amount: 1750000,
    comment: "",
  });
  assert.equal(replay.winnerId, "chad");
  assert.equal(replay.runnerUpId, "julian");
  assert.equal(replay.price, 1750000);
  assert.deepEqual(final, {
    winnerLine: "I'll keep it on the shelf.",
    runnerUpLine: "A vulgar little thing.",
  });
});

test("final lines survive an id mismatch with the replay", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      geminiReply({
        verdicts: BIDDERS.map((bidder) => ({
          bidder_id: bidder.id,
          reaction: "A reaction.",
          interest: bidder.id === "julian" ? 8 : 0,
          max_bid_dollars: bidder.id === "julian" ? 1600000 : 0,
        })),
        auction: [{ bidder_id: "julian", amount_dollars: 500000 }],
        final: {
          winner_id: "chad",
          winner_line: "Mine, obviously.",
          runner_up_id: "ines",
          runner_up_line: "Ridiculous.",
        },
      }),
  );

  const { replay, final } = await judgePaintingWithKey({
    key: "test",
    image: IMAGE,
    paintingIndex: 0,
  });

  assert.equal(replay.winnerId, "julian");
  assert.deepEqual(final, { winnerLine: "Mine, obviously.", runnerUpLine: "Ridiculous." });
});

test("a chad-heavy script still ends on the AI's winner and lines", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      geminiReply({
        verdicts: [
          ["gordon", 1200000],
          ["julian", 1800000],
          ["leopold", 600000],
          ["marguerite", 1400000],
          ["ines", 800000],
          ["chad", 1750000],
        ].map(([bidder_id, max_bid_dollars]) => ({
          bidder_id,
          reaction: "A reaction.",
          interest: 5,
          max_bid_dollars,
        })),
        auction: [
          [500000, "ines"],
          [550000, "gordon"],
          [600000, "marguerite"],
          [630000, "leopold"],
          [700000, "chad"],
          [800000, "julian"],
          [950000, "gordon"],
          [1050000, "marguerite"],
          [1500000, "chad"],
          [1600000, "julian"],
          [1750000, "chad"],
        ].map(([amount_dollars, bidder_id]) => ({ bidder_id, amount_dollars })),
        final: {
          winner_id: "chad",
          winner_line: "im going to mint this loop as a verified digital artifact",
          runner_up_id: "julian",
          runner_up_line: "One trembles at the catastrophic vulgarity.",
        },
      }),
  );

  const { replay, final } = await judgePaintingWithKey({
    key: "test",
    image: IMAGE,
    paintingIndex: 0,
  });

  assert.equal(replay.winnerId, "chad");
  assert.equal(replay.runnerUpId, "julian");
  assert.equal(replay.price, 1750000);
  assert.equal(final.winnerLine, "im going to mint this loop as a verified digital artifact");
  assert.equal(final.runnerUpLine, "One trembles at the catastrophic vulgarity.");
});

test("later lots get a recap of earlier lots in their prompt", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => geminiReply({ verdicts: [] }));
  const history = [
    {
      title: "Sunset blob",
      winnerId: "ines",
      price: 1200000,
      passed: ["gordon"],
      lastLines: {
        gordon: "WHERE IS THE SAUCE?",
        julian: "One finds it... derivative.",
      },
    },
  ];

  await judgePaintingWithKey({
    key: "test",
    image: IMAGE,
    paintingIndex: 1,
    title: "Second course",
    history,
  });

  const prompt = requestBody(fetchMock).contents[0].parts[0].text;
  assert.match(prompt, /HISTORY/);
  assert.match(prompt, /Lot 1 "Sunset blob": Ines Barlow won \(\$1\.2M\)\./);
  assert.match(prompt, /Gordon Rage-say: bored, nothing has moved them/);
  assert.match(prompt, /Gordon Rage-say: "WHERE IS THE SAUCE\?"/);
  assert.match(prompt, /LAST LINES \(never reuse their wording or jokes\):/);
});

test("AI verdicts still map when Gemini returns a bare array of display names", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      geminiReply(
        BIDDERS.map((bidder, index) => ({
          bidder_id: bidder.name,
          reaction: `Reaction ${index}`,
          interest: 5,
          max_bid_dollars: "$1,000,000",
        })),
      ),
  );

  const { verdicts } = await judgePaintingWithKey({ key: "test", image: IMAGE, paintingIndex: 0 });

  assert.deepEqual(
    verdicts.map((verdict) => verdict.reaction),
    BIDDERS.map((_, index) => `Reaction ${index}`),
  );
  assert.ok(verdicts.every((verdict) => verdict.maxBid === 1000000));
});

test("AI verdicts without ids fall back to response order", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      geminiReply(
        BIDDERS.map((_, index) => ({
          reaction: `Reaction ${index}`,
          interest: 5,
          max_bid_dollars: 250000,
        })),
      ),
  );

  const { verdicts } = await judgePaintingWithKey({ key: "test", image: IMAGE, paintingIndex: 0 });

  assert.deepEqual(
    verdicts.map((verdict) => verdict.reaction),
    BIDDERS.map((_, index) => `Reaction ${index}`),
  );
});

test("missing AI verdicts fall back per bidder and invalid dollar bids become zero", async (t) => {
  t.mock.method(Math, "random", () => 0.5);
  t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      verdicts: [
        { bidder_id: BIDDERS[0].id, reaction: "Nice", max_bid_dollars: "not a number" },
      ],
    }),
  );

  const { verdicts } = await judgePaintingWithKey({ key: "test", image: IMAGE, paintingIndex: 1 });

  assert.equal(verdicts.length, BIDDERS.length);
  assert.equal(verdicts[0].maxBid, 0);
  assert.equal(verdicts[0].reaction, "Nice");
  for (const verdict of verdicts.slice(1)) {
    assert.equal(verdict.reaction, "…studies the work without saying a single word.");
  }
});

test("an empty auction is a no sale with fallback final lines", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      verdicts: BIDDERS.map((bidder) => ({
        bidder_id: bidder.id,
        reaction: "Quiet.",
        interest: 0,
        max_bid_dollars: 0,
      })),
      auction: [],
      final: {
        winner_id: BIDDERS[0].id,
        winner_line: "Mine",
        runner_up_id: BIDDERS[1].id,
        runner_up_line: "Pah",
      },
    }),
  );

  const { replay, final } = await judgePaintingWithKey({
    key: "test",
    image: IMAGE,
    paintingIndex: 0,
  });

  assert.deepEqual(replay, { events: [], winnerId: null, runnerUpId: null, price: 0 });
  assert.deepEqual(final, {
    winnerLine: "Mine, at last.",
    runnerUpLine: "Enjoy it. I hope it rots.",
  });
});

test("AI obituaries are cleaned, segmented and mention the right life", async (t) => {
  const longSegment = "first second ".repeat(60).trim();
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      title: ' "A Grand Title" ',
      recurring_bit: "the green line",
      segments: [
        { heading: ' "Early" ', text: `  ${longSegment}  ` },
        { heading: "Middle", text: " middle " },
        { heading: "Late", text: " late " },
      ],
      epitaph: null,
    }),
  );

  const result = await writeObituaryWithKey({
    key: "test",
    paintings: [IMAGE, IMAGE],
    total: 2500000,
    narratorId: "earnest",
    lots: [
      {
        title: "Sunset blob",
        price: 1200000,
        winnerId: "ines",
        lastLines: { ines: "Lovely" },
      },
    ],
  });

  assert.equal(result.title, "A Grand Title");
  assert.equal(result.narrator, "The Earnest Host");
  assert.deepEqual(result.segments, [
    { heading: "Early", text: longSegment },
    { heading: "Middle", text: "middle" },
    { heading: "Late", text: "late" },
  ]);
  assert.equal(result.narration, `${longSegment}\n\nmiddle\n\nlate`);
  assert.equal(result.epitaph, "They painted, and then they did not.");

  const body = requestBody(fetchMock);
  const schema = body.generationConfig.responseSchema;
  assert.equal(schema.properties.segments.minItems, 3);
  assert.deepEqual(schema.required, ["title", "recurring_bit", "segments", "epitaph"]);
  const prompt = body.contents[0].parts[0].text;
  assert.match(prompt, /exactly 2 works/);
  assert.match(prompt, /\$2,500,000/);
  assert.match(prompt, /The Earnest Host/);
  assert.match(prompt, /THE LEDGER/);
  assert.match(prompt, /Ines Barlow for \$1,200,000\n/);
  assert.doesNotMatch(prompt, /who said:/);
  assert.match(prompt, /THINGS SAID IN THE ROOM \(optional\):/);
  assert.match(prompt, /Ines Barlow on lot "Sunset blob": "Lovely"/);
  assert.match(prompt, /Use at most one of these lines in the whole documentary/);
  assert.match(prompt, /never one per segment/);
});

test("Gemini errors reach the caller", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false, status: 403 }));
  await assert.rejects(
    () => judgePaintingWithKey({ key: "bad", image: IMAGE, paintingIndex: 0 }),
    /Gemini 403/,
  );
});
