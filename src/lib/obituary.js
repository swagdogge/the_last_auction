import { formatMoney } from "./format.js";

const TITLES = [
  "The Complete Works",
  "A Life in Three Surfaces",
  "The Estate of an Unknown Hand",
  "Everything They Left Behind",
  "Three Canvases and No Notes",
];

const EPITAPHS = [
  "They painted, and then they did not.",
  "Here lies an eye that kept trying.",
  "The work remains. The reasons do not.",
  "Sold, mostly.",
  "A hand, a surface, a hammer.",
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** The closing documentary, written from what actually happened in the saleroom. */
export function composeObituary(works, total) {
  const sold = works.filter((w) => w.price > 0);
  const best = works.reduce((a, b) => (b.price > a.price ? b : a), works[0] || { price: 0 });
  const bestIndex = works.indexOf(best);
  const first = works[0];
  const last = works[works.length - 1];

  const opening =
    sold.length === 0
      ? `The estate sold nothing. ${works.length} canvases entered the saleroom and ${works.length} canvases came back, which the catalogue describes, generously, as a complete collection.`
      : `The estate sold ${sold.length} of ${works.length} works for a combined ${formatMoney(total)}, and the room was, by all accounts, briefly quiet.`;

  const middle = [
    `The first canvas ${first && first.price > 0 ? `found a buyer at ${formatMoney(first.price)}` : "found no buyer at all"}, and critics have since argued that everything after it was either a development or a retreat, depending on which gallery they work for.`,
    best.price > 0
      ? `Lot ${bestIndex + 1} went for ${formatMoney(best.price)}, the highest of the life, and it is now the painting everyone will pretend to have understood first.`
      : `No single work rose above the others, which the auction house has described as a remarkably even body of work.`,
    last && last.price > 0
      ? `The final painting sold for ${formatMoney(last.price)}, and then the artist stopped, which is the only decision a painter is never asked to explain.`
      : `The final painting went unsold, and then the artist stopped, which is the only decision a painter is never asked to explain.`,
  ];

  const closing = `What remains is a set of surfaces somebody made in the time they had, valued by six strangers with their own appetites, and then valued again by a number. The number will outlive the paintings. The paintings will outlive the number. Somebody, somewhere, will look at one of them and feel something they cannot defend, which is the closest thing to a fair price that art has ever managed.`;

  return {
    title: pick(TITLES),
    narration: [opening, middle.join(" "), closing].join("\n\n"),
    epitaph: pick(EPITAPHS),
  };
}