import * as ts from "typescript";
import {expect} from "chai";
import {printNode, PrintNodeOptions} from "./../../utils";
import {NewLineKind} from "./../../ManipulationSettings";
import {getInfoFromText} from "./../compiler/testHelpers";

describe(nameof(printNode), () => {
    const nodeText = "class MyClass {\n    // comment\n    prop: string;\n}";
    const nodeTextNoComment = nodeText.replace("    // comment\n", "");
    const {sourceFile, firstChild} = getInfoFromText(nodeText);
    const tsSourceFile = ts.createSourceFile("file.tsx", nodeText, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
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
        const tsFunctionDeclaration = ts.createFunctionDeclaration(
            /*decorators*/ undefined,
            /*modifiers*/[ts.createToken(ts.SyntaxKind.ExportKeyword)],
            /*asteriskToken*/ undefined,
            "myFunction",
            /*typeParameters*/ undefined,
            /*parameters*/ [],
            /*returnType*/ ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            ts.createBlock([ts.createReturn(ts.createLiteral(5))], /*multiline*/ true)
        );
        expect(printNode(tsFunctionDeclaration)).to.equal("export function myFunction(): number {\n    return 5;\n}");
    });

    it("should print the node when printing a jsx file", () => {
        const node = ts.createJsxOpeningElement(ts.createIdentifier("Test"), ts.createJsxAttributes([]));
        expect(printNode(node, { scriptKind: ts.ScriptKind.TSX })).to.equal("<Test>");
    });

    it("should print the node when printing a non-jsx file", () => {
        const node = ts.createTypeAssertion(ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword), ts.createIdentifier("test"));
        expect(printNode(node, { scriptKind: ts.ScriptKind.TS })).to.equal("<string>test");
    });
});
