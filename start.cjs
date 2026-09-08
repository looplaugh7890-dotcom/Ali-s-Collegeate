const { spawnSync, spawn } = require("child_process");
const { existsSync } = require("fs");
const { join } = require("path");

const root = __dirname;

if (!existsSync(join(root, ".output"))) {
  console.log("Building app...");
  const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", cwd: root, shell: true });
  if (build.status !== 0) {
    console.error("Build failed!");
    process.exit(build.status);
  }
}

console.log("Starting Nitro server...");
const server = spawn("node", [".output/server/index.mjs"], { stdio: "inherit", cwd: root });
server.on("exit", (code) => {
  console.error("Server exited with code:", code);
  process.exit(code || 1);
});
