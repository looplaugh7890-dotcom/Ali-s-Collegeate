// Hostinger entry point — boots the Express server
// Framework preset: Express | Entry file: start.cjs
const { existsSync } = require("fs");
const { join } = require("path");
const { execSync } = require("child_process");

const root = __dirname;
const distIndex = join(root, "dist", "index.html");

// If dist folder doesn't exist yet, build the frontend
if (!existsSync(distIndex)) {
  console.log("dist/index.html not found. Running build...");
  try {
    execSync("npm run build", { stdio: "inherit", cwd: root });
    console.log("Frontend build complete.");
  } catch (err) {
    console.error("Frontend build failed:", err.message);
  }
}

console.log("Starting Express server...");
import("./server/index.js").catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
