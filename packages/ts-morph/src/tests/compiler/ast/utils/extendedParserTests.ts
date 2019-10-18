import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ExtendedParser } from "../../../../compiler/ast/utils";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ExtendedParser), () => {
    // todo: more tests
    describe(nameof(ExtendedParser.getCompilerForEachChildren), () => {
        it("should include comment nodes", () => {
            const { sourceFile } = getInfoFromText("//a\nclass Test {} //b\n/*c*/\n/*d*/interface Interface {}\n//e");
            const result = ExtendedParser.getCompilerForEachChildren(sourceFile.compilerNode, sourceFile.compilerNode);
            expect(result.map(r => r.kind)).to.deep.equal([
                SyntaxKind.SingleLineCommentTrivia,
                SyntaxKind.ClassDeclaration,
                SyntaxKind.MultiLineCommentTrivia,
                SyntaxKind.InterfaceDeclaration,
                SyntaxKind.SingleLineCommentTrivia,
                SyntaxKind.EndOfFileToken
            ]);
        });
    });
});
