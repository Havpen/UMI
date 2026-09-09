import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const media = join(root, "public", "media");
const ffmpeg = process.env.FFMPEG_BIN?.trim() || ffmpegPath;

if (!ffmpeg || !existsSync(ffmpeg)) {
  console.error("ffmpeg не найден");
  process.exit(1);
}

function run(args, label) {
  console.log(label);
  const result = spawnSync(ffmpeg, args, { stdio: "inherit", windowsHide: true });
  if (result.status !== 0) {
    console.error("ffmpeg failed:", label);
    process.exit(result.status ?? 1);
  }
}

function kb(file) {
  return Math.round(statSync(file).size / 1024);
}

function collectImages(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "aggregators") continue;
      out.push(...collectImages(full));
      continue;
    }
    if (/\.(jpe?g|png)$/i.test(name.name)) out.push(full);
  }
  return out;
}

function toWebp(file) {
  const dest = file.replace(/\.(jpe?g|png)$/i, ".webp");
  run(
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      file,
      "-vf",
      "scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease",
      "-c:v",
      "libwebp",
      "-quality",
      "90",
      "-compression_level",
      "4",
      dest,
    ],
    `webp ${dest.replace(root, "")} (from ${kb(file)} KB)`,
  );
}

for (const file of collectImages(media)) toWebp(file);
console.log("done");
