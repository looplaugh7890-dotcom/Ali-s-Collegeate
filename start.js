import { execSync } from "child_process";
import { existsSync } from "fs";

if (!existsSync(".output") && !existsSync("dist")) {
  console.log("Building app...");
  execSync("npm run build", { stdio: "inherit" });
}

console.log("Starting server...");
execSync("node server/index.js", { stdio: "inherit" });
