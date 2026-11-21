import { test } from "node:test";
import assert from "node:assert/strict";
import { BIDDERS, BIDDER_BUDGET } from "../src/lib/bidders.js";
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

test("AI verdicts are mapped onto the roster, cleaned and clamped", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      verdicts: BIDDERS.map((bidder, index) => ({
        bidder_id: index === 0 ? bidder.id.toUpperCase() : bidder.id,
        reaction: `  Reaction ${index}  `,
        max_bid_millions: index === 1 ? 999 : index === 2 ? -3 : 7.25,
        win_line: `"Won ${index}"`,
        loss_line: null,
      })),
    }),
  );

  const verdicts = await judgePaintingWithKey({ key: "test", image: IMAGE, paintingIndex: 0 });

  assert.equal(fetchMock.mock.calls.length, 1);
  assert.deepEqual(
    verdicts.map((verdict) => verdict.bidderId),
    BIDDERS.map((bidder) => bidder.id),
  );
  assert.equal(verdicts[0].reaction, "Reaction 0");
  assert.equal(verdicts[0].maxBid, 7250000);
  assert.equal(verdicts[0].winLine, "Won 0");
  assert.equal(verdicts[0].lossLine, "Ridiculous price.");
  assert.equal(verdicts[1].maxBid, BIDDER_BUDGET);
  assert.equal(verdicts[2].maxBid, 0);

  const body = requestBody(fetchMock);
  const schema = body.generationConfig.responseSchema.properties.verdicts.items.properties;
  assert.deepEqual(schema.bidder_id.enum, BIDDERS.map((bidder) => bidder.id));
  assert.match(body.contents[0].parts[0].text, /painting number 1 of 3/);
  assert.deepEqual(body.contents[0].parts[1].inlineData.data, "AAAA");
});

test("missing AI verdicts fall back per bidder and bad bids clamp to zero", async (t) => {
  t.mock.method(Math, "random", () => 0.5);
  t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      verdicts: [
        { bidder_id: BIDDERS[0].id, reaction: "Nice", max_bid_millions: "not a number" },
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

test("AI obituaries are cleaned and mention the right life", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    geminiReply({
      title: ' "A Grand Title" ',
      narration: " first \n\n second ",
      epitaph: null,
    }),
  );

  const result = await writeObituaryWithKey({
    key: "test",
    paintings: [IMAGE, IMAGE],
    total: 2500000,
  });

  assert.equal(result.title, "A Grand Title");
  assert.equal(result.narration, "first second");
  assert.equal(result.epitaph, "They painted, and then they did not.");

  const prompt = requestBody(fetchMock).contents[0].parts[0].text;
  assert.match(prompt, /exactly 2 works/);
  assert.match(prompt, /\$2,500,000/);
});

test("Gemini errors reach the caller", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false, status: 403 }));
  await assert.rejects(
    () => judgePaintingWithKey({ key: "bad", image: IMAGE, paintingIndex: 0 }),
    /Gemini 403/,
  );
});
