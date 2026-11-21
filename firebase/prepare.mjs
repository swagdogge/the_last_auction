import { copyFile } from "node:fs/promises";

// Firebase Hosting serves index.html for the single-page app. TanStack's SPA
// build writes the same shell as _shell.html.
await copyFile("dist/client/_shell.html", "dist/client/index.html");
console.log("Firebase build ready: dist/client");