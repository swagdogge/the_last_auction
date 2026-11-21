# Putting The Last Auction on Firebase

The game runs entirely in the player's browser. No Cloud Functions, no Firestore,
no Firebase Auth, and no Base44 runtime: Firebase Hosting alone is enough, and the
free Spark plan covers it. AI judging uses each player's own Gemini key.

## Once per project

1. Copy this project to your computer (it needs `package.json`, `src/`, `firebase.json`
   and `vite.config.firebase.js`).
2. `npm install`
3. `npx firebase-tools login`
4. `npx firebase-tools use --add` — pick the Firebase project you just created and
   give it the alias `default` (this writes `.firebaserc`).

## Every deploy

```
npm run build:firebase
npx firebase-tools deploy --only hosting
```

The first deploy prints the public URL, something like
`https://<your-project-id>.web.app`.

## Automatic deploys from GitHub

The GitHub Actions workflow deploys to Firebase Hosting whenever a commit is
pushed to `main`. In the repository settings, add an Actions secret named
`FIREBASE_SERVICE_ACCOUNT` containing a Google Cloud service-account JSON key
with permission to deploy Firebase Hosting. The workflow builds the static app
and publishes it to the live channel.

## What each piece does

- `npm run build:firebase` builds a static single-page app into `dist/client`
  (no Base44 plugin, no Cloudflare worker) and copies the page shell to `index.html`.
- `firebase.json` serves `dist/client` and rewrites every path to `index.html`.
- The game's only network requests are to Google's Gemini endpoint, made by the
  player's browser with the key the player pasted in. That key is held in the tab's
  memory, never stored, and never sent anywhere else.

The Base44 preview of this project keeps using the platform's own build
(`vite.config.js`); the two builds don't interfere.
