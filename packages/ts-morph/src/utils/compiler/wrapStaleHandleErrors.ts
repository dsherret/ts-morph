import { errors } from "@ts-morph/common";

/**
 * Translates the compiler's "handle not found" failure into an error that says
 * what the caller did.
 *
 * A type, a symbol and a signature are handles into the program that produced
 * them. A manipulation replaces that program, so every handle taken from it
 * stops resolving at once and the compiler answers a stale one with
 * `type handle 89 not found`, which names nothing the caller can act on. Any
 * method of these classes can be the one that asks, so the translation is
 * installed over the whole prototype rather than repeated in each of them.
 */
export function wrapStaleHandleErrors(prototype: object) {
  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    if (propertyName === "constructor")
      continue;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName)!;
    // only methods reach the compiler — the `compilerType`/`compilerSymbol`
    // getters hand back the handle the caller then asks with, and they are read
    // often enough that wrapping them would be paid for nothing
    if (typeof descriptor.value !== "function")
      continue;
    Object.defineProperty(prototype, propertyName, { ...descriptor, value: wrapMethod(descriptor.value) });
  }
}

function wrapMethod<T extends (...args: any[]) => any>(method: T): T {
  return function(this: unknown, ...args: any[]) {
    try {
      return method.apply(this, args);
    } catch (err) {
      throw toStaleHandleError(err) ?? err;
    }
  } as T;
}

// Two failures mean the same thing to the caller. While the program a handle
// came from is still around the compiler names the kind it could not resolve,
// and the message reads better saying that word back than guessing from the
// class asked; once the registry has let that program go the request cannot be
// routed at all and the compiler names only the snapshot, leaving nothing to say
// which kind it was. The second form is what any request carrying a dead snapshot
// gets, not only a handle lookup — but only these classes hold onto one, so
// reaching it means the caller kept a type, symbol or signature too long.
const staleHandleRegExp = /\b(?:(type|symbol|signature) handle|snapshot) \d+ not found/;

function toStaleHandleError(err: unknown): errors.InvalidOperationError | undefined {
  const message = (err as { message?: unknown } | undefined)?.message;
  const match = typeof message === "string" ? staleHandleRegExp.exec(message) : undefined;
  if (match == null)
    return undefined;
  const kind = match[1] ?? "type, symbol or signature";
  const error = new errors.InvalidOperationError(
    `This ${kind} came from a program that a manipulation has since replaced. Types, symbols, and signatures are snapshots of the `
      + `program that created them, so they cannot be used once a source file has been manipulated — get the ${kind} again from the `
      + `manipulated code.`,
  );
  // the compiler's own message and stack say which handle and which request, which
  // is what to debug with when this translation turns out to be the wrong one
  error.cause = err;
  return error;
}
