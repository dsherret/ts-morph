import { expect } from "chai";
import { FunctionDeclaration, ReturnTypedNode } from "../../../compiler";
import { ReturnTypedNodeStructure } from "../../../structures";
import { WriterFunction } from "../../../types";
import { getInfoFromText } from "../testHelpers";

describe(nameof(ReturnTypedNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("function myImplicit() { return 5; }\nfunction myExplicit(): string { return ''; }");
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
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startText);
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
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startText);
            firstChild.setReturnType(returnType);
            expect(firstChild.getText()).to.equal(expectedText);
        }

        it("should set the return type with a writer", () => {
            doWriterTest("declare function identifier(): number;", writer => writer.write("string"), "declare function identifier(): string;");
        });
    });

    describe(nameof<ReturnTypedNode>(n => n.removeReturnType), () => {
        function doTest(startText: string, expectedText: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startText);
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

    describe(nameof<FunctionDeclaration>(n => n.fill), () => {
        function doTest(startingCode: string, structure: ReturnTypedNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("function Identifier() {}", { returnType: "number" }, "function Identifier(): number {}");
        });

        it("should modify when setting with a writer", () => {
            doTest("function Identifier() {}", { returnType: writer => writer.write("number") }, "function Identifier(): number {}");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("function Identifier() {}", { }, "function Identifier() {}");
        });
    });
});
