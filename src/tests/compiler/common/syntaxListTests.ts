import * as ts from "typescript";
import {expect} from "chai";
import {SyntaxList, Node} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(SyntaxList), () => {
    describe(nameof<SyntaxList>(s => s.insertChildText), () => {
        // most of these tests are in StatementedNode
        it("should add a class member", () => {
            const {sourceFile, firstChild} = getInfoFromText("class MyClass {\n}\n");
            firstChild.getChildSyntaxListOrThrow().addChildText(writer => {
                writer.write("get myNumber()").block(() => {
                    writer.writeLine("return 5;");
                });
            });
            expect(sourceFile.getFullText()).to.equal("class MyClass {\n    get myNumber() {\n        return 5;\n    }\n}\n");
        });
    });

    describe(nameof<SyntaxList>(s => s.addChildText), () => {
        function doSourceFileTest(code: string, statements: string, expectedLength: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(code);
            const nodes = sourceFile.getChildSyntaxListOrThrow().addChildText(statements);
            expect(nodes.length).to.equal(expectedLength);
            expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add the children at the end of a source file", () => {
            doSourceFileTest("function a() {}\nfunction b() {}", "newText;\nsecondText;", 2,
                "function a() {}\nfunction b() {}\nnewText;\nsecondText;");
        });
    });
});
