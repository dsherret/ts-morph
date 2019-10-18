import { expect } from "chai";
import { getNextNonWhitespacePos } from "../../../manipulation/textSeek";

describe(nameof(getNextNonWhitespacePos), () => {
    function doTest(fileText: string, pos: number, expectedPos: number) {
        expect(getNextNonWhitespacePos(fileText, pos)).to.equal(expectedPos);
    }

    it("should the next non whitespace char", () => {
        let code = " \r\n\t   \t  ";
        const expectedPos = code.length;
        code += "a      \t  aaa";
        doTest(code, 5, expectedPos);
    });

    it("should return the end of the string if only whitespace are found", () => {
        const code = "\r\n   \r   \t \t   \n    ";
        const expectedPos = code.length;
        doTest(code, 0, expectedPos);
    });
});
