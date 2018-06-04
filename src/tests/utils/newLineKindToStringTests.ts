import { expect } from "chai";
import { NewLineKind } from "../../typescript";
import { newLineKindToString } from "../../utils";

describe(nameof(newLineKindToString), () => {
    it("should return carriage return line feed for like", () => {
        expect(newLineKindToString(NewLineKind.CarriageReturnLineFeed)).to.equal("\r\n");
    });

    it("should return line feed for like", () => {
        expect(newLineKindToString(NewLineKind.LineFeed)).to.equal("\n");
    });
});
