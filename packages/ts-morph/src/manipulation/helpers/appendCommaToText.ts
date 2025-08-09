import { ts } from "@ts-morph/common";
const scanner = ts.createScanner(ts.ScriptTarget.Latest, true);

/**
 * Appends a comma to the text taking into account the various language aspects.
 */
export function appendCommaToText(text: string) {
  const pos = getAppendCommaPos(text);
  if (pos === -1)
    return text;

  return text.substring(0, pos) + "," + text.substring(pos);
}

/**
 * Gets the position in the text that a comma could be appended.
 * @param text - Text to search.
 * @returns The position to append. -1 otherwise.
 */
export function getAppendCommaPos(text: string) {
  scanner.setText(text);

  try {
    let token = scanner.scan();

    if (token === ts.SyntaxKind.EndOfFileToken)
      return -1;

    // A stack to track nested template literals and their inner brace expressions
    // otherwise, the scanner will interpret text in template literals as actual tokens,
    // e.g. the /* in `${p}/*` will be interpreted as a comment, not inside the template literal
    const templateStack: ts.SyntaxKind[] = [];

    while (token !== ts.SyntaxKind.EndOfFileToken) {
      switch (token) {
        case ts.SyntaxKind.TemplateHead:
          templateStack.push(token);
          break;
        case ts.SyntaxKind.OpenBraceToken:
          if (templateStack.length > 0)
            templateStack.push(token);
          break;
        case ts.SyntaxKind.CloseBraceToken: {
          if (templateStack.length > 0) {
            const lastTemplateStackToken = templateStack.at(-1);
            if (lastTemplateStackToken === ts.SyntaxKind.TemplateHead) {
              // Re-scan the template token to skip the inner text
              token = scanner.reScanTemplateToken(false);
              // Only pop for TemplateTail, not for TemplateMiddle
              if (token === ts.SyntaxKind.TemplateTail)
                templateStack.pop();
            } else {
              templateStack.pop();
            }
          }
          break;
        }
      }
      token = scanner.scan();
    }

    const pos = scanner.getTokenFullStart();
    return text[pos - 1] === "," ? -1 : pos;
  } finally {
    // ensure the scanner doesn't hold onto the text so the string
    // gets garbage collected
    scanner.setText(undefined);
  }
}
