const { existsSync } = require("fs");
const { join } = require("path");

const root = __dirname;

// Polyfill __exportAll used by Rolldown (Vite 8) in SSR bundles
if (typeof globalThis.__exportAll === "undefined") {
  globalThis.__exportAll = function (target, source) {
    for (var key in source) {
      if (key !== "default" && key !== "__esModule") {
        Object.defineProperty(target, key, {
          enumerable: true,
          get: (function (k) {
            return function () {
              return source[k];
            };
          })(key),
        });
      }
    }
  };
}

const outputDir = join(root, ".output");

if (!existsSync(outputDir)) {
  console.log("Building app...");
  const { execSync } = require("child_process");
  execSync("npm run build", { stdio: "inherit", cwd: root });
}

process.env.NITRO = "1";

console.log("Starting Nitro server...");
import("./.output/server/index.mjs").catch((err) => {
  console.error("Nitro failed:", err.message);
  process.exit(1);
});
