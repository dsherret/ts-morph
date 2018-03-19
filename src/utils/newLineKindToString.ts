import {ts, NewLineKind} from "../typescript";
import * as errors from "../errors";

export function newLineKindToString(kind: NewLineKind) {
    switch (kind) {
        case NewLineKind.CarriageReturnLineFeed:
            return "\r\n";
        case NewLineKind.LineFeed:
            return "\n";
        default:
            throw new errors.NotImplementedError(`Not implemented newline kind: ${kind}`);
    }
}
