import {expect} from "chai";
import {InterfaceDeclaration, MethodSignature, PropertySignature, ConstructSignatureDeclaration, ClassDeclaration} from "./../../../compiler";
import {ConstructSignatureDeclarationStructure, MethodSignatureStructure, PropertySignatureStructure, InterfaceDeclarationSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(InterfaceDeclaration), () => {
    describe(nameof<InterfaceDeclaration>(d => d.insertConstructSignatures), () => {
        function doTest(startCode: string, insertIndex: number, structures: ConstructSignatureDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertConstructSignatures(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("interface i {\n}", 0, [{ }], "interface i {\n    new();\n}");
        });

        it("should insert multiple into other", () => {
            doTest("interface i {\n    method1();\n    method2();\n}", 1, [{ returnType: "string" }, { }],
                "interface i {\n    method1();\n    new(): string;\n    new();\n    method2();\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.insertConstructSignature), () => {
        function doTest(startCode: string, insertIndex: number, structure: ConstructSignatureDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertConstructSignature(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(ConstructSignatureDeclaration);
        }

        it("should insert at index", () => {
            doTest("interface i {\n    method1();\n    method2();\n}", 1, { }, "interface i {\n    method1();\n    new();\n    method2();\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.addConstructSignatures), () => {
        function doTest(startCode: string, structures: ConstructSignatureDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addConstructSignatures(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple at end", () => {
            doTest("interface i {\n    method1();\n}", [{ }, { }], "interface i {\n    method1();\n    new();\n    new();\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.addConstructSignature), () => {
        function doTest(startCode: string, structure: ConstructSignatureDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addConstructSignature(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(ConstructSignatureDeclaration);
        }

        it("should add at end", () => {
            doTest("interface i {\n    method1();\n}", { }, "interface i {\n    method1();\n    new();\n}");
        });
    });

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

    describe(nameof<InterfaceDeclaration>(d => d.getConstructSignature), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { new(): string; new(str: string): string; }");

        it("should get the first that matches", () => {
            expect(firstChild.getConstructSignature(c => c.getParameters().length > 0)).to.equal(firstChild.getConstructSignatures()[1]);
        });

        it("should return undefined when none match", () => {
            expect(firstChild.getConstructSignature(c => c.getParameters().length > 5)).to.be.undefined;
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getConstructSignatureOrThrow), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { new(): string; new(str: string): string; }");

        it("should get the first that matches", () => {
            expect(firstChild.getConstructSignatureOrThrow(c => c.getParameters().length > 0)).to.equal(firstChild.getConstructSignatures()[1]);
        });

        it("should throw when none match", () => {
            expect(() => firstChild.getConstructSignatureOrThrow(c => c.getParameters().length > 5)).to.throw();
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

        it("should insert multiple into other methods", () => {
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

    describe(nameof<InterfaceDeclaration>(d => d.getMethod), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { method1(); method2(); method3(); }");

        it("should get the first that matches by name", () => {
            expect(firstChild.getMethod("method2")!.getName()).to.equal("method2");
        });

        it("should return the first that matches by a find function", () => {
            expect(firstChild.getMethod(m => m.getName() === "method3")!.getName()).to.equal("method3");
        });

        it("should return undefined when none match", () => {
            expect(firstChild.getMethod(m => m.getParameters().length > 5)).to.be.undefined;
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getMethodOrThrow), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { method1(); method2(); method3(); }");

        it("should get the first that matches by name", () => {
            expect(firstChild.getMethodOrThrow("method2").getName()).to.equal("method2");
        });

        it("should return the first that matches by a find function", () => {
            expect(firstChild.getMethodOrThrow(m => m.getName() === "method3").getName()).to.equal("method3");
        });

        it("should throw when none match", () => {
            expect(() => firstChild.getMethodOrThrow(m => m.getParameters().length > 5)).to.throw();
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

    describe(nameof<InterfaceDeclaration>(d => d.getProperty), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { prop1: string; prop2: number; prop3: Date; }");

        it("should get the first that matches by name", () => {
            expect(firstChild.getProperty("prop2")!.getName()).to.equal("prop2");
        });

        it("should return the first that matches by a find function", () => {
            expect(firstChild.getProperty(p => p.getName() === "prop3")!.getName()).to.equal("prop3");
        });

        it("should return undefined when none match", () => {
            expect(firstChild.getProperty(p => p.getName() === "none")).to.be.undefined;
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getPropertyOrThrow), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { prop1: string; prop2: number; prop3: Date; }");

        it("should get the first that matches by name", () => {
            expect(firstChild.getPropertyOrThrow("prop2").getName()).to.equal("prop2");
        });

        it("should return the first that matches by a find function", () => {
            expect(firstChild.getPropertyOrThrow(p => p.getName() === "prop3").getName()).to.equal("prop3");
        });

        it("should throw when none match", () => {
            expect(() => firstChild.getPropertyOrThrow(p => p.getName() === "none")).to.throw();
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

    describe(nameof<InterfaceDeclaration>(d => d.fill), () => {
        function doTest(startingCode: string, structure: InterfaceDeclarationSpecificStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("interface Identifier {\n}", {}, "interface Identifier {\n}");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<InterfaceDeclarationSpecificStructure> = {
                constructSignatures: [{ returnType: "string" }],
                properties: [{ name: "p" }],
                methods: [{ name: "m" }]
            };
            doTest("interface Identifier {\n}", structure, "interface Identifier {\n    new(): string;\n    p;\n    m();\n}");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getInterfaces()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the interface declaration", () => {
            doTest("interface I {}\n\ninterface J {}\n\ninterface K {}", 1, "interface I {}\n\ninterface K {}");
        });
    });

    describe(nameof<InterfaceDeclaration>(n => n.getImplementations), () => {
        it("should get the implementations", () => {
            const sourceFileText = "interface MyInterface {}\nexport class Class1 implements MyInterface {}\nclass Class2 implements MyInterface {}";
            const {firstChild, sourceFile, tsSimpleAst} = getInfoFromText<InterfaceDeclaration>(sourceFileText);
            const implementations = firstChild.getImplementations();
            expect(implementations.length).to.equal(2);
            expect((implementations[0].getNode() as ClassDeclaration).getName()).to.equal("Class1");
            expect((implementations[1].getNode() as ClassDeclaration).getName()).to.equal("Class2");
        });
    });
});
