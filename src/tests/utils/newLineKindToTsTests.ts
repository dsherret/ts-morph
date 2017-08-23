import * as ts from "typescript";
import {expect} from "chai";
import {newLineKindToTs} from "./../../utils";
import {NewLineKind} from "./../../ManipulationSettings";

describe(nameof(newLineKindToTs), () => {
    it("should return carriage return line feed for like", () => {
        expect(newLineKindToTs(NewLineKind.CarriageReturnLineFeed)).to.equal(ts.NewLineKind.CarriageReturnLineFeed);
    });

    it("should return line feed for like", () => {
        expect(newLineKindToTs(NewLineKind.LineFeed)).to.equal(ts.NewLineKind.LineFeed);
    });
});
