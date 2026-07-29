import { ts } from "@ts-morph/common";

/**
 * Splits rendered documentation text into display parts.
 *
 * The compiler renders a documentation comment or JSDoc tag text as a single
 * plain string rather than a classified part list, so the whole string becomes
 * one `"text"` part and empty text becomes no parts at all.
 *
 * @internal
 */
export function toSymbolDisplayParts(text: string | undefined): ts.SymbolDisplayPart[] {
  if (text == null || text.length === 0)
    return [];
  return [{ kind: "text", text }];
}
