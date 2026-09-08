import { execSync } from "child_process";
import { existsSync } from "fs";

if (!existsSync(".output")) {
  console.log("Building app...");
  execSync("npm run build", { stdio: "inherit" });
}

console.log("Starting server...");
execSync("node .output/server/index.mjs", { stdio: "inherit" });
