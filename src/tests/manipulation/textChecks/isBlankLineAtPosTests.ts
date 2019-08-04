import { expect } from "chai";
import { Project } from "../../../Project";
import { isBlankLineAtPos } from "../../../manipulation/textChecks";

describe(nameof(isBlankLineAtPos), () => {
    function doTest(fileText: string, pos: number, expected: boolean) {
        const project = new Project();
        const sourceFile = project.createSourceFile("file.ts", fileText);
        expect(isBlankLineAtPos(sourceFile, pos)).to.equal(expected);
    }

    it("should be a blank line when is one and uses \\r\\n", () => {
        let code = "text";
        const pos = code.length;
        code += "\r\n    \t   \t \r\nother";
        doTest(code, pos, true);
    });

    it("should be a blank line when is one and uses \\n", () => {
        let code = "text";
        const pos = code.length;
        code += "\n    \t   \t \nother";
        doTest(code, pos, true);
    });

    it("should not be a blank line when only one new line", () => {
        let code = "text";
        const pos = code.length;
        code += "\n    \t   \t test";
        doTest(code, pos, false);
    });

    it("should not be a blank line when only one new line and end of file", () => {
        let code = "text";
        const pos = code.length;
        code += "\n";
        doTest(code, pos, false);
    });

    it("should not be a blank line when no new line", () => {
        let code = "text";
        const pos = code.length;
        code += "more text";
        doTest(code, pos, false);
    });
});
