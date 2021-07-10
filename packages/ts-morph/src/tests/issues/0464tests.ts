import { expect } from "chai";
import { printNode } from "../../utils";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #464", () => {
    it("should print literals with printNode", () => {
        const text = `function test() {
    return 555;
}`;
        const { sourceFile } = getInfoFromText(text);
        const func = sourceFile.getFunctionOrThrow("test");
        expect(printNode(func.compilerNode)).to.equal(text);
    });
});
