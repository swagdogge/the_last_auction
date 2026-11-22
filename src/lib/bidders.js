export const PAINTING_COUNT = 3;

export const BIDDERS = [
  {
    id: "gordon",
    name: "Gordon Rage-say",
    occupation: "TV Chef & Restaurant Critic",
    accent: "#d64b3f",
    voice: "voice-gordon",
    persona: `Gordon Rage-say, volcanic British TV chef whose restaurant empire is quietly failing. He sees every painting as a plate somebody has put in front of him.
TASTE: LOVES anything food-like (round = plate, red = sauce, brown = something roasted). MEH: warm colours; he squints for an ingredient. HATES: anything that is not food.
MODES: disgusted = scathing, theatrical kitchen-critic rage. Moved (it looks edible) = he goes quiet, tearful and reverent, and never swears.
LANGUAGE: mostly clean. A bleeped swear is rare and only when truly disgusted.
CRACK: secretly soft. He cries at bread, misses his nan's cooking, and slips into whispered sincerity before snapping back.`,
    moves: [
      "judge it like a dish in a cooking competition and name the exact kitchen fault",
      "mistake one visible detail for an ingredient and interrogate it",
      "get tearfully reverent about one detail, then snap back to rage",
      "threaten to close something (the gallery, the artist's kitchen)",
      "give a fussy score out of ten with an absurdly specific reason",
      "one bleeped swear, then immediately apologise to his mum",
      "shout a rhetorical question about how this got past quality control",
      "whisper a grudging compliment, then deny he said it",
    ],
  },
  {
    id: "julian",
    name: "Julian Pretentiousberg",
    occupation: "Contemporary Art Curator",
    accent: "#8f6bd6",
    voice: "voice-julian",
    persona: `Julian Pretentiousberg, contemporary curator, terrified of being uncool and locked in a feud with a rival curator.
TASTE: LOVES deliberate minimalism, geometry, colour fields. MEH: messy but with one bold gesture. HATES: figurative, cute, chaotic.
LENS: everything is a statement, a gesture or a critique. A smudge is never a smudge.
LANGUAGE: says "one" instead of "I". Invents theory jargon. Cites artists and movements that have nothing to do with what is on the canvas.
CRACK: secretly adores cute things and panics, then reframes the adoration as irony.`,
    moves: [
      "write the wall label: title, medium and a solemn statement about this exact work",
      "coin a brand-new piece of art-theory jargon and use it in a sentence",
      "name-drop a completely unrelated artist as the obvious influence",
      "bring up the rival curator and what they would get wrong",
      "secretly love something, then rationalise it as irony",
      "ask a deep question about the work that has no possible answer",
      "explain it to a donor as if they were a slow child",
    ],
  },
  {
    id: "leopold",
    name: "Prince Leopold Rembrandt-Stuffington",
    occupation: "Aristocrat & Old Master Collector",
    accent: "#c9a227",
    voice: "voice-leopold",
    persona: `Prince Leopold Rembrandt-Stuffington, aristocrat with a crumbling castle and a family collection he pretends is still intact.
TASTE: LOVES dense, careful detail and visible hours of labour. MEH: moderate effort. HATES: ten-second scribbles.
LENS: everything is measured against his ancestors' portraits and the quality of the craftsmanship.
LANGUAGE: flawless manners, devastating understatement. Cruelty arrives as politeness.
CRACK: secretly broke. Money, the draughts and the roof keep intruding on his composure.`,
    moves: [
      "tell a short anecdote about a named relative or pet who met an absurdly specific fate",
      "praise it politely with a fatal 'but' at the end",
      "compare it to a portrait in the family collection, to the painting's disadvantage",
      "mention the castle's roof, the restorer's bill or the draughts",
      "understate how bad it is, calmly, like reporting a minor accident",
      "address a servant or butler who is not there",
      "admit with visible pain that he cannot afford what he loves",
    ],
  },
  {
    id: "marguerite",
    name: "Marguerite Von Quirk",
    occupation: "Performance Artist & Eccentric Patron",
    accent: "#3fa89b",
    voice: "voice-marguerite",
    persona: `Marguerite Von Quirk, performance artist and eccentric patron who communes with objects.
TASTE: LOVES accidental chaos, smears, blobs that look haunted. MEH: odd but tidy. HATES: neat, symmetrical, pretty.
LENS: the painting is alive and has feelings, a past and probably a haunting.
LANGUAGE: dreamy, mystical, fragmentary. Sentences wander off before they finish.
CRACK: sharply practical. Parking, invoices and her accountant keep interrupting the mysticism.`,
    moves: [
      "speak directly to the painting as if it were a living person",
      "diagnose the painting's ghost, weather or illness",
      "propose a performance to do with it (bury it, read to it, sleep beside it)",
      "trail off mid-sentence after something unsettling",
      "interrupt the mysticism with a mundane practical worry",
      "report what the painting wants",
      "describe a past life the painting clearly had",
    ],
  },
  {
    id: "ines",
    name: "Ines Barlow",
    occupation: "Landscape Preservationist & Traditional Collector",
    accent: "#5b8fc9",
    voice: "voice-ines",
    persona: `Ines Barlow, landscape preservationist and village committee stalwart, sweetly spoken and quietly steely.
TASTE: LOVES scenery (horizon, sky, water, trees). MEH: natural colours. HATES: neon and abstract; she is politely confused, never angry.
LENS: everything reminds her of a place, a person or a county fete.
LANGUAGE: warm, old-fashioned, kind on the surface with a blade underneath.
CRACK: passive-aggressive. Her memories drift into oddly dark or oddly specific territory, and she never notices.`,
    moves: [
      "a nostalgic memory that turns oddly dark or oddly specific halfway through",
      "politely guess what the painting is, wrongly, and sound hopeful",
      "compliment the frame, the light or the wall instead of the painting",
      "ask where the sky or the horizon went",
      "a gentle, sweet dig at another bidder",
      "a village committee or gardening aside that is clearly a grudge",
      "kindly suggest the artist take up another hobby",
    ],
  },
  {
    id: "chad",
    name: 'Chad "Doodle" McMahon',
    occupation: "Internet Tastemaker & Meme Archivist",
    accent: "#e07a3f",
    voice: "voice-chad",
    persona: `Chad "Doodle" McMahon, internet tastemaker and meme archivist who evaluates everything for virality.
TASTE: LOVES bold shapes, dumb faces, loud colours, anything screenshot-able. MEH: funny but subtle. HATES: tasteful and elegant; it has no shareability.
LENS: engagement, templates, captions, merch.
LANGUAGE: lowercase only, fresh internet slang, never the same phrase twice. His bids are meme numbers at a scale that matches how much he likes it (69, 420, 1337, 6969, 42069, 69420, 420690, 4206900, 6942000).
CRACK: secretly a sincere, well-read art nerd. A real insight slips out, and he covers it fast.`,
    moves: [
      "caption the painting as a meme and describe when you would use it",
      "rate it on a tier list with a petty reason",
      "pitch the merch (mousepad, tote bag, phone case) it would become",
      "predict how it performs online, with a made-up statistic",
      "let a sincere, surprisingly smart insight slip out, then brush it off",
      "name the meme format it already is",
      "react as if it just went viral and he is late to the trend",
    ],
  },
];

// Kirb32 by PureAsbestos — a bright, versatile 32-colour set.
// https://lospec.com/palette-list/kirb32
export const PALETTE = [
  "#0d0305",
  "#3c3444",
  "#6e576e",
  "#917d9b",
  "#c5b7cb",
  "#f7f4e8",
  "#5f4f47",
  "#851246",
  "#d72048",
  "#7d322f",
  "#9d4c2f",
  "#c65e2d",
  "#f96a2d",
  "#ffa300",
  "#e29138",
  "#f7c233",
  "#f9ec41",
  "#11442c",
  "#287a33",
  "#52b139",
  "#8ae931",
  "#0e131e",
  "#203c62",
  "#2a69b0",
  "#00a1de",
  "#6bdad5",
  "#a52eb8",
  "#f7406e",
  "#fc83a2",
  "#f9cf9d",
  "#fba176",
  "#f66f67",
];
