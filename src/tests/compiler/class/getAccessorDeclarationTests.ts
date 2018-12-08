import { expect } from "chai";
import { ClassDeclaration, GetAccessorDeclaration, Scope } from "../../../compiler";
import { GetAccessorDeclarationStructure, TypeParameterDeclarationStructure } from "../../../structures";
import { SyntaxKind } from "../../../typescript";
import { ArrayUtils } from "../../../utils";
import { getInfoFromText } from "../testHelpers";

function getGetAccessorInfo(text: string) {
    const result = getInfoFromText<ClassDeclaration>(text);
    const getAccessor = ArrayUtils.find(result.firstChild.getInstanceProperties(), f => f.getKind() === SyntaxKind.GetAccessor) as GetAccessorDeclaration;
    return {...result, getAccessor};
}

describe(nameof(GetAccessorDeclaration), () => {
    describe(nameof<GetAccessorDeclaration>(d => d.getSetAccessor), () => {
        it("should return undefined if no corresponding get accessor exists", () => {
            const { getAccessor } = getGetAccessorInfo(`class Identifier { get identifier(): string { return "" } }`);
            expect(getAccessor.getSetAccessor()).to.be.undefined;
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
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
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
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
            doTest("class Identifier {\n    prop: string;\n    get prop2(): string {}\n}", "prop2",
                "class Identifier {\n    prop: string;\n}");
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
            const structure: MakeRequired<GetAccessorDeclarationStructure> = {
                bodyText: "console;",
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
    public abstract static get asdf<T>(p): string {
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

            doTest("\nclass Identifier {\n    get prop();\n}\n", structure, expectedCode);
        });

        it("should remove the body when providing undefined", () => {
            doTest("class Identifier {\n    get prop(){}\n}", { bodyText: undefined }, "class Identifier {\n    get prop();\n}");
        });
    });

    describe(nameof<GetAccessorDeclaration>(n => n.getStructure), () => {
        type PropertyNamesToExclude = "classes" | "functions" | "enums" | "interfaces" | "namespaces" | "typeAliases";
        function doTest(code: string, expectedStructure: Omit<MakeRequired<GetAccessorDeclarationStructure>, PropertyNamesToExclude>) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(code);
            const structure = firstChild.getGetAccessors()[0].getStructure();
            structure.parameters = structure.parameters!.map(p => ({ name: p.name }));
            structure.typeParameters = structure.typeParameters!.map(p => ({ name: (p as TypeParameterDeclarationStructure).name }));
            structure.decorators = structure.decorators!.map(p => ({ name: p.name }));

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get structure when empty", () => {
            doTest("abstract class T { abstract get test(); }", {
                bodyText: undefined,
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
                bodyText: "return 5;",
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
