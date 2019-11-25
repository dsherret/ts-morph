import { expect } from "chai";
import { FunctionDeclaration, ClassDeclaration, StatementedNode, Node } from "../../../../../compiler";
import { ClassDeclarationStructure } from "../../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia } from "../../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertClasses), () => {
        function doTest(startCode: string, index: number, structures: OptionalKindAndTrivia<ClassDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertClasses(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert to an empty file", () => {
            doTest("", 0, [{
                name: "Identifier"
            }], "class Identifier {\n}\n");
        });

        it("should insert without a name", () => {
            doTest("", 0, [{ isDefaultExport: true }], "export default class {\n}\n");
        });

        it("should insert at the start of a file", () => {
            doTest("enum Enum {\n}\n", 0, [{ name: "Identifier" }], "class Identifier {\n}\n\nenum Enum {\n}\n");
        });

        it("should insert at the end of a file", () => {
            doTest("enum Enum {\n}\n", 1, [{ name: "Identifier" }], "enum Enum {\n}\n\nclass Identifier {\n}\n");
        });

        it("should insert in the middle of children", () => {
            doTest("class Identifier1 {\n}\n\nclass Identifier3 {\n}\n", 1, [{ name: "Identifier2" }],
                "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n\nclass Identifier3 {\n}\n");
        });

        it("should insert multiple", () => {
            doTest("class Identifier1 {\n}\n", 1, [{ name: "Identifier2" }, { name: "Identifier3" }],
                "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n\nclass Identifier3 {\n}\n");
        });

        it("should have the expected text adding to non-source file", () => {
            const { sourceFile } = getInfoFromText("namespace Namespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertClasses(0, [{
                name: "Identifier"
            }]);

            expect(sourceFile.getFullText()).to.equal("namespace Namespace {\n    class Identifier {\n    }\n}\n");
        });

        it("should insert everything in a structure", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<ClassDeclarationStructure>> = {
                name: "C",
                ctors: [{}, {}],
                decorators: [{ name: "D" }],
                docs: [{ description: "Test" }],
                extends: "Base",
                implements: ["IBase", "IBase2"],
                hasDeclareKeyword: false,
                isAbstract: true,
                isDefaultExport: true,
                isExported: true,
                typeParameters: [{ name: "T" }],
                properties: [{ name: "p", type: writer => writer.write("number") }],
                methods: [{ name: "m" }],
                getAccessors: [{ name: "g" }, { name: "s" }, { name: "g2" }, { name: "g3" }],
                setAccessors: [{ name: "s" }, { name: "g" }, { name: "s2" }]
            };
            const expectedText = "/** Test */\n@D\nexport default abstract class C<T> extends Base implements IBase, IBase2 {\n"
                + "    p: number;\n\n"
                + "    constructor() {\n    }\n\n"
                + "    constructor() {\n    }\n\n"
                + "    get g() {\n    }\n\n    set g() {\n    }\n\n    get s() {\n    }\n\n    set s() {\n    }\n\n"
                + "    get g2() {\n    }\n\n    get g3() {\n    }\n\n    set s2() {\n    }\n\n"
                + "    m() {\n    }\n"
                + "}\n";
            doTest("", 0, [structure], expectedText);
        });

        it("should insert an ambient method into a class when inserting a class into an ambient module", () => {
            const { sourceFile } = getInfoFromText("declare module Namespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertClasses(0, [{
                name: "Identifier",
                methods: [{ name: "myMethod" }]
            }]);

            expect(sourceFile.getFullText()).to.equal("declare module Namespace {\n    class Identifier {\n        myMethod();\n    }\n}\n");
        });

        function doFunctionTest(startText: string, endText: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startText);
            firstChild.insertClasses(0, [{ name: "C" }]);
            expect(sourceFile.getFullText()).to.equal(endText);
        }

        it("should insert into a function with no body", () => {
            doFunctionTest("function test();", "function test() {\n    class C {\n    }\n}");
        });

        it("should insert into a function with a body", () => {
            doFunctionTest("function test() {\n}", "function test() {\n    class C {\n    }\n}");
        });
    });

    describe(nameof<StatementedNode>(n => n.insertClass), () => {
        function doTest(startCode: string, index: number, structure: OptionalKindAndTrivia<ClassDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertClass(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(ClassDeclaration);
        }

        it("should insert", () => {
            doTest("class Identifier2 {\n}\n", 0, { name: "Identifier1" }, "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addClasses), () => {
        function doTest(startCode: string, structures: OptionalKindAndTrivia<ClassDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addClasses(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("class Identifier1 {\n}\n", [{ name: "Identifier2" }, { name: "Identifier3" }],
                "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n\nclass Identifier3 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addClass), () => {
        function doTest(startCode: string, structure: OptionalKindAndTrivia<ClassDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addClass(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(ClassDeclaration);
        }

        it("should add one", () => {
            doTest("class Identifier1 {\n}\n", { name: "Identifier2" }, "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.getClasses), () => {
        const { sourceFile } = getInfoFromText("class Identifier1 {}\nclass Identifier2 { prop: string; }");
        const classes = sourceFile.getClasses();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });

        it("should not throw when getting from an empty body", () => {
            const { firstChild } = getInfoFromText<StatementedNode & Node>("function test();");
            expect(firstChild.getClasses()).to.deep.equal([]);
        });
    });

    describe(nameof<StatementedNode>(n => n.getClass), () => {
        const { sourceFile } = getInfoFromText("class Identifier1 {}\nclass Identifier2 { prop: string; }");

        it("should get a class by a name", () => {
            expect(sourceFile.getClass("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a class by a search function", () => {
            expect(sourceFile.getClass(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the class doesn't exist", () => {
            expect(sourceFile.getClass("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getClassOrThrow), () => {
        const { sourceFile } = getInfoFromText("class Identifier1 {}\nclass Identifier2 { prop: string; }");

        it("should get a class by a name", () => {
            expect(sourceFile.getClassOrThrow("Identifier2").getName()).to.equal("Identifier2");
        });

        it("should get a class by a search function", () => {
            expect(sourceFile.getClassOrThrow(c => c.getName() === "Identifier1").getName()).to.equal("Identifier1");
        });

        it("should throw when the class doesn't exist", () => {
            expect(() => sourceFile.getClassOrThrow("asdf")).to.throw();
        });
    });
});
