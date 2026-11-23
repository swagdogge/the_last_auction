# The Last Auction
 
Paint three pictures. Sell them to six AI bidders with very strong opinions. Then listen to a documentary narrator solemnly interpret your life's work.
 
**Play it:** https://the-last-auction.web.app/
 
![The Last Auction screenshot](readme_media/Screenshot%20from%202026-11-23%2002-54-22.png)
 
## How to play
 
1. Open the link and click **Enter the studio**.
2. Paint a picture with the simple palette and brushes, and give it a title.
3. Six bidders look at your actual image, react to it in character, and fight over it.
4. Repeat for three paintings in total.
5. Once the artist is gone, a narrator looks at all three works and the final sale prices and tries to find meaning in them.
To play with real AI bidders you need a Gemini API key. A free one is available at https://aistudio.google.com/api-keys.
 
**Privacy / your key.** Your Gemini API key is kept only in this browser tab's memory while the page is open. It is not written to `localStorage`, cookies, or any game server. When AI mode is on, the browser sends the key directly to Google's Gemini API endpoint (`generativelanguage.googleapis.com`) to authorize each request; this app does not send it anywhere else. Your painting images and the text prompts are sent to Gemini too. Without a key, the game uses its local jury and nothing is uploaded. Google's free-tier terms may allow submitted data to be used to improve its products, so check the [current Gemini API terms](https://ai.google.dev/gemini-api/terms) before sending anything you want to keep private.
 
## Screenshots

<table>
  <tr>
    <td align="center"><a href="readme_media/Screenshot%20from%202026-11-23%2002-57-35.png"><img src="readme_media/Screenshot%20from%202026-11-23%2002-57-35.png" alt="Screenshot 2 of 10" width="320"></a><br><sub>the studio with a small set of tools, 32 colors to choose from, a feline companion and a printer.. whatever you'd need that for..</sub></td>
  </tr>
  <tr>
    <td align="center"><a href="readme_media/Screenshot%20from%202026-11-23%2002-58-26.png"><img src="readme_media/Screenshot%20from%202026-11-23%2002-58-26.png" alt="Screenshot 3 of 10" width="320"></a><br><sub>the process of naming your work can take up just as much time as its creation.. or sometimes even more!</sub></td>
    <td align="center"><a href="readme_media/Screenshot%20from%202026-11-23%2002-58-54.png"><img src="readme_media/Screenshot%20from%202026-11-23%2002-58-54.png" alt="Screenshot 4 of 10" width="320"></a><br><sub>to the salesroom it goes! First impressions might be rough, but that doesn't have to mean you wont earn yourself a new luxury car with this sale</sub></td>
  </tr>
  <tr>
    <td align="center"><a href="readme_media/Screenshot%20from%202026-11-23%2002-59-21.png"><img src="readme_media/Screenshot%20from%202026-11-23%2002-59-21.png" alt="Screenshot 5 of 10" width="320"></a><br><sub>auctions are commented on by AI while they happen, I've never been to an arts auction, I assume this would be impolite in real life</sub></td>
    <td align="center"><a href="readme_media/Screenshot%20from%202026-11-23%2002-59-48.png"><img src="readme_media/Screenshot%20from%202026-11-23%2002-59-48.png" alt="Screenshot 6 of 10" width="320"></a><br><sub>the SHOW DEBUG INFO section can give interested minds a more detailed look into what exactly the AI was doing</sub></td>
  </tr>
  <tr>
    <td align="center"><a href="readme_media/Screenshot%20from%202026-11-23%2003-00-12.png"><img src="readme_media/Screenshot%20from%202026-11-23%2003-00-12.png" alt="Screenshot 7 of 10" width="320"></a><br><sub>While an auction is temporary, the rivalry between some bidders appears to be eternal</sub></td>
    <td align="center"><a href="readme_media/Screenshot%20from%202026-11-23%2003-20-38.png"><img src="readme_media/Screenshot%20from%202026-11-23%2003-20-38.png" alt="Screenshot 10 of 10" width="320"></a><br><sub>"Death is very often referred to as a good career move." — Buddy Holly, American </sub></td>
  </tr>
</table>

## The bidders
 
Each bidder has their own taste, quirks and sense of humour, so the same painting can make one of them weep and another one walk out.
 
| Bidder | Cares about |
|---|---|
| Gordon Rage-say, TV chef | Anything that looks like food |
| Julian Pretentiousberg, curator | Deliberate minimalism and statements |
| Prince Leopold Rembrandt-Stuffington | Visible effort and craft |
| Marguerite Von Quirk, performance artist | Accidental chaos and haunted blobs |
| Ines Barlow, landscape preservationist | Scenery and a sense of place |
| Chad "Doodle" McMahon, meme archivist | Meme potential |
 
