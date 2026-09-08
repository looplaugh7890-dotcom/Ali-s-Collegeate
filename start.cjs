const { existsSync } = require("fs");
const { join } = require("path");

const root = __dirname;
const outputDir = join(root, ".output");

if (!existsSync(outputDir)) {
  console.log("Building app...");
  const { execSync } = require("child_process");
  execSync("npm run build", { stdio: "inherit", cwd: root });
} else {
  console.log("Build found. Running SSR fix...");
  try { require("./fix-ssr.cjs"); } catch(e) {}
}

process.env.NITRO = "1";

console.log("Starting Nitro server...");
import("./.output/server/index.mjs").catch((err) => {
  console.error("Nitro failed:", err.message);
  process.exit(1);
});
