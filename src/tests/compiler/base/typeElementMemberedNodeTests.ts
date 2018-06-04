import { expect } from "chai";
import { CallSignatureDeclaration, ConstructSignatureDeclaration, IndexSignatureDeclaration, InterfaceDeclaration, MethodSignature, PropertySignature,
    TypeElementMemberedNode } from "../../../compiler";
import { CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure, MethodSignatureStructure,
    PropertySignatureStructure, TypeElementMemberedNodeStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(TypeElementMemberedNode), () => {
    describe(nameof<TypeElementMemberedNode>(d => d.insertConstructSignatures), () => {
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

        it("should insert when the structure has everything", () => {
            const structure: MakeRequired<ConstructSignatureDeclarationStructure> = {
                docs: [{ description: "Test" }],
                parameters: [{ name: "param" }],
                returnType: "T",
                typeParameters: [{ name: "T" }]
            };
            doTest("interface i {\n}", 0, [structure], "interface i {\n    /**\n     * Test\n     */\n    new<T>(param): T;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.insertConstructSignature), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.addConstructSignatures), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.addConstructSignature), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.getConstructSignatures), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.getConstructSignature), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { new(): string; new(str: string): string; }");

        it("should get the first that matches", () => {
            expect(firstChild.getConstructSignature(c => c.getParameters().length > 0)).to.equal(firstChild.getConstructSignatures()[1]);
        });

        it("should return undefined when none match", () => {
            expect(firstChild.getConstructSignature(c => c.getParameters().length > 5)).to.be.undefined;
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.getConstructSignatureOrThrow), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { new(): string; new(str: string): string; }");

        it("should get the first that matches", () => {
            expect(firstChild.getConstructSignatureOrThrow(c => c.getParameters().length > 0)).to.equal(firstChild.getConstructSignatures()[1]);
        });

        it("should throw when none match", () => {
            expect(() => firstChild.getConstructSignatureOrThrow(c => c.getParameters().length > 5)).to.throw();
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.insertIndexSignatures), () => {
        function doTest(startCode: string, insertIndex: number, structures: IndexSignatureDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertIndexSignatures(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("interface i {\n}", 0, [{ returnType: "number" }], "interface i {\n    [key: string]: number;\n}");
        });

        it("should insert multiple into other", () => {
            doTest("interface i {\n    method1();\n    method2();\n}", 1,
                [{ returnType: "number" }, { keyName: "key2", keyType: "number", returnType: writer => writer.write("Date") }],
                "interface i {\n    method1();\n    [key: string]: number;\n    [key2: number]: Date;\n    method2();\n}");
        });

        it("should insert when the structure has everything", () => {
            const structure: MakeRequired<IndexSignatureDeclarationStructure> = {
                docs: [{ description: "Test" }],
                returnType: "string",
                isReadonly: true,
                keyName: "keyName",
                keyType: "number"
            };
            doTest("interface i {\n}", 0, [structure], "interface i {\n    /**\n     * Test\n     */\n    readonly [keyName: number]: string;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.insertIndexSignature), () => {
        function doTest(startCode: string, insertIndex: number, structure: IndexSignatureDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertIndexSignature(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(IndexSignatureDeclaration);
        }

        it("should insert at index", () => {
            doTest("interface i {\n    method1();\n    method2();\n}", 1, { returnType: "Date" },
                "interface i {\n    method1();\n    [key: string]: Date;\n    method2();\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.addIndexSignatures), () => {
        function doTest(startCode: string, structures: IndexSignatureDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addIndexSignatures(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple at end", () => {
            doTest("interface i {\n    method1();\n}", [{ returnType: "string" }, { returnType: "Date" }],
                "interface i {\n    method1();\n    [key: string]: string;\n    [key: string]: Date;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.addIndexSignature), () => {
        function doTest(startCode: string, structure: IndexSignatureDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addIndexSignature(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(IndexSignatureDeclaration);
        }

        it("should add at end", () => {
            doTest("interface i {\n    method1();\n}", { returnType: "string" }, "interface i {\n    method1();\n    [key: string]: string;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.getIndexSignatures), () => {
        describe("none", () => {
            it("should not have any", () => {
                const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n}\n");
                expect(firstChild.getIndexSignatures().length).to.equal(0);
            });
        });

        describe("has index signatures", () => {
            const text = "interface Identifier {\n    prop: string;\n    [key: string]: string;\n    method1():void;\n    method2():string;\n}\n";
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(text);

            it("should get the right number of index signatures", () => {
                expect(firstChild.getIndexSignatures().length).to.equal(1);
            });

            it("should get a construct signature of the right instance of", () => {
                expect(firstChild.getIndexSignatures()[0]).to.be.instanceOf(IndexSignatureDeclaration);
            });
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.getIndexSignature), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { [key: string]: string; [key2: string]: Date; }");

        it("should get the first that matches", () => {
            expect(firstChild.getIndexSignature(c => c.getKeyName() === "key2")).to.equal(firstChild.getIndexSignatures()[1]);
        });

        it("should return undefined when none match", () => {
            expect(firstChild.getIndexSignature(c => c.getKeyName() === "other")).to.be.undefined;
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.getIndexSignatureOrThrow), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { [key: string]: string; [key2: string]: Date; }");

        it("should get the first that matches", () => {
            expect(firstChild.getIndexSignatureOrThrow(c => c.getKeyName() === "key2")).to.equal(firstChild.getIndexSignatures()[1]);
        });

        it("should throw when none match", () => {
            expect(() => firstChild.getIndexSignatureOrThrow(c => c.getKeyName() === "other")).to.throw();
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.insertCallSignatures), () => {
        function doTest(startCode: string, insertIndex: number, structures: CallSignatureDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertCallSignatures(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("interface i {\n}", 0, [{ }], "interface i {\n    (): void;\n}");
        });

        it("should insert multiple into other", () => {
            doTest("interface i {\n    method1();\n    method2();\n}", 1, [{ returnType: "string" }, { }],
                "interface i {\n    method1();\n    (): string;\n    (): void;\n    method2();\n}");
        });

        it("should insert when the structure has everything", () => {
            const structure: MakeRequired<CallSignatureDeclarationStructure> = {
                docs: [{ description: "Test" }],
                parameters: [{ name: "param" }],
                returnType: "T",
                typeParameters: [{ name: "T" }]
            };
            doTest("interface i {\n}", 0, [structure], "interface i {\n    /**\n     * Test\n     */\n    <T>(param): T;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.insertCallSignature), () => {
        function doTest(startCode: string, insertIndex: number, structure: CallSignatureDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.insertCallSignature(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(CallSignatureDeclaration);
        }

        it("should insert at index", () => {
            doTest("interface i {\n    method1();\n    method2();\n}", 1, { }, "interface i {\n    method1();\n    (): void;\n    method2();\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.addCallSignatures), () => {
        function doTest(startCode: string, structures: CallSignatureDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addCallSignatures(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple at end", () => {
            doTest("interface i {\n    method1();\n}", [{ }, { }], "interface i {\n    method1();\n    (): void;\n    (): void;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.addCallSignature), () => {
        function doTest(startCode: string, structure: CallSignatureDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(startCode);
            const result = firstChild.addCallSignature(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(CallSignatureDeclaration);
        }

        it("should add at end", () => {
            doTest("interface i {\n    method1();\n}", { }, "interface i {\n    method1();\n    (): void;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.getCallSignatures), () => {
        describe("none", () => {
            it("should not have any", () => {
                const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n}\n");
                expect(firstChild.getCallSignatures().length).to.equal(0);
            });
        });

        describe("has call signatures", () => {
            const code = "interface Identifier {\n    prop: string;\n    new(): string;\n    (): number;\n    method1():void;\n    method2():string;\n}\n";
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(code);

            it("should get the right number of call signatures", () => {
                expect(firstChild.getCallSignatures().length).to.equal(1);
            });

            it("should get a call signature of the right instance of", () => {
                expect(firstChild.getCallSignatures()[0]).to.be.instanceOf(CallSignatureDeclaration);
            });
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.getCallSignature), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { (): string; (str: string): string; }");

        it("should get the first that matches", () => {
            expect(firstChild.getCallSignature(c => c.getParameters().length > 0)).to.equal(firstChild.getCallSignatures()[1]);
        });

        it("should return undefined when none match", () => {
            expect(firstChild.getCallSignature(c => c.getParameters().length > 5)).to.be.undefined;
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.getCallSignatureOrThrow), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier { (): string; (str: string): string; }");

        it("should get the first that matches", () => {
            expect(firstChild.getCallSignatureOrThrow(c => c.getParameters().length > 0)).to.equal(firstChild.getCallSignatures()[1]);
        });

        it("should throw when none match", () => {
            expect(() => firstChild.getCallSignatureOrThrow(c => c.getParameters().length > 5)).to.throw();
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.insertMethods), () => {
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

        it("should insert all the method's properties when specified", () => {
            const structure: MakeRequired<MethodSignatureStructure> = {
                docs: [{ description: "Test" }],
                name: "method",
                hasQuestionToken: true,
                returnType: "number",
                parameters: [{ name: "param" }],
                typeParameters: [{ name: "T" }]
            };
            doTest("interface i {\n}", 0, [structure], "interface i {\n    /**\n     * Test\n     */\n    method?<T>(param): number;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.insertMethod), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.addMethods), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.addMethod), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.getMethod), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.getMethodOrThrow), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.getMethods), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.insertProperties), () => {
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

        it("should insert all the property's properties when specified", () => {
            const structure: MakeRequired<PropertySignatureStructure> = {
                name: "prop",
                isReadonly: true,
                docs: [{ description: "Test" }],
                hasQuestionToken: true,
                type: "number",
                initializer: "5" // doesn't make sense
            };
            doTest("interface i {\n}", 0, [structure], "interface i {\n    /**\n     * Test\n     */\n    readonly prop?: number = 5;\n}");
        });
    });

    describe(nameof<TypeElementMemberedNode>(d => d.insertProperty), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.addProperties), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.addProperty), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.getProperty), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.getPropertyOrThrow), () => {
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

    describe(nameof<TypeElementMemberedNode>(d => d.getProperties), () => {
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

    describe("fill", () => {
        function doTest(startingCode: string, structure: TypeElementMemberedNodeStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<InterfaceDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("interface Identifier {\n}", {}, "interface Identifier {\n}");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<TypeElementMemberedNodeStructure> = {
                callSignatures: [{ returnType: "string" }],
                constructSignatures: [{ returnType: "string" }],
                indexSignatures: [{ keyName: "key", keyType: "string", returnType: "number" }],
                properties: [{ name: "p" }],
                methods: [{ name: "m" }]
            };
            doTest("interface Identifier {\n}", structure,
                "interface Identifier {\n    (): string;\n    new(): string;\n    [key: string]: number;\n    p;\n    m();\n}");
        });
    });
});
