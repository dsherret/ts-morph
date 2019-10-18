import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { Node, SyntaxList } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(SyntaxList), () => {
    describe(nameof<SyntaxList>(s => s.insertChildText), () => {
        // most of these tests are in StatementedNode
        it("should insert a class member", () => {
            const { sourceFile, firstChild } = getInfoFromText("class MyClass {\n}\n");
            firstChild.getChildSyntaxListOrThrow().insertChildText(0, writer => {
                writer.write("get myNumber()").block(() => {
                    writer.writeLine("return 5;");
                });
            });
            expect(sourceFile.getFullText()).to.equal("class MyClass {\n    get myNumber() {\n        return 5;\n    }\n}\n");
        });

        it("should insert inline at the start", () => {
            const { sourceFile, firstChild } = getInfoFromText(`abstract class MyClass {}`);
            const syntaxList = firstChild.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
            syntaxList.insertChildText(0, "export");

            expect(sourceFile.getFullText()).to.equal(`export abstract class MyClass {}`);
        });

        it("should insert inline in the middle", () => {
            const { sourceFile, firstChild } = getInfoFromText(`export declare class MyClass {}`);
            const syntaxList = firstChild.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
            syntaxList.insertChildText(1, "abstract");

            expect(sourceFile.getFullText()).to.equal(`export abstract declare class MyClass {}`);
        });

        it("should insert inline at the end", () => {
            const { sourceFile, firstChild } = getInfoFromText(`export class MyClass {}`);
            const syntaxList = firstChild.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
            syntaxList.insertChildText(1, "abstract");

            expect(sourceFile.getFullText()).to.equal(`export abstract class MyClass {}`);
        });

        it("should indent on next line in case someone adds a newline", () => {
            const { sourceFile, firstChild } = getInfoFromText(`export class MyClass {}`);
            const syntaxList = firstChild.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
            syntaxList.insertChildText(1, "\nabstract");

            expect(sourceFile.getFullText()).to.equal(`export \n    abstract class MyClass {}`);
        });
    });

    describe(nameof<SyntaxList>(s => s.addChildText), () => {
        function doSourceFileTest(code: string, statements: string, expectedLength: number, expectedCode: string) {
            const { sourceFile } = getInfoFromText(code);
            const nodes = sourceFile.getChildSyntaxListOrThrow().addChildText(statements);
            expect(nodes.length).to.equal(expectedLength);
            expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add the children at the end of a source file", () => {
            doSourceFileTest(
                "function a() {}\nfunction b() {}",
                "newText;\nsecondText;",
                2,
                "function a() {}\nfunction b() {}\nnewText;\nsecondText;"
            );
        });
    });
});
