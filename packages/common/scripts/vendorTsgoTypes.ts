/**
 * Vendors the tsgo client's declarations into `lib/tsgo/`.
 *
 * The compiler is no longer an npm package this one depends on: it is a fork
 * built out of `submodules/typescript-go`, whose `dist` is untracked build
 * output. Rollup already inlines that client's JavaScript into the bundle, so
 * the published package must carry its declarations too — otherwise `types`
 * points at a file whose imports resolve to nothing on a consumer's disk.
 *
 * Two things are rewritten on the way in:
 *
 *   - `#enums/*`, which only resolves through the tsgo package's own `imports`
 *     map, becomes a relative path. Nothing outside that package can follow a
 *     `#` specifier, and once these files are vendored they are outside it.
 *   - `.ts` import specifiers become extensionless, because the vendored files
 *     no longer sit next to the sources those specifiers name.
 */
import { folders, path } from "./deps.ts";

const clientDist = path.join(folders.root, "submodules/typescript-go/_packages/native-preview/dist");
const vendorDir = path.join(folders.common, "lib/tsgo");

if (!(await exists(clientDist)))
  throw new Error(`The tsgo client is not built. Expected declarations at ${clientDist}.`);

await Deno.remove(vendorDir, { recursive: true }).catch(() => {});

let count = 0;
for await (const filePath of declarationFiles(clientDist)) {
  const relativePath = path.relative(clientDist, filePath);
  const target = path.join(vendorDir, relativePath);
  await Deno.mkdir(path.dirname(target), { recursive: true });
  await Deno.writeTextFile(target, rewriteSpecifiers(await Deno.readTextFile(filePath), relativePath));
  count++;
}

if (count === 0)
  throw new Error(`No declarations found under ${clientDist}.`);

console.log(`vendored ${count} tsgo declaration files to lib/tsgo`);

/**
 * Rewrites the specifiers a vendored file can no longer resolve.
 *
 * `fileRelativePath` is the file's path within the vendored tree, which is what
 * decides how far back up an `#enums/*` import has to reach.
 */
function rewriteSpecifiers(text: string, fileRelativePath: string): string {
  const depth = fileRelativePath.split(/[/\\]/).length - 1;
  const toRoot = depth === 0 ? "./" : "../".repeat(depth);
  return disposableLibReference(text) + text
    .replace(/(["'])#enums\/([A-Za-z0-9_]+)\1/g, (_, quote, name) => `${quote}${toRoot}enums/${name}.enum${quote}`)
    .replace(/(from\s*["']\.{1,2}\/[^"']+)\.ts(["'])/g, "$1$2");
}

/**
 * The `lib` reference a file needs to name `Symbol.dispose`.
 *
 * The client's session types are disposable, which `esnext.disposable` declares.
 * A consumer should not have to add that to their own `lib` to use this package,
 * so the file that needs it asks for it.
 */
function disposableLibReference(text: string): string {
  return /Symbol\.(async)?[Dd]ispose/.test(text) ? `/// <reference lib="esnext.disposable" />\n` : "";
}

async function* declarationFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory)
      yield* declarationFiles(entryPath);
    else if (entry.name.endsWith(".d.ts"))
      yield entryPath;
  }
}

async function exists(filePath: string) {
  try {
    await Deno.stat(filePath);
    return true;
  } catch {
    return false;
  }
}
