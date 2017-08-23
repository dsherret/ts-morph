import * as ts from "typescript";
import * as errors from "./../errors";
import {NewLineKind} from "./../ManipulationSettings";

export function newLineKindToTs(kind: NewLineKind) {
    switch (kind) {
        case NewLineKind.CarriageReturnLineFeed:
            return ts.NewLineKind.CarriageReturnLineFeed;
        case NewLineKind.LineFeed:
            return ts.NewLineKind.LineFeed;
        default:
            throw new errors.NotImplementedError("Not implemented newline kind");
    }
}
