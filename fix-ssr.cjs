const { readFileSync, writeFileSync, readdirSync } = require("fs");
const { join } = require("path");

const root = __dirname;
const ssrDir = join(root, ".output", "server", "_ssr");

if (!require("fs").existsSync(ssrDir)) {
  console.log("No SSR dir found, skipping fix.");
  process.exit(0);
}

const polyfill = `
var __exportAll = globalThis.__exportAll || function(target, source) {
  for (var key in source) {
    if (key !== "default" && key !== "__esModule") {
      Object.defineProperty(target, key, {
        enumerable: true,
        get: (function(k) { return function() { return source[k]; }; })(key),
      });
    }
  }
};
`;

let fixed = 0;
const files = readdirSync(ssrDir).filter(f => f.endsWith(".mjs"));

for (const file of files) {
  const filePath = join(ssrDir, file);
  let content = readFileSync(filePath, "utf8");

  if (content.includes("__exportAll(") && !content.includes("var __exportAll")) {
    content = polyfill + content;
    writeFileSync(filePath, content);
    console.log("Fixed:", file);
    fixed++;
  }
}

console.log(`Fixed ${fixed} files.`);
