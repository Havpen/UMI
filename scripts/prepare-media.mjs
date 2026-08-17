import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src =
  [
    process.env.HERO_SRC,
    "C:\\Users\\Jeck\\Documents\\Adobe\\Premiere Pro\\14.0\\IMG_3553.mp4",
    join(root, "assets", "IMG_3553.mp4"),
    join(root, "assets", "IMG_3553.MOV"),
  ].find((path) => path && existsSync(path)) ?? null;

if (!src) {
  console.error("Hero source not found");
  process.exit(1);
}

console.log("Hero source:", src);

const outDir = join(root, "public", "media");
mkdirSync(outDir, { recursive: true });

function run(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// As shot: full duration, 60 fps, no cuts. Only codec/resolution/bitrate.
run([
  "-y",
  "-i",
  src,
  "-frames:v",
  "1",
  "-update",
  "1",
  "-q:v",
  "3",
  "-vf",
  "scale=1920:1080:flags=lanczos",
  join(outDir, "hero-poster.jpg"),
]);

run([
  "-y",
  "-hwaccel",
  "auto",
  "-i",
  src,
  "-an",
  "-vf",
  "scale=1920:1080:flags=lanczos",
  "-c:v",
  "libx264",
  "-preset",
  "veryfast",
  "-crf",
  "28",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  join(outDir, "hero.mp4"),
]);

run([
  "-y",
  "-hwaccel",
  "auto",
  "-i",
  src,
  "-an",
  "-vf",
  "scale=1280:720:flags=lanczos",
  "-c:v",
  "libvpx-vp9",
  "-b:v",
  "0",
  "-crf",
  "36",
  "-deadline",
  "realtime",
  "-cpu-used",
  "8",
  "-row-mt",
  "1",
  join(outDir, "hero.webm"),
]);
