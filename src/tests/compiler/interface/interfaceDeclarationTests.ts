import { expect } from "chai";
import { ClassDeclaration, InterfaceDeclaration } from "../../../compiler";
import { InterfaceDeclarationSpecificStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";
import { TypeGuards } from "../../../utils";

describe(nameof(InterfaceDeclaration), () => {
    describe(nameof<InterfaceDeclaration>(d => d.getType), () => {
        it("should get the interface's type", () => {
            const { sourceFile } = getInfoFromText("interface Identifier { prop: string; }");
            expect(sourceFile.getInterfaceOrThrow("Identifier").getType().getText()).to.deep.equal("Identifier");
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getBaseTypes), () => {
        function doTest(text: string, interfaceName: string, expectedNames: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const types = sourceFile.getInterfaceOrThrow(interfaceName).getBaseTypes();
            expect(types.map(c => c.getText())).to.deep.equal(expectedNames);
        }

        it("should get the base when it's a interface", () => {
            doTest("interface Base {} interface Child extends Base {}", "Child", ["Base"]);
        });

        it("should get the base when there are multiple", () => {
            doTest("interface Base1 {} interface Base2 {} interface Child extends Base1, Base2 {}", "Child", ["Base1", "Base2"]);
        });

        xit("should get the base when there are multiple with type parameters", () => { // TODO: issue !
            const { sourceFile } = getInfoFromText(`interface Base1 {} interface A {} interface Child extends Base1<A>`);
            const types = sourceFile.getInterfaceOrThrow("Child").getBaseTypes();
            expect(types).not.to.be.empty;
        });

        it("should be empty when there is no base interface", () => {
            doTest("interface Interface {}", "Interface", []);
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getBaseDeclarations), () => {
        function doTest(text: string, interfaceName: string, expectedNames: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const declarations = sourceFile.getInterfaceOrThrow(interfaceName).getBaseDeclarations();
            expect(declarations.map(c => c.getName())).to.deep.equal(expectedNames);
        }

        it("should get the base when it's a interface", () => {
            doTest("interface Base {} interface Child extends Base {}", "Child", ["Base"]);
        });

        it("should get the base when there are multiple", () => {
            doTest("interface Base1 {} interface Base2 {} interface Child extends Base1, Base2 {}", "Child", ["Base1", "Base2"]);
        });

        it("should get the base when there are multiple with the same name", () => {
            doTest("interface Base1 {} interface Base2 { prop: string; } interface Base2 { prop2: string; } interface Child extends Base1, Base2 {}",
                "Child", ["Base1", "Base2", "Base2"]);
        });

        it("should be empty when there is no base interface", () => {
            doTest("interface Interface {}", "Interface", []);
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.fill), () => {
        function doTest(startingCode: string, structure: InterfaceDeclarationSpecificStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<InterfaceDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("interface Identifier {\n}", {}, "interface Identifier {\n}");
        });

        // currently no members exist on InterfaceDeclarationSpecificStructure
    });

    describe(nameof<InterfaceDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
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
            const { firstChild, sourceFile, project } = getInfoFromText<InterfaceDeclaration>(sourceFileText);
            const implementations = firstChild.getImplementations();
            expect(implementations.length).to.equal(2);
            expect(implementations[0].getNode().getText()).to.equal("Class1");
            expect(implementations[1].getNode().getText()).to.equal("Class2");
        });
    });

    describe(nameof<InterfaceDeclaration>(n => n.getStructure), () => {
        it("should get the structure of interface with constructor, properties and method signatures", () => {
            const sourceFileText = `
            /** interface description */
            export interface I<T extends S> extends J<String>, K<Array<string>,Date> {
                /** constructor description */
                new (value: number | string | Date);
                /** property description */
                readonly a?:number|string
                /** method description */
                m(p?:Date[]):J<string>
                /** method description 2 */
                m(p?:Date[], q:string|number=9):string|Date
            }
            interface I2 {
                [k:keyof O]: P
            }
            `;
            const structure = getInfoFromText<InterfaceDeclaration>(sourceFileText).firstChild.getStructure();
            expect(structure).to.deep.equals({
                name: "I", isExported: true, isDefaultExport: false, hasDeclareKeyword: false,
                docs: [{ description: "interface description" }], typeParameters: [{
                    name: "T", constraint: "S", default: undefined
                }], extends: ["J<String>", "K<Array<string>,Date>"], callSignatures: [],
                constructSignatures: [{
                    parameters: [{
                        name: "value", type: "number | string | Date", initializer: undefined, scope: undefined, isReadonly: false,
                        decorators: [], hasQuestionToken: false, isRestParameter: false
                    }],
                    returnType: undefined, docs: [{ description: "constructor description" }], typeParameters: []
                }],
                indexSignatures: [],
                methods: [{
                    name: "m", parameters: [{
                        name: "p", type: "Date[]", initializer: undefined, scope: undefined, isReadonly: false, decorators: [],
                        hasQuestionToken: true, isRestParameter: false
                    }], returnType: "J<string>", typeParameters: [], hasQuestionToken: false, docs: [{ description: "method description" }]
                },
                {
                    name: "m", parameters: [
                        {
                            name: "p", type: "Date[]", isReadonly: false, initializer: undefined, scope: undefined,
                            decorators: [], hasQuestionToken: true, isRestParameter: false
                        },
                        {
                            name: "q", initializer: "9", type: "string|number", isReadonly: false, scope: undefined,
                            decorators: [], hasQuestionToken: false, isRestParameter: false
                        }
                    ], returnType: "string|Date", typeParameters: [], hasQuestionToken: false, docs: [{
                        description: "method description 2"
                    }]
                }],
                properties: [{
                    name: "a", type: "number|string", hasQuestionToken: true, initializer: undefined,
                    isReadonly: true, docs: [{ description: "property description" }]
                }]
            });
        });

        it("should get the structure of interface with key member signatures", () => {
            const structure = getInfoFromText<InterfaceDeclaration>(`
            interface I2 {
                [key: string]: number
            }
            `).firstChild.getStructure();
            expect(structure.indexSignatures).to.deep.equals([
                {
                    isReadonly: false,
                    docs: [],
                    keyName: "key",
                    keyType: "string",
                    returnType: "number"
                }
            ]);
        });

        it("should get the structure of interface with call signatures", () => {
            const structure = getInfoFromText<InterfaceDeclaration>(`
            interface CallMe<T> {
                (some?:string): Promise<T>
            }
            `).firstChild.getStructure();
            expect(structure.callSignatures).to.deep.equals([
                {
                    parameters: [{
                        name: "some", type: "string", isReadonly: false, decorators: [], hasQuestionToken: true,
                        isRestParameter: false, initializer: undefined, scope: undefined
                    }], returnType: "Promise<T>", docs: [], typeParameters: []
                }
            ]);
        });
    });
});