## How the AI works

This game was built for the AI-controlled NPCs track, so this is the interesting part.

- **One call for the whole room.** With a Gemini key, each lot is judged in a single request to `gemini-3.5-flash-lite`. The player's actual canvas image is attached, and a JSON schema asks for six verdicts (a reaction, private interest and maximum bid), an ordered bidding script, and the winner's and runner-up's closing lines.
- **Personas, with a rotating comic angle.** The six bidders keep their own tastes and contradictions from `src/lib/bidders.js`. Each lot also gets one of that bidder's existing `moves`; the game picks it by lot index, so the angle changes every lot without inventing catchphrases or new joke templates.
- **The AI writes the auction; the game keeps it honest.** The script is replayed through `replayScript()` under the house rules: a $500,000 opening, at least 5% between bids, no bid above a bidder's own ceiling, no self-overbidding, and at most 16 bids. Illegal bids are dropped or folded into the last legal bid. If the AI's declared winner loses their last bid to the clamp, the game tries to restore a legal winning bid and keeps the AI's final lines.
- **Memory across lots.** Before lots 2 and 3, the prompt gets a compact ledger of earlier sales: who won, who lost, who passed and what people last said. Previous winners are nudged to sit the next lot out; the prompt also forbids the same bidder winning twice. Bidders are told not to reuse old jokes, objects or wording.
- **No key? Local/demo mode still plays.** A rules-based local jury writes reactions and secret ceilings, and the game builds the bidding war itself. In that mode no painting or prompt is sent to Gemini.
- **The finale.** One final call sees all three images and the sale ledger, then writes the retrospective in a randomly chosen narrator voice: the earnest host, the petty omniscient narrator, or the overqualified historian. Buyer lines are passed along as optional colour.
## Run it locally
 
Check the core game logic:
 
```bash
npm test
```
 
Run the whole site locally:
 
```bash
npm install   # only if node_modules is missing
npm run dev -- --config vite.config.firebase.js
```
 
Stop the local server:
 
```bash
pkill -f "vite dev --config vite.config.firebase.js"
```
 
## Credits
 
- Painting palette: Kirb32 by Lospec, https://lospec.com/palette-list/kirb32
- AI: Google Gemini API
- Built with Base44, hosted on Firebase
- Inspiration for game direction: https://store.steampowered.com/app/582550/Passpartout_The_Starving_Artist/
- Similar project I made before: https://scratch.mit.edu/projects/1182440503/

## AI usage
 
This is a vibecoded project. That is in the nature of the event it was made for. After the event I exported the project and added some human touches, but they only make up a small part of the code.
 
## Background
 
The Last Auction was made at the Game Garage (Give(a)Go x Base44) event on 21.11.2026 in Heilbronn. The task was to build a game with Base44, and this one is for track 2: AI-controlled NPCs.
 
I had already built an art auction game in Scratch, and I wanted to come back to the idea because I liked that the bidders could actually see the player's art and, once the artist dies, even try to interpret it.
A long time before that Scatch game came to be I saw Let's play of a game called 'Passpartout: The Starving Artist', which
served as an inspiration for me to create my own 'Art selling game'
You can check its Steam page here: https://store.steampowered.com/app/582550/Passpartout_The_Starving_Artist/

More about Give(a)Go: https://www.giveago.co/
Base44: https://app.base44.com/
 
## Notes on building with Base44
 
*This reflects my own experience with the free tier in November 2026. I'm not affiliated with Base44, and the limits may have changed since.*
 
- **The code was better than I expected.** It was hidden from plain sight, but once I found it, it was reasonably well structured, probably helped by this being a small 2D game.
- **Free tier is "look, don't touch."** I couldn't edit the code, and code export and the GitHub integration were paid features.
- **Getting the code out.** I asked Base44's AI agent for help, and it built a download page inside the project so I could access the files.
- **Going independent.** My integration credits ran out quickly, so the agent switched all AI calls to the free Gemini API. As a last step it rewrote the project so it could be hosted on Firebase instead of Base44.
- **The agent itself impressed me.** It kept offering workable solutions instead of giving up or hallucinating. I dont't know for sure how it works, but I suspect a lot of that comes from it searching Base44's own documentation, which stops it from inventing features that don't exist.
## License
 
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — see [LICENSE](LICENSE). You may share and adapt this project for noncommercial purposes, with attribution and under the same license. Selling it or using it commercially is not permitted. Third-party assets keep their own terms.
 
