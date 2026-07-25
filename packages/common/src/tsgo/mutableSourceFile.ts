/**
 * A mutable view over a tsgo `SourceFile`.
 *
 * `RemoteSourceFile` exposes `fileName` (and most other data) as prototype
 * getters with no setters, but ts-morph assigns to them — the document cache
 * re-stamps `fileName` when reusing a parsed file across projects, and the
 * document registry stamps a `version`. Assigning directly throws.
 *
 * This returns an object that inherits from the real source file, so every
 * getter and method still resolves against the original (and `nodes` stays
 * shared, preserving node identity), while the overridden fields become plain
 * writable properties that shadow the getters.
 */
import type { SourceFile } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/index.js";

export interface MutableSourceFileOverrides {
  fileName?: string;
  version?: string;
}

/** Creates a writable view over `sourceFile` with the given fields overridden. */
export function createMutableSourceFile(sourceFile: SourceFile, overrides: MutableSourceFileOverrides = {}): SourceFile {
  const view = Object.create(sourceFile) as SourceFile;
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined)
      continue;
    defineWritable(view, key, value);
  }
  return view;
}

/**
 * Assigns `value` to `key` even when the prototype exposes it as a getter with
 * no setter, by defining an own data property that shadows it.
 */
export function setSourceFileProperty(sourceFile: SourceFile, key: string, value: unknown): void {
  defineWritable(sourceFile, key, value);
}

function defineWritable(target: object, key: string, value: unknown): void {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}
