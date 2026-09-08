const { writeFileSync, readdirSync, existsSync } = require("fs");
const { join } = require("path");

const root = __dirname;
const publicDir = join(root, ".output", "public");
const assetsDir = join(publicDir, "assets");

if (!existsSync(assetsDir)) {
  console.error("No build output found. Run 'npm run build' first.");
  process.exit(1);
}

const files = readdirSync(assetsDir);
const mainJs = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const mainCss = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

if (!mainJs) {
  console.error("Could not find main JS bundle in build output.");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Ali's Collegiate</title>
  <meta name="description" content="A Complete Ecosystem for Students & Teachers - Empowering students and teachers with the knowledge, tools, resources, and opportunities they need to learn, grow, and move forward." />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  ${mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}" />` : ""}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/${mainJs}"></script>
</body>
</html>`;

writeFileSync(join(publicDir, "index.html"), html);
console.log("Generated index.html with:", mainJs, mainCss || "(no css)");
