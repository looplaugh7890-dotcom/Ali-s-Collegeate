import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

const root = import.meta.dirname;

if (!existsSync(join(root, ".output"))) {
  console.log("Building app...");
  execSync("npm run build", { stdio: "inherit", cwd: root });
}

console.log("Starting Nitro server...");
execSync("node .output/server/index.mjs", { stdio: "inherit", cwd: root });
