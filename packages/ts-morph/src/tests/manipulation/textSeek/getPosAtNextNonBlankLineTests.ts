import { expect } from "chai";
import { getPosAtNextNonBlankLine } from "../../../manipulation/textSeek";

describe(nameof(getPosAtNextNonBlankLine), () => {
    function doTest(fileText: string, pos: number, expectedPos: number) {
        expect(getPosAtNextNonBlankLine(fileText, pos)).to.equal(expectedPos);
    }

    it("should get the start line pos at next non blank line when ending with \\r\\n", () => {
        let code = "text";
        const pos = code.length;
        code += " \r\n    \r\n  \n\t \r\n\r\n";
        const expectedPos = code.length;
        code += "more";
        doTest(code, pos, expectedPos);
    });

    it("should get the start line pos at next non blank line when ending with \\n", () => {
        let code = "text";
        const pos = code.length;
        code += " \n";
        const expectedPos = code.length;
        code += "more";
        doTest(code, pos, expectedPos);
    });

    it("should get the end of the text if no blank line found", () => {
        let code = "text";
        const pos = code.length;
        code += " \r\n    \r\n  \n\t \r\n\r\n";
        const expectedPos = code.length;
        doTest(code, pos, expectedPos);
    });
});
