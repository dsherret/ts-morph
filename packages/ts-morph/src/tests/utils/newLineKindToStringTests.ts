import { NewLineKind } from "@ts-morph/common";
import { expect } from "chai";
import { newLineKindToString } from "../../utils";

describe(nameof(newLineKindToString), () => {
    it("should return carriage return line feed for like", () => {
        expect(newLineKindToString(NewLineKind.CarriageReturnLineFeed)).to.equal("\r\n");
    });

    it("should return line feed for like", () => {
        expect(newLineKindToString(NewLineKind.LineFeed)).to.equal("\n");
    });
});
