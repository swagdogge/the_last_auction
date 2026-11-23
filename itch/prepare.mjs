import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import path from "node:path";

const CLIENT = "dist/itch/client";
const SHELL = path.join(CLIENT, "_shell.html");
const INDEX = path.join(CLIENT, "index.html");
const ZIP = "dist/the-last-auction-html5.zip";

// TanStack writes a couple of modulepreload URLs as "/./assets/...". itch.io
// serves the game from a mirror path, so every asset URL must be relative.
let html = await readFile(SHELL, "utf8");
html = html
  .replace(/\/\.\/assets\//g, "./assets/")
  .replace(/(["'(])\/assets\//g, "$1./assets/")
  .replace("</head>", '<link rel="icon" href="data:,"></head>');
await writeFile(INDEX, html);

// TanStack Start's generated entry overwrites the router basepath with "." for
// a relative build. On itch.io that misses the mirror subpath, so make it read
// the cleaned-up directory at runtime instead.
const assetDir = path.join(CLIENT, "assets");
for (const entry of await readdir(assetDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
  const file = path.join(assetDir, entry.name);
  const code = await readFile(file, "utf8");
  const patched = code.replaceAll(
    "basepath:`.`",
    String.raw`basepath:(window.location.pathname.replace(/\/+$/,"")||"/")`,
  );
  if (patched !== code) await writeFile(file, patched);
}

await copyFile("LICENSE", path.join(CLIENT, "LICENSE.txt"));
await writeFile(
  path.join(CLIENT, "README-itch.txt"),
  [
    "The Last Auction",
    "by swagdogge",
    "",
    "Open index.html in a modern browser. No install, no account, no server.",
    "The local jury works offline. Entering a Gemini key makes the game call",
    "Google directly from your browser.",
    "",
    "Licensed CC BY-NC-SA 4.0. See LICENSE.txt.",
    "",
  ].join("\n"),
);

const files = [];

async function walk(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await walk(full, relative);
    } else if (entry.isFile()) {
      const info = await stat(full);
      files.push({
        name: relative.replaceAll("\\", "/"),
        data: await readFile(full),
        mtime: info.mtime,
      });
    }
  }
}

await walk(CLIENT);
files.sort((a, b) => {
  if (a.name === "index.html") return -1;
  if (b.name === "index.html") return 1;
  return a.name.localeCompare(b.name);
});

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function makeZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const compressed = deflateRawSync(entry.data, { level: 9 });
    const crc = crc32(entry.data);
    const { time, date } = dosDateTime(entry.mtime);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);

    localParts.push(local, name, compressed);
    centralParts.push(central, name);
    offset += local.length + name.length + compressed.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, end]);
}

await mkdir(path.dirname(ZIP), { recursive: true });
await writeFile(ZIP, makeZip(files));
console.log(`itch.io build ready: ${CLIENT}`);
console.log(`Upload this ZIP to itch.io: ${ZIP}`);
