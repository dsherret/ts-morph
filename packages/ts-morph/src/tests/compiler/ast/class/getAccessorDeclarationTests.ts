import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, GetAccessorDeclaration, Scope } from "../../../../compiler";
import { GetAccessorDeclarationStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia, fillStructures } from "../../testHelpers";

function getGetAccessorInfo(text: string) {
    const result = getInfoFromText<ClassDeclaration>(text);
    const getAccessor = result.firstChild.getFirstDescendantByKindOrThrow(SyntaxKind.GetAccessor);
    return { ...result, getAccessor };
}

describe(nameof(GetAccessorDeclaration), () => {
    describe(nameof<GetAccessorDeclaration>(d => d.getSetAccessor), () => {
        it("should return undefined if no corresponding get accessor exists", () => {
            const { getAccessor } = getGetAccessorInfo(`class Identifier { get identifier(): string { return "" } }`);
            expect(getAccessor.getSetAccessor()).to.be.undefined;
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n`
                + `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const { getAccessor } = getGetAccessorInfo(code);
            expect(getAccessor.getSetAccessor()!.getText()).to.equal("set identifier(val: string) {}");
        });

        it("should return the static set accessor if a corresponding one exists", () => {
            const code = `class Identifier { static get identifier() { return ""; } static set identifier(val: string) {}\n}`;
            const { getAccessor } = getGetAccessorInfo(code);
            expect(getAccessor.getSetAccessor()!.getText()).to.equal("static set identifier(val: string) {}");
        });

        it("should return undefined if a set accessor with the same name doesn't have the same staticness", () => {
            const code = `class Identifier { static get identifier() { return ""; } set identifier(val: string) {}\n}`;
            const { getAccessor } = getGetAccessorInfo(code);
            expect(getAccessor.getSetAccessor()).to.be.undefined;
        });

        it("should get the set accessor in an object literal", () => {
            const code = `const obj = { get identifier() { return ""; }, set identifier(val: string) {}\n};`;
            const { getAccessor } = getGetAccessorInfo(code);
            expect(getAccessor.getSetAccessor()!.getText()).to.equal("set identifier(val: string) {}");
        });
    });

    describe(nameof<GetAccessorDeclaration>(d => d.getSetAccessorOrThrow), () => {
        it("should throw if no corresponding get accessor exists", () => {
            const { getAccessor } = getGetAccessorInfo(`class Identifier { get identifier(): string { return "" } }`);
            expect(() => getAccessor.getSetAccessorOrThrow()).to.throw();
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n`
                + `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const { getAccessor } = getGetAccessorInfo(code);
            expect(getAccessor.getSetAccessorOrThrow().getText()).to.equal("set identifier(val: string) {}");
        });
    });

    describe(nameof<GetAccessorDeclaration>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            (firstChild.getInstanceProperty(nameToRemove)! as GetAccessorDeclaration).remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("class Identifier {\n    get prop(): string { return ''; }\n}", "prop", "class Identifier {\n}");
        });

        it("should not remove the set accessor", () => {
            doTest("class Identifier {\n    get prop(): string { return ''; }\n\n    set prop(val: string) {}\n}", "prop",
                "class Identifier {\n    set prop(val: string) {}\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("class Identifier {\n    get prop(): string {}\n\n    get prop2(): string {}\n}", "prop",
                "class Identifier {\n    get prop2(): string {}\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("class Identifier {\n    get prop(): string {}\n\n    get prop2(): string {}\n\n    get prop3(): string {}\n}", "prop2",
                "class Identifier {\n    get prop(): string {}\n\n    get prop3(): string {}\n}");
        });

        it("should remove when it's the last member", () => {
            doTest("class Identifier {\n    prop: string;\n    get prop2(): string {}\n}", "prop2", "class Identifier {\n    prop: string;\n}");
        });
    });

    describe(nameof<GetAccessorDeclaration>(c => c.set), () => {
        function doTest(startingCode: string, structure: Partial<GetAccessorDeclarationStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
            firstChild.getGetAccessors()[0].set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class Identifier { get prop(); }", {}, "class Identifier { get prop(); }");
        });

        it("should modify when changed", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<GetAccessorDeclarationStructure>> = {
                statements: [{ kind: StructureKind.Class, name: "C" }, "console;"],
                decorators: [{ name: "dec" }],
                docs: [{ description: "d" }],
                isAbstract: true,
                isStatic: true,
                name: "asdf",
                parameters: [{ name: "p" }],
                returnType: "string",
                scope: Scope.Public,
                typeParameters: [{ name: "T" }]
            };

            const expectedCode = `
class Identifier {
    /** d */
    @dec
    public abstract static get asdf<T>(p): string {
        class C {
        }

        console;
    }
}
`;

            doTest("\nclass Identifier {\n    get prop();\n}\n", structure, expectedCode);
        });

        it("should remove the body when providing undefined to statements", () => {
            doTest("class Identifier {\n    get prop(){}\n}", { statements: undefined }, "class Identifier {\n    get prop();\n}");
        });
    });

    describe(nameof<GetAccessorDeclaration>(n => n.getStructure), () => {
        function doTest(code: string, expectedStructure: OptionalTrivia<MakeRequired<GetAccessorDeclarationStructure>>) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(code);
            const structure = firstChild.getGetAccessors()[0].getStructure();
            expect(structure).to.deep.equal(fillStructures.getAccessor(expectedStructure));
        }

        it("should get structure when empty", () => {
            doTest("abstract class T { abstract get test(); }", {
                kind: StructureKind.GetAccessor,
                statements: undefined,
                docs: [],
                parameters: [],
                returnType: undefined,
                scope: undefined,
                typeParameters: [],
                decorators: [],
                isAbstract: true,
                isStatic: false,
                name: "test"
            });
        });

        it("should get structure when has everything", () => {
            const code = `
class T {
    /** test */
    @dec public static get test<T>(p): number {
        return 5;
    }
}
`;
            doTest(code, {
                kind: StructureKind.GetAccessor,
                statements: ["return 5;"],
                docs: [{ description: "test" }],
                parameters: [{ name: "p" }],
                returnType: "number",
                scope: Scope.Public,
                typeParameters: [{ name: "T" }],
                decorators: [{ name: "dec" }],
                isAbstract: false,
                isStatic: true,
                name: "test"
            });
        });
    });
});
