import {expect} from "chai";
import {InterfaceDeclaration, MethodSignature, PropertySignature, ConstructSignatureDeclaration} from "./../../../compiler";
import {PropertySignatureStructure, MethodSignatureStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(InterfaceDeclaration), () => {
    describe(nameof<InterfaceDeclaration>(d => d.getConstructSignatures), () => {
        describe("none", () => {
            it("should not have any", () => {
                const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n}\n");
                expect(firstChild.getConstructSignatures().length).to.equal(0);
            });
        });

        describe("has construct signatures", () => {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n    prop: string;\n    new(): string;\n    method1():void;\n    method2():string;\n}\n");

            it("should get the right number of construct signatures", () => {
                expect(firstChild.getConstructSignatures().length).to.equal(1);
            });

            it("should get a construct signature of the right instance of", () => {
                expect(firstChild.getConstructSignatures()[0]).to.be.instanceOf(ConstructSignatureDeclaration);
            });
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.insertMethods), () => {
        function doTest(startCode: string, insertIndex: number, structures: MethodSignatureStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertMethods(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("interface i {\n}", 0, [{ name: "method" }], "interface i {\n    method();\n}");
        });

        it("should insert multiple into other properties", () => {
            doTest("interface i {\n    method1();\n    method4();\n}", 1, [{ name: "method2", hasQuestionToken: true, returnType: "string" }, { name: "method3" }],
                "interface i {\n    method1();\n    method2?(): string;\n    method3();\n    method4();\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.insertMethod), () => {
        function doTest(startCode: string, insertIndex: number, structure: MethodSignatureStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertMethod(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(MethodSignature);
        }

        it("should insert at index", () => {
            doTest("interface i {\n    method1();\n    method3();\n}", 1, { name: "method2" }, "interface i {\n    method1();\n    method2();\n    method3();\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.addMethods), () => {
        function doTest(startCode: string, structures: MethodSignatureStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addMethods(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple at end", () => {
            doTest("interface i {\n    method1();\n}", [{ name: "method2" }, { name: "method3" }], "interface i {\n    method1();\n    method2();\n    method3();\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.addMethod), () => {
        function doTest(startCode: string, structure: MethodSignatureStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addMethod(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(MethodSignature);
        }

        it("should add at end", () => {
            doTest("interface i {\n    method1();\n}", { name: "method2" }, "interface i {\n    method1();\n    method2();\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getMethods), () => {
        describe("no methods", () => {
            it("should not have any methods", () => {
                const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n}\n");
                expect(firstChild.getMethods().length).to.equal(0);
            });
        });

        describe("has methods", () => {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n    prop: string;\n    method1():void;\n    method2():string;\n}\n");

            it("should get the right number of methods", () => {
                expect(firstChild.getMethods().length).to.equal(2);
            });

            it("should get a method of the right instance of", () => {
                expect(firstChild.getMethods()[0]).to.be.instanceOf(MethodSignature);
            });
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.insertProperties), () => {
        function doTest(startCode: string, insertIndex: number, structures: PropertySignatureStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertProperties(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("interface i {\n}", 0, [{ name: "prop" }], "interface i {\n    prop;\n}");
        });

        it("should insert multiple into other properties", () => {
            doTest("interface i {\n    prop1;\n    prop4;\n}", 1, [{ name: "prop2", hasQuestionToken: true, type: "string" }, { name: "prop3" }],
                "interface i {\n    prop1;\n    prop2?: string;\n    prop3;\n    prop4;\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.insertProperty), () => {
        function doTest(startCode: string, insertIndex: number, structure: PropertySignatureStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertProperty(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(PropertySignature);
        }

        it("should insert at index", () => {
            doTest("interface i {\n    prop1;\n    prop3;\n}", 1, { name: "prop2" }, "interface i {\n    prop1;\n    prop2;\n    prop3;\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.addProperties), () => {
        function doTest(startCode: string, structures: PropertySignatureStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addProperties(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple at end", () => {
            doTest("interface i {\n    prop1;\n}", [{ name: "prop2" }, { name: "prop3" }], "interface i {\n    prop1;\n    prop2;\n    prop3;\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.addProperty), () => {
        function doTest(startCode: string, structure: PropertySignatureStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addProperty(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(PropertySignature);
        }

        it("should add at end", () => {
            doTest("interface i {\n    prop1;\n}", { name: "prop2" }, "interface i {\n    prop1;\n    prop2;\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getProperties), () => {
        describe("no properties", () => {
            it("should not have any properties", () => {
                const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n}\n");
                expect(firstChild.getProperties().length).to.equal(0);
            });
        });

        describe("has properties", () => {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\nprop: string;\nprop2: number;method1(): void;\n}\n");

            it("should get the right number of properties", () => {
                expect(firstChild.getProperties().length).to.equal(2);
            });

            it("should get a property of the right instance of", () => {
                expect(firstChild.getProperties()[0]).to.be.instanceOf(PropertySignature);
            });
        });
    });
});
