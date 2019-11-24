import { expect } from "chai";
import { FunctionDeclaration, ReturnTypedNode, Node } from "../../../../compiler";
import { ReturnTypedNodeStructure } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getInfoFromText } from "../../testHelpers";
describe(nameof(ReturnTypedNode), () => {
    const { sourceFile: mainSourceFile } = getInfoFromText("function myImplicit() { return 5; }\nfunction myExplicit(): string { return ''; }");
    const implicitDeclaration = mainSourceFile.getFunctions()[0];
    const explicitDeclaration = mainSourceFile.getFunctions()[1];

    describe(nameof<ReturnTypedNode>(n => n.getReturnType), () => {
        it("should get the expected implicit type", () => {
            expect(implicitDeclaration.getReturnType().getText()).to.equal("number");
        });

        it("should get the expected explicit type", () => {
            expect(explicitDeclaration.getReturnType().getText()).to.equal("string");
        });
    });

    describe(nameof<ReturnTypedNode>(n => n.getReturnTypeNode), () => {
        it("should get the expected explicit type for an explicit type", () => {
            expect(explicitDeclaration.getReturnTypeNode()!.getText()).to.equal("string");
        });

        it("should return undefined for an implicit type", () => {
            expect(implicitDeclaration.getReturnTypeNode()).to.be.undefined;
        });
    });

    describe(nameof<ReturnTypedNode>(n => n.getReturnTypeNodeOrThrow), () => {
        it("should get the expected explicit type for an explicit type", () => {
            expect(explicitDeclaration.getReturnTypeNodeOrThrow().getText()).to.equal("string");
        });

        it("should throw for an implicit type", () => {
            expect(() => implicitDeclaration.getReturnTypeNodeOrThrow()).to.throw();
        });
    });

    describe(nameof<ReturnTypedNode>(n => n.setReturnType), () => {
        function doTest(startText: string, returnType: string, expectedText: string) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startText);
            firstChild.setReturnType(returnType);
            expect(firstChild.getText()).to.equal(expectedText);
        }

        it("should set the return type when none exists", () => {
            doTest("function identifier() {}", "string", "function identifier(): string {}");
        });

        it("should set the return type when one already exists", () => {
            doTest("function identifier(): number {}", "string", "function identifier(): string {}");
        });

        it("should set the return type for an ambient declaration with no return type", () => {
            doTest("declare function identifier();", "string", "declare function identifier(): string;");
        });

        it("should set the return type for an ambient declaration", () => {
            doTest("declare function identifier(): number;", "string", "declare function identifier(): string;");
        });

        it("should remove the type when it's empty", () => {
            doTest("function identifier(): string {}", "", "function identifier() {}");
        });

        function doWriterTest(startText: string, returnType: WriterFunction, expectedText: string) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startText);
            firstChild.setReturnType(returnType);
            expect(firstChild.getText()).to.equal(expectedText);
        }

        it("should set the return type with a writer", () => {
            doWriterTest("declare function identifier(): number;", writer => writer.write("string"), "declare function identifier(): string;");
        });
    });

    describe(nameof<ReturnTypedNode>(n => n.removeReturnType), () => {
        function doTest(startText: string, expectedText: string) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startText);
            firstChild.removeReturnType();
            expect(firstChild.getText()).to.equal(expectedText);
        }

        it("should remove the type", () => {
            doTest("function identifier(): string {}", "function identifier() {}");
        });

        it("should not throw an error when the return type is already null", () => {
            doTest("function identifier() {}", "function identifier() {}");
        });
    });

    describe(nameof<FunctionDeclaration>(n => n.set), () => {
        function doTest(startingCode: string, structure: ReturnTypedNodeStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startingCode);
            firstChild.set(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("function Identifier() {}", { returnType: "number" }, "function Identifier(): number {}");
        });

        it("should modify when setting with a writer", () => {
            doTest("function Identifier() {}", { returnType: writer => writer.write("number") }, "function Identifier(): number {}");
        });

        it("should remove when undefined", () => {
            doTest("function Identifier(): number {}", { returnType: undefined }, "function Identifier() {}");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("function Identifier() {}", {}, "function Identifier() {}");
        });
    });

    describe(nameof<FunctionDeclaration>(n => n.getStructure), () => {
        function doTest(startingCode: string, returnType: string | undefined) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startingCode);
            expect(firstChild.getStructure().returnType).to.equal(returnType);
        }

        it("should be undefined when not exists", () => {
            doTest("function test() {}", undefined);
        });

        it("should get when exists", () => {
            doTest("function test(): string {}", "string");
        });

        it("should get the type text without leading indentation", () => {
            const text = "function f() {\n    function t(): {\n        b: string;\n    } {\n    }\n}";
            const expected = "{\n    b: string;\n}";
            const { firstChild } = getInfoFromText<FunctionDeclaration>(text);
            expect(firstChild.getStatements().find(Node.isFunctionDeclaration)!.getStructure().returnType).to.deep.equal(expected);
        });
    });
});
