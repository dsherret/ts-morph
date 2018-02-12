import * as compilerApi from "typescript";
import {expect} from "chai";
import {printNode, PrintNodeOptions} from "./../../utils";
import {NewLineKind} from "./../../typescript";
import {getInfoFromText} from "./../compiler/testHelpers";

describe(nameof(printNode), () => {
    const nodeText = "class MyClass {\n    // comment\n    prop: string;\n}";
    const nodeTextNoComment = nodeText.replace("    // comment\n", "");
    const {sourceFile, firstChild} = getInfoFromText(nodeText);
    const tsSourceFile = compilerApi.createSourceFile("file.tsx", nodeText, compilerApi.ScriptTarget.Latest, false, compilerApi.ScriptKind.TSX);
    const tsClass = tsSourceFile.getChildren(tsSourceFile)[0].getChildren(tsSourceFile)[0];

    it("should print the node when specifying a compiler node and options", () => {
        expect(printNode(tsClass, { newLineKind: NewLineKind.CarriageReturnLineFeed })).to.equal(nodeTextNoComment.replace(/\n/g, "\r\n"));
    });

    it("should print with comments when specifying a source file", () => {
        expect(printNode(tsSourceFile)).to.equal(nodeText + "\n");
    });

    it("should print the node when specifying a compiler node and source file", () => {
        expect(printNode(tsClass, tsSourceFile)).to.equal(nodeText);
    });

    it("should print the node when specifying a compiler node, source file, and options", () => {
        expect(printNode(tsClass, tsSourceFile, { newLineKind: NewLineKind.CarriageReturnLineFeed })).to.equal(nodeText.replace(/\n/g, "\r\n"));
    });

    it("should print the node when specifying a compiler node and source file", () => {
        expect(printNode(tsClass)).to.equal(nodeTextNoComment);
    });

    it("general compiler api test", () => {
        // https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
        const tsFunctionDeclaration = compilerApi.createFunctionDeclaration(
            /*decorators*/ undefined,
            /*modifiers*/[compilerApi.createToken(compilerApi.SyntaxKind.ExportKeyword)],
            /*asteriskToken*/ undefined,
            "myFunction",
            /*typeParameters*/ undefined,
            /*parameters*/ [],
            /*returnType*/ compilerApi.createKeywordTypeNode(compilerApi.SyntaxKind.NumberKeyword),
            compilerApi.createBlock([compilerApi.createReturn(compilerApi.createLiteral(5))], /*multiline*/ true)
        );
        expect(printNode(tsFunctionDeclaration)).to.equal("export function myFunction(): number {\n    return 5;\n}");
    });

    it("should print the node when printing a jsx file", () => {
        const node = compilerApi.createJsxOpeningElement(compilerApi.createIdentifier("Test"), compilerApi.createJsxAttributes([]));
        expect(printNode(node, { scriptKind: compilerApi.ScriptKind.TSX })).to.equal("<Test>");
    });

    it("should print the node when printing a non-jsx file", () => {
        const node = compilerApi.createTypeAssertion(compilerApi.createKeywordTypeNode(compilerApi.SyntaxKind.StringKeyword), compilerApi.createIdentifier("test"));
        expect(printNode(node, { scriptKind: compilerApi.ScriptKind.TS })).to.equal("<string>test");
    });
});
