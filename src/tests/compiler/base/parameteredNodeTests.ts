﻿import { expect } from "chai";
import { FunctionDeclaration, ParameterDeclaration, ParameteredNode, Scope, ArrowFunction, VariableStatement } from "../../../compiler";
import { ParameterDeclarationStructure, ParameteredNodeStructure } from "../../../structures";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../testHelpers";
import { SyntaxKind } from "typescript";

describe(nameof(ParameteredNode), () => {
    describe(nameof<ParameteredNode>(d => d.getParameter), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param1: string, param2: number){}");

        it("should get the parameter by name", () => {
            expect(firstChild.getParameter("param1")!.getName()).to.equal("param1");
        });

        it("should get the parameter by function", () => {
            expect(firstChild.getParameter(p => p.getName() === "param2")).to.equal(firstChild.getParameters()[1]);
        });

        it("should return undefined when it doesn't exist", () => {
            expect(firstChild.getParameter("paramx")).to.be.undefined;
        });
    });

    describe(nameof<ParameteredNode>(d => d.getParameterOrThrow), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param1: string, param2: number){}");

        it("should get the parameter by name", () => {
            expect(firstChild.getParameterOrThrow("param1").getName()).to.equal("param1");
        });

        it("should get the parameter by function", () => {
            expect(firstChild.getParameterOrThrow(p => p.getName() === "param2")).to.equal(firstChild.getParameters()[1]);
        });

        it("should throw when it doesn't exist", () => {
            expect(() => firstChild.getParameterOrThrow("paramx")).to.throw();
        });
    });

    describe(nameof<ParameteredNode>(d => d.getParameters), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param1: string, param2: number){}");
        const parameters = firstChild.getParameters();

        it("should get the right number of parameters", () => {
            expect(parameters.length).to.equal(2);
        });

        it("should have parameter of type ParameterDeclaration", () => {
            expect(parameters[0]).to.be.instanceOf(ParameterDeclaration);
        });
    });

    describe(nameof<ParameteredNode>(n => n.addParameter), () => {
        function doTest(startCode: string, structure: ParameterDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addParameter(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceof(ParameterDeclaration);
        }

        it("should add when none exists", () => {
            doTest("function identifier() {}", { name: "param" }, "function identifier(param) {}");
        });

        it("should add when one exists", () => {
            doTest("function identifier(param1) {}", { name: "param2" }, "function identifier(param1, param2) {}");
        });
    });

    describe(nameof<ParameteredNode>(n => n.addParameters), () => {
        function doTest(startCode: string, structures: ParameterDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addParameters(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("function identifier(param1) {}", [{ name: "param2" }, { name: "param3" }], "function identifier(param1, param2, param3) {}");
        });
    });

    describe(nameof<ParameteredNode>(n => n.insertParameter), () => {
        function doTest(startCode: string, index: number, structure: ParameterDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertParameter(index, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceof(ParameterDeclaration);
        }

        it("should insert when none exists", () => {
            doTest("function identifier() {}", 0, { name: "param" }, "function identifier(param) {}");
        });

        it("should insert when one exists", () => {
            doTest("function identifier(param2) {}", 0, { name: "param1" }, "function identifier(param1, param2) {}");
        });
    });

    describe(nameof<ParameteredNode>(n => n.insertParameters), () => {
        function doTest(startCode: string, insertIndex: number, structures: ParameterDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertParameters(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("function identifier() {}", 0, [{ name: "param1", isReadonly: true }, { name: "param2", type: "string[]", isRestParameter: true }],
                "function identifier(readonly param1, ...param2: string[]) {}");
        });

        it("should insert at the start", () => {
            doTest("function identifier(param2) {}", 0, [{ name: "param1" }], "function identifier(param1, param2) {}");
        });

        it("should insert at the end", () => {
            doTest("function identifier(param1) {}", 1, [{ name: "param2" }], "function identifier(param1, param2) {}");
        });

        it("should insert in the middle", () => {
            doTest("function identifier(param1, param3) {}", 1, [{ name: "param2" }], "function identifier(param1, param2, param3) {}");
        });

        it("should write type when it has a question token", () => {
            doTest("function identifier() {}", 0, [{ name: "param", hasQuestionToken: true }], "function identifier(param?: any) {}");
        });

        it("should insert everything in the structure", () => {
            const structure: MakeRequired<ParameterDeclarationStructure> = {
                name: "param",
                decorators: [{ name: "dec" }],
                hasQuestionToken: true,
                initializer: "[5]",
                isReadonly: true,
                scope: Scope.Public,
                isRestParameter: true,
                type: "number[]"
            };
            doTest("function identifier() {}", 0, [structure], "function identifier(@dec public readonly ...param?: number[] = [5]) {}");
        });
    });

    describe(nameof<FunctionDeclaration>(n => n.fill), () => {
        function doTest(startingCode: string, structure: ParameteredNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("function identifier() {}", { parameters: [{ name: "param" }] }, "function identifier(param) {}");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("function identifier() {}", {}, "function identifier() {}");
        });
    });

    describe(nameof<ParameteredNode>(n => n.removeParameter), () => {
        function doTest(startingCode: string, parameterName: string, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
            firstChild.removeParameter(parameterName);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should remove first parameter of function with two without explicit type", () => {
            doTest("function identifier(param1, param2) {}", "param1", "function identifier(param2) {}");
        });

        it("should remove last parameter of function with two without explicit type", () => {
            doTest("function identifier(param1, param2) {}", "param2", "function identifier(param1) {}");
        });

        it("should remove second parameter of function with three with explicit type", () => {
            doTest("function identifier(param1: number[][], param2: Array<Date>, param3?: Date) {}", "param2", 
                "function identifier(param1: number[][], param3?: Date) {}");
        });

        function doTestArrow(startingCode: string, parameterName: string, expectedCode: string) {
            const {descendant, sourceFile} = getInfoFromTextWithDescendant<ArrowFunction>(startingCode, SyntaxKind.ArrowFunction);            
            descendant.removeParameter(parameterName);
            expect(descendant.getText()).to.equal(expectedCode);
        }

        it("should remove second parameter of arrow function with three with explicit type", () => {
            doTestArrow("(a: {}, b: {foo: number}, c: (msg: string) => boolean): any => ({a, b, c})", "b", 
                "(a: {}, c: (msg: string) => boolean): any => ({a, b, c})");
        });

        it("should remove third parameter of arrow function with three with question token", () => {
            doTestArrow("(a: string, b: Error, c?: Date[][]): any => ({a, b, c})", "c", 
                "(a: string, b: Error): any => ({a, b, c})");
        });

        it("should remove middle parameter of arrow function which has an assignament", () => {
            doTestArrow("(a: Date, b: number = 1, c?: Error): any => ({a, b, c})", "b", 
                "(a: Date, c?: Error): any => ({a, b, c})");
        });
    });
});
