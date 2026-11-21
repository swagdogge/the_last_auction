import { useEffect, useState } from "react";

// The player's Gemini key lives in this tab's memory only. Never localStorage,
// never a cookie, never a request anywhere except Google's own endpoint.
let currentKey = "";
const listeners = new Set();

export function getPlayerKey() {
  return currentKey;
}

export function savePlayerKey(value) {
  currentKey = (value || "").trim();
  listeners.forEach((listener) => listener(currentKey));
}

export function clearPlayerKey() {
  savePlayerKey("");
}

export function usePlayerKey() {
  const [key, setKey] = useState(currentKey);

  useEffect(() => {
    listeners.add(setKey);
    setKey(currentKey);
    return () => listeners.delete(setKey);
  }, []);

  return key;
}