import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

const root = import.meta.dirname;

if (!existsSync(join(root, ".output"))) {
  console.log("No build found. Building app...");
  execSync("npm run build", { stdio: "inherit", cwd: root });
} else {
  console.log("Build found.");
}

console.log("Starting server...");
execSync("node .output/server/index.mjs", { stdio: "inherit", cwd: root });
