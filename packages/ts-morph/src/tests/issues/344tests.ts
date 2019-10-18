import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #344", () => {
    it("should add a property assignment with a quoted string", () => {
        const text = `const t = {};`;
        const { sourceFile } = getInfoFromText(text);
        const ole = sourceFile.getVariableDeclarationOrThrow("t")
            .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

        ole.addPropertyAssignments([{
            name: `"test"`,
            initializer: "5"
        }, {
            name: `"with-dash"`,
            initializer: "5"
        }, {
            name: `'single-quotes'`,
            initializer: "5"
        }]);

        expect(sourceFile.getFullText()).to.equal(`const t = {\n    "test": 5,\n    "with-dash": 5,\n    'single-quotes': 5\n};`);
    });
});
