## HOW TO PLAY
- visit https://the-last-auction.web.app/
- click on AI bidders to insert the Gemini API key to use, you can get a free one at
  https://aistudio.google.com/api-keys
- click "enter the studio"

## TESTING

verify core game functions:
    ```npm test```

test full website locally:
    ```npm install``` (if node_modules is missing)
    ```npm run dev -- --config vite.config.firebase.js```

kill local server:
    ```pkill -f "vite dev --config vite.config.firebase.js"```