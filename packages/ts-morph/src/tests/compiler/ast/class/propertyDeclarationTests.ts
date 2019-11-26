import { expect } from "chai";
import { Scope, ClassDeclaration, PropertyDeclaration } from "../../../../compiler";
import { PropertyDeclarationStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia, fillStructures } from "../../testHelpers";

describe(nameof(PropertyDeclaration), () => {
    function getFirstPropertyWithInfo(code: string) {
        const opts = getInfoFromText<ClassDeclaration>(code);
        return { ...opts, firstProperty: opts.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<PropertyDeclaration>(n => n.set), () => {
        function doTest(code: string, structure: Partial<PropertyDeclarationStructure>, expectedCode: string) {
            const { firstProperty, sourceFile } = getFirstPropertyWithInfo(code);
            firstProperty.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change the property when nothing is set", () => {
            doTest("class Identifier { prop: string; }", {}, "class Identifier { prop: string; }");
        });

        it("should change the property when setting", () => {
            doTest("class Identifier { prop: string; }", { type: "number" }, "class Identifier { prop: number; }");
        });

        it("should change when setting everything", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<PropertyDeclarationStructure>> = {
                name: "newName",
                type: "string",
                decorators: [{ name: "dec" }],
                initializer: "5",
                docs: ["test"],
                hasExclamationToken: false,
                hasQuestionToken: true,
                hasDeclareKeyword: true,
                isAbstract: true,
                isReadonly: true,
                isStatic: true,
                scope: Scope.Public
            };

            doTest("class Identifier {\n    prop: string;\n}", structure,
                "class Identifier {\n    /** test */\n    @dec\n    declare public abstract static readonly newName?: string = 5;\n}");
        });
    });

    describe(nameof<PropertyDeclaration>(n => n.getStructure), () => {
        function doTest(code: string, expectedStructure: OptionalTrivia<MakeRequired<PropertyDeclarationStructure>>) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(code);
            const structure = firstChild.getProperties()[0].getStructure();
            expect(structure).to.deep.equal(fillStructures.property(expectedStructure));
        }

        it("should get when empty", () => {
            doTest("class T { prop; }", {
                kind: StructureKind.Property,
                decorators: [],
                docs: [],
                hasExclamationToken: false,
                hasQuestionToken: false,
                hasDeclareKeyword: false,
                initializer: undefined,
                isAbstract: false,
                isReadonly: false,
                isStatic: false,
                name: "prop",
                scope: undefined,
                type: undefined
            });
        });

        it("should get when has everything", () => {
            const code = `
class T {
    /** test */
    @dec public static declare readonly abstract prop?: number = 5;
}
`;
            doTest(code, {
                kind: StructureKind.Property,
                decorators: [{ name: "dec" }],
                docs: [{ description: "test" }],
                hasExclamationToken: false,
                hasQuestionToken: true,
                hasDeclareKeyword: true,
                initializer: "5",
                isAbstract: true,
                isReadonly: true,
                isStatic: true,
                name: "prop",
                scope: Scope.Public,
                type: "number"
            });
        });

        it("should get when has exclamation token", () => {
            doTest("class T { prop!; }", {
                kind: StructureKind.Property,
                decorators: [],
                docs: [],
                hasExclamationToken: true,
                hasQuestionToken: false,
                hasDeclareKeyword: false,
                initializer: undefined,
                isAbstract: false,
                isReadonly: false,
                isStatic: false,
                name: "prop",
                scope: undefined,
                type: undefined
            });
        });
    });

    describe(nameof<PropertyDeclaration>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            (firstChild.getInstanceProperty(nameToRemove)! as PropertyDeclaration).remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only property", () => {
            doTest("class Identifier {\n    prop: string;\n}", "prop", "class Identifier {\n}");
        });

        it("should remove when it's the first property", () => {
            doTest("class Identifier {\n    prop: string;\n    prop2: string;\n}", "prop", "class Identifier {\n    prop2: string;\n}");
        });

        it("should remove when it's the middle property", () => {
            doTest("class Identifier {\n    prop: string;\n    prop2: string;\n    prop3: string;\n}", "prop2",
                "class Identifier {\n    prop: string;\n    prop3: string;\n}");
        });

        it("should remove when it's the last property", () => {
            doTest("class Identifier {\n    prop: string;\n    prop2: string;\n}", "prop2", "class Identifier {\n    prop: string;\n}");
        });

        it("should remove when it's beside a method with a body", () => {
            doTest("class Identifier {\n    method(){}\n\n    prop: string;\n}", "prop", "class Identifier {\n    method(){}\n}");
        });

        it("should remove when it's inside two methods", () => {
            doTest("class Identifier {\n    method(){}\n\n    prop: string;\n\n    method2() {}\n}", "prop",
                "class Identifier {\n    method(){}\n\n    method2() {}\n}");
        });

        it("should remove when it's in an ambient class", () => {
            doTest("declare class Identifier {\n    method(): void;\n\n    prop: string;\n\n    method2(): void;\n}", "prop",
                "declare class Identifier {\n    method(): void;\n    method2(): void;\n}");
        });
    });
});
