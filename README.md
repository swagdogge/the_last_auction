## HOW TO PLAY
- visit https://the-last-auction.web.app/
- click "enter the studio", to play with real AI bidder, you need a Gemini API key,
  you can get a free one at https://aistudio.google.com/api-keys

## TESTING

verify core game functions:
    ```npm test```

test full website locally:
    ```npm install``` (if node_modules is missing)
    ```npm run dev -- --config vite.config.firebase.js```

kill local server:
    ```pkill -f "vite dev --config vite.config.firebase.js"```