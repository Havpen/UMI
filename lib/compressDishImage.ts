import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const MAX_BYTES = 12 * 1024 * 1024;

function sniffImage(buf: Buffer) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return "";
}

function ffmpegBinary() {
  const fromEnv = process.env.FFMPEG_BIN?.trim();
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const name = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const local = path.join(process.cwd(), "node_modules", "ffmpeg-static", name);
  return existsSync(local) ? local : "";
}

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const bin = ffmpegBinary();
    if (!bin) {
      reject(new Error("ffmpeg не найден"));
      return;
    }
    const child = spawn(bin, args, { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(() => reject(new Error("Сжатие фото заняло слишком долго")));
    }, 20_000);
    child.stderr.on("data", (chunk) => {
      err += String(chunk);
      if (err.length > 4000) err = err.slice(-2000);
    });
    child.on("error", (error) => {
      finish(() => reject(error));
    });
    child.on("close", (code) => {
      finish(() => {
        if (code === 0) resolve();
        else reject(new Error(err.trim() || `ffmpeg ${code}`));
      });
    });
  });
}

export async function compressDishJpeg(input: Buffer, destJpg: string) {
  if (input.length > MAX_BYTES) {
    throw new Error("Файл больше 12 МБ");
  }
  if (!sniffImage(input)) {
    throw new Error("Нужна картинка JPG, PNG или WEBP");
  }
  const dir = await mkdtemp(path.join(tmpdir(), "umi-dish-"));
  const src = path.join(dir, "in.bin");
  try {
    await writeFile(src, input);
    await runFfmpeg([
      "-hide_banner",
      "-loglevel",
      "error",
      "-nostdin",
      "-y",
      "-i",
      src,
      "-frames:v",
      "1",
      "-update",
      "1",
      "-vf",
      "scale='min(1400,iw)':'min(1400,ih)':force_original_aspect_ratio=decrease",
      "-q:v",
      "3",
      destJpg,
    ]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
