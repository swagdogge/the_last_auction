import { test } from "node:test";
import assert from "node:assert/strict";
import { composeObituary } from "../src/lib/obituary.js";

test("the narration recounts the sale, the best lot and the final painting", (t) => {
  t.mock.method(Math, "random", () => 0);
  const works = [{ price: 1000000 }, { price: 5000000 }, { price: 0 }];

  const result = composeObituary(works, 6000000);

  assert.equal(result.title, "The Complete Works");
  assert.equal(result.epitaph, "They painted, and then they did not.");
  assert.match(result.narration, /sold 2 of 3 works for a combined \$6,000,000/);
  assert.match(result.narration, /Lot 2 went for \$5,000,000/);
  assert.match(result.narration, /The final painting went unsold/);
  assert.equal(result.narration.split("\n\n").length, 3);
});

test("an estate with no sales says so", (t) => {
  t.mock.method(Math, "random", () => 0);
  const result = composeObituary([{ price: 0 }, { price: 0 }], 0);
  assert.match(result.narration, /The estate sold nothing\. 2 canvases entered the saleroom/);
  assert.match(result.narration, /No single work rose above the others/);
});

test("an empty estate still produces a documentary", () => {
  const result = composeObituary([], 0);
  assert.match(result.narration, /0 canvases entered the saleroom/);
  assert.ok(result.title.length > 0);
});
