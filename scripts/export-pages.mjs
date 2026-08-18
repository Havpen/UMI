import { existsSync } from "node:fs";
import { cp, rename, rm, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const api = path.join(root, "app", "api");
const parked = path.join(root, ".api-export-tmp");
const shadow = path.join(path.dirname(root), `${path.basename(root)}-pages-build`);
const skip = new Set([
  "node_modules",
  ".next",
  ".next-export",
  "out",
  "preview",
  ".git",
  "data",
  "assets",
  ".pages-build",
  ".api-export-tmp",
  "tmp-preview",
]);

function run(command, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

process.env.GITHUB_PAGES = "true";
process.env.NEXT_PUBLIC_SITE_URL ??= "https://havpen.github.io/UMI";

async function parkApi() {
  if (!existsSync(api) && existsSync(parked)) await rename(parked, api);
  if (existsSync(parked)) await rm(parked, { recursive: true, force: true });
  try {
    await rename(api, parked);
    return "moved";
  } catch (err) {
    if (err && (err.code === "EXDEV" || err.code === "EPERM")) return "locked";
    throw err;
  }
}

function exportedDir(from) {
  const out = path.join(from, "out");
  if (existsSync(path.join(out, "index.html"))) return out;
  const dist = path.join(from, process.env.NEXT_DIST_DIR || ".next-export");
  if (existsSync(path.join(dist, "index.html"))) return dist;
  throw new Error("Static export folder not found");
}

async function markExport(dir) {
  await writeFile(path.join(dir, ".nojekyll"), "");
}

async function buildInShadow() {
  if (existsSync(shadow)) await rm(shadow, { recursive: true, force: true });
  await cp(root, shadow, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(root, src);
      if (!rel || rel.startsWith("..")) return true;
      return !skip.has(rel.split(path.sep)[0]);
    },
  });
  await rm(path.join(shadow, "app", "api"), { recursive: true, force: true });
  await symlink(
    path.join(root, "node_modules"),
    path.join(shadow, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await run("npx", ["next", "build"], shadow);
  const from = exportedDir(shadow);
  const to = path.join(root, "out");
  if (existsSync(to)) await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  await markExport(to);
  await rm(shadow, { recursive: true, force: true });
}

const mode = await parkApi();
try {
  if (mode === "moved") {
    await run("npx", ["next", "build"]);
    await markExport(path.join(root, "out"));
  } else {
    await buildInShadow();
  }
} finally {
  if (mode === "moved" && existsSync(parked)) await rename(parked, api);
}
