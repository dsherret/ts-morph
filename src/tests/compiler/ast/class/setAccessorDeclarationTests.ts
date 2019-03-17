import { expect } from "chai";
import { ClassDeclaration, SetAccessorDeclaration, Scope } from "../../../../compiler";
import { SetAccessorDeclarationStructure, TypeParameterDeclarationStructure, StructureKind } from "../../../../structures";
import { SyntaxKind } from "../../../../typescript";
import { ArrayUtils } from "../../../../utils";
import { getInfoFromText, OptionalKindAndTrivia } from "../../testHelpers";

function getSetAccessorInfo(text: string) {
    const result = getInfoFromText<ClassDeclaration>(text);
    const setAccessor = ArrayUtils.find(result.firstChild.getInstanceProperties(), f => f.getKind() === SyntaxKind.SetAccessor) as SetAccessorDeclaration;
    return {...result, setAccessor};
}

describe(nameof(SetAccessorDeclaration), () => {
    describe(nameof<SetAccessorDeclaration>(d => d.getGetAccessor), () => {
        it("should return undefined if no corresponding set accessor exists", () => {
            const { setAccessor } = getSetAccessorInfo(`class Identifier { set identifier(val: string) {} }`);
            expect(setAccessor.getGetAccessor()).to.be.undefined;
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const { setAccessor } = getSetAccessorInfo(code);
            expect(setAccessor.getGetAccessor()!.getText()).to.equal(`get identifier() { return ""; }`);
        });
    });

    describe(nameof<SetAccessorDeclaration>(d => d.getGetAccessorOrThrow), () => {
        it("should throw if no corresponding set accessor exists", () => {
            const { setAccessor } = getSetAccessorInfo(`class Identifier { set identifier(val: string) {} }`);
            expect(() => setAccessor.getGetAccessorOrThrow()).to.throw();
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const { setAccessor } = getSetAccessorInfo(code);
            expect(setAccessor.getGetAccessorOrThrow().getText()).to.equal(`get identifier() { return ""; }`);
        });
    });

    describe(nameof<SetAccessorDeclaration>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            (firstChild.getInstanceProperty(nameToRemove)! as SetAccessorDeclaration).remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("class Identifier {\n    set prop(val: string) { }\n}", "prop", "class Identifier {\n}");
        });

        it("should not remove the get accessor", () => {
            doTest("class Identifier {\n    set prop(val: string) {}\n\n    get prop(): string { return ''; }\n}", "prop",
                "class Identifier {\n    get prop(): string { return ''; }\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("class Identifier {\n    set prop(val: string) {}\n\n    set prop2(val: string) {}\n}", "prop",
                "class Identifier {\n    set prop2(val: string) {}\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("class Identifier {\n    set prop(val: string) {}\n\n    set prop2(val: string) {}\n\n    set prop3(val: string) {}\n}", "prop2",
                "class Identifier {\n    set prop(val: string) {}\n\n    set prop3(val: string) {}\n}");
        });

        it("should remove when it's the last member", () => {
            doTest("class Identifier {\n    prop: string;\n    set prop2(val: string) {}\n}", "prop2",
                "class Identifier {\n    prop: string;\n}");
        });
    });

    describe(nameof<SetAccessorDeclaration>(c => c.set), () => {
        function doTest(startingCode: string, structure: Partial<SetAccessorDeclarationStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
            firstChild.getSetAccessors()[0].set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class Identifier { set prop(); }", {}, "class Identifier { set prop(); }");
        });

        it("should modify when changed", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<SetAccessorDeclarationStructure>> = {
                statements: ["console;"],
                classes: [{ name: "C" }],
                decorators: [{ name: "dec" }],
                docs: [{ description: "d" }],
                enums: [{ name: "E" }],
                functions: [{ name: "F" }],
                interfaces: [{ name: "I" }],
                typeAliases: [{ name: "T", type: "string" }],
                isAbstract: true,
                isStatic: true,
                name: "asdf",
                namespaces: [{ name: "N" }],
                parameters: [{ name: "p" }],
                returnType: "string",
                scope: Scope.Public,
                typeParameters: [{ name: "T" }]
            };

            const expectedCode = `
class Identifier {
    /**
     * d
     */
    @dec
    public abstract static set asdf<T>(p): string {
        class C {
        }

        enum E {
        }

        function F() {
        }

        interface I {
        }

        namespace N {
        }

        type T = string;

        console;
    }
}
`;

            doTest("\nclass Identifier {\n    set prop();\n}\n", structure, expectedCode);
        });

        it("should remove the body when providing undefined", () => {
            doTest("class Identifier {\n    set prop(){}\n}", { statements: undefined }, "class Identifier {\n    set prop();\n}");
        });
    });

    describe(nameof<SetAccessorDeclaration>(n => n.getStructure), () => {
        type PropertyNamesToExclude = "classes" | "functions" | "enums" | "interfaces" | "namespaces" | "typeAliases" | "leadingTrivia" | "trailingTrivia";
        function doTest(code: string, expectedStructure: Omit<MakeRequired<SetAccessorDeclarationStructure>, PropertyNamesToExclude>) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(code);
            const structure = firstChild.getSetAccessors()[0].getStructure();
            structure.parameters = structure.parameters!.map(p => ({ name: p.name }));
            structure.typeParameters = structure.typeParameters!.map(p => ({ name: (p as TypeParameterDeclarationStructure).name }));
            structure.decorators = structure.decorators!.map(p => ({ name: p.name }));

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get structure when empty", () => {
            doTest("abstract class T { abstract set test(); }", {
                kind: StructureKind.SetAccessor,
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
    @dec public static set test<T>(p): number {
        return 5;
    }
}
`;
            doTest(code, {
                kind: StructureKind.SetAccessor,
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
