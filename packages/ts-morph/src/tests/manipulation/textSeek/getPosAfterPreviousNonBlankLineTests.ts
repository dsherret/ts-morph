import { expect } from "chai";
import { getPosAfterPreviousNonBlankLine } from "../../../manipulation/textSeek";

describe(nameof(getPosAfterPreviousNonBlankLine), () => {
    function doTest(fileText: string, pos: number, expectedPos: number) {
        expect(getPosAfterPreviousNonBlankLine(fileText, pos)).to.equal(expectedPos);
    }

    it("should get the start line pos after previous non blank line", () => {
        let code = "text \r\n";
        const expectedPos = code.length;
        code += " \r\n    \r\n  \n\t \r\n";
        const pos = code.length;
        code += "more";
        doTest(code, pos, expectedPos);
    });

    it("should get the start of the text if it keeps finding blank lines", () => {
        const expectedPos = 0;
        let code = "\r\n";
        code += " \r\n    \r\n  \n\t \r\n";
        const pos = code.length;
        code += "more";
        doTest(code, pos, expectedPos);
    });
});
