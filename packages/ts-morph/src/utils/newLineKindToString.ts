import { errors, NewLineKind } from "@ts-morph/common";

export function newLineKindToString(kind: NewLineKind) {
  switch (kind) {
    case NewLineKind.CarriageReturnLineFeed:
      return "\r\n";
    case NewLineKind.LineFeed:
      return "\n";
    case NewLineKind.None:
      // `None` is new in tsgo and sits on the value (0) that used to mean
      // CarriageReturnLineFeed, so this is almost always a hard-coded 0 from
      // before the migration rather than a deliberate choice.
      throw new errors.InvalidOperationError(
        "NewLineKind.None does not describe a line ending. Note that the numeric values changed: 0 is now None, 1 is CarriageReturnLineFeed (\\r\\n) "
          + "and 2 is LineFeed (\\n). Use NewLineKind.CarriageReturnLineFeed or NewLineKind.LineFeed by name.",
      );
    default:
      throw new errors.NotImplementedError(`Not implemented newline kind: ${kind}`);
  }
}
