import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.resolve("src");
const outputRoot = path.resolve(".vitest-out", "src");

async function copyCssFiles(currentSourceDir) {
  const entries = await readdir(currentSourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(currentSourceDir, entry.name);
    const relativePath = path.relative(sourceRoot, sourcePath);
    const outputPath = path.join(outputRoot, relativePath);

    if (entry.isDirectory()) {
      await copyCssFiles(sourcePath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".css")) {
      continue;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await copyFile(sourcePath, outputPath);
  }
}

await copyCssFiles(sourceRoot);
