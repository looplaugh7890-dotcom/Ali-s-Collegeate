import { execSync } from "child_process";
import { existsSync } from "fs";

console.log("Starting The Ali's Collegiate...");

if (!existsSync(".output") && !existsSync("dist")) {
  console.log("No build found. Building app...");
  execSync("npm run build", { stdio: "inherit" });
} else {
  console.log("Build found. Skipping build step.");
}

console.log("Starting Express server...");
process.chdir(import.meta.dirname);
execSync("node server/index.js", { stdio: "inherit" });
