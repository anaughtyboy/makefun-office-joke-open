// One-line office joke for the make.fun bounty
// "Make the AI Judge Laugh: The Office Joke (Open)".
// The program writes the joke, and nothing else, to
// MAKEFUN_OUTPUT_DIR/entry.txt (default /output).
// The gate wants UTF-8 text of 1 to 200 characters, so the
// line is checked before it is written, then read back and
// compared byte for byte.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE =
  "I told my boss I needed a raise. He said, 'Me too,' and promoted the printer.";

const MAX_CHARS = 200;

function fail(message: string): never {
  throw new Error(`office-joke: ${message}`);
}

// The entry has to be one line, so any line break or stray
// control character means the text is not what we think it is.
for (const ch of JOKE) {
  const code = ch.codePointAt(0) ?? 0;
  if (code < 0x20 && ch !== "\t") fail("control character in joke");
  if (ch === "\n" || ch === "\r") fail("joke spans more than one line");
}
if (JOKE.length === 0) fail("joke is empty");
if (JOKE.length > MAX_CHARS) {
  fail(`joke is ${JOKE.length} characters, over the ${MAX_CHARS} limit`);
}
if (JOKE !== JOKE.trim()) fail("joke has leading or trailing whitespace");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const target = join(outDir, "entry.txt");
const bytes = Buffer.from(JOKE, "utf8");
writeFileSync(target, bytes);

// Read it back and make sure the file holds exactly the
// bytes we wrote, no trailing newline, no extra whitespace.
const back = readFileSync(target);
if (!back.equals(bytes)) fail("entry.txt does not match the joke");
if (back.length !== bytes.length) {
  fail(`entry.txt is ${back.length} bytes, expected ${bytes.length}`);
}
if (back.length > 0 && back[back.length - 1] === 0x0a) {
  fail("entry.txt ends with a newline");
}

console.log(
  `wrote ${bytes.length} bytes (${JOKE.length} characters) to ${target}`,
);
