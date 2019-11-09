import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #519", () => {
    it("should be a tuple for a destructured type", () => {
        const fileText = `const [ a, ...rest ] = [1, 2]; export { rest };`;
        const { sourceFile } = getInfoFromText(fileText, { includeLibDts: true });

        const restSymbol = sourceFile.getExportSymbols()[0];
        const restSymbolType = restSymbol.getTypeAtLocation(restSymbol.getDeclarations()[0]);
        const restType = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).find(n => n.getText() === "rest")!.getType();

        expect(restSymbolType.isTuple()).to.be.true;
        expect(restType.isTuple()).to.be.true;
        expect(restType.getTargetTypeOrThrow().isTuple()).to.be.true;
    });
});
