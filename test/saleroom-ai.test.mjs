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

test("AI verdicts are mapped onto the roster and bids read as dollars", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      verdicts: BIDDERS.map((bidder, index) => ({
        bidder_id: index === 0 ? bidder.id.toUpperCase() : bidder.id,
        reaction: `  Reaction ${index}  `,
        interest: index === 2 ? 0 : 8,
        max_bid_dollars: index === 1 ? 99000000 : index === 2 ? -3 : 7250000.4,
        win_line: `"Won ${index}"`,
        loss_line: null,
      })),
    }),
  );

  const onRaw = t.mock.fn();
  const verdicts = await judgePaintingWithKey({
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
  assert.equal(verdicts[0].winLine, "Won 0");
  assert.equal(verdicts[0].lossLine, "Ridiculous price.");
  assert.equal(verdicts[1].maxBid, 99000000);
  assert.equal(verdicts[2].maxBid, 0);

  const body = requestBody(fetchMock);
  const schema = body.generationConfig.responseSchema.properties.verdicts.items.properties;
  assert.deepEqual(schema.bidder_id.enum, BIDDERS.map((bidder) => bidder.id));
  assert.equal(schema.interest.type, "INTEGER");
  assert.equal(schema.max_bid_dollars.type, "NUMBER");
  assert.equal(schema.max_bid_millions, undefined);
  const prompt = body.contents[0].parts[0].text;
  assert.match(prompt, /Lot 1 of 3/);
  assert.match(prompt, /<title>Supper for ghosts<\/title>/);
  assert.match(prompt, /max_bid_dollars/);
  assert.doesNotMatch(prompt, /25 million dollars/);
  assert.doesNotMatch(prompt, /HISTORY/);
  assert.deepEqual(body.contents[0].parts[1].inlineData.data, "AAAA");
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
          win_line: "Mine",
          loss_line: "Theirs",
        })),
      ),
  );

  const verdicts = await judgePaintingWithKey({ key: "test", image: IMAGE, paintingIndex: 0 });

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
          win_line: "Mine",
          loss_line: "Theirs",
        })),
      ),
  );

  const verdicts = await judgePaintingWithKey({ key: "test", image: IMAGE, paintingIndex: 0 });

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

  const verdicts = await judgePaintingWithKey({ key: "test", image: IMAGE, paintingIndex: 1 });

  assert.equal(verdicts.length, BIDDERS.length);
  assert.equal(verdicts[0].maxBid, 0);
  assert.equal(verdicts[0].reaction, "Nice");
  for (const verdict of verdicts.slice(1)) {
    assert.equal(verdict.reaction, "…studies the work without saying a single word.");
  }
});

test("AI obituaries are cleaned, segmented and mention the right life", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      title: ' "A Grand Title" ',
      recurring_bit: "the green line",
      segments: [
        { heading: ' "Early" ', text: " first \n second " },
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
    { heading: "Early", text: "first second" },
    { heading: "Middle", text: "middle" },
    { heading: "Late", text: "late" },
  ]);
  assert.equal(result.narration, "first second\n\nmiddle\n\nlate");
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
  assert.match(prompt, /Ines Barlow for \$1,200,000, who said: "Lovely"/);
});

test("Gemini errors reach the caller", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false, status: 403 }));
  await assert.rejects(
    () => judgePaintingWithKey({ key: "bad", image: IMAGE, paintingIndex: 0 }),
    /Gemini 403/,
  );
});
