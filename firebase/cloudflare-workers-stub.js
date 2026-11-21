// The static Firebase build has no Cloudflare runtime. Base44's error capture
// (kept in src/start.js by the platform) imports these two; here they do nothing.
export const env = {};
export const waitUntil = () => {};