import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";
describe("tests for issue #654", () => {
    it("should add a new property where there exists a comment", () => {
        const { sourceFile } = getInfoFromText("const ole = {\n    foo: 'foo',\n    // c\n    bar: 'bar'\n}");
        const ole = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        ole.addPropertyAssignment({ name: "baz", initializer: "'test'" });
        expect(ole.getText()).to.equal(`{\n    foo: 'foo',\n    // c\n    bar: 'bar',\n    baz: 'test'\n}`);
    });
});
