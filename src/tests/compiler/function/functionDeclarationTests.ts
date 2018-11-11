import { expect } from "chai";
import { FunctionDeclaration } from "../../../compiler";
import { FunctionDeclarationStructure, FunctionDeclarationOverloadStructure, FunctionDeclarationSpecificStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(FunctionDeclaration), () => {
    describe(nameof<FunctionDeclaration>(f => f.getName), () => {
        function doTest(startCode: string, name: string | undefined) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startCode);
            expect(firstChild.getName()).to.equal(name);
        }

        it("should be undefined when it doesn't have a name", () => {
            doTest("export default function() {}", undefined);
        });

        it("should get when has a name", () => {
            doTest("export default function name() {}", "name");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.insertOverloads), () => {
        function doTest(startCode: string, index: number, structures: FunctionDeclarationOverloadStructure[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertOverloads(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert when no other overloads exist", () => {
            doTest("function identifier() {}\n", 0, [{ returnType: "number" }, {}],
                "function identifier(): number;\nfunction identifier();\nfunction identifier() {}\n");
        });

        it("should insert with the ambientable and exportable nodes the same as the implementation signature unless overwritten", () => {
            doTest("declare async function* identifier(param: string): string {}\n", 0, [{ returnType: "number", hasDeclareKeyword: false }, {}],
                "function identifier(): number;\ndeclare function identifier();\ndeclare async function* identifier(param: string): string {}\n");
        });

        it("should be able to insert at start when another overload exists", () => {
            doTest("function identifier();\nfunction identifier() {}\n", 0, [{ returnType: "string" }],
                "function identifier(): string;\nfunction identifier();\nfunction identifier() {}\n");
        });

        it("should be able to insert at end when another overload exists", () => {
            doTest("function identifier();\nfunction identifier() {}\n", 1, [{ returnType: "string" }],
                "function identifier();\nfunction identifier(): string;\nfunction identifier() {}\n");
        });

        it("should be able to insert in the middle when other overloads exists", () => {
            doTest("function identifier();\nfunction identifier();\nfunction identifier() {}\n", 1, [{ returnType: "string" }],
                "function identifier();\nfunction identifier(): string;\nfunction identifier();\nfunction identifier() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.insertOverload), () => {
        function doTest(startCode: string, index: number, structure: FunctionDeclarationOverloadStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertOverload(index, structure);
            expect(result).to.be.instanceOf(FunctionDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert", () => {
            doTest("function identifier();\nfunction identifier();\nfunction identifier() {}\n", 1, { returnType: "number" },
                "function identifier();\nfunction identifier(): number;\nfunction identifier();\nfunction identifier() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.addOverloads), () => {
        function doTest(startCode: string, structures: FunctionDeclarationOverloadStructure[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addOverloads(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add at the end", () => {
            doTest("function identifier();\nfunction identifier() {}\n", [{ returnType: "number" }, { returnType: "string" }],
                "function identifier();\nfunction identifier(): number;\nfunction identifier(): string;\nfunction identifier() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.addOverload), () => {
        function doTest(startCode: string, structure: FunctionDeclarationOverloadStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addOverload(structure);
            expect(result).to.be.instanceOf(FunctionDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add at the end", () => {
            doTest("function identifier();\nfunction identifier() {}\n", { returnType: "number" },
                "function identifier();\nfunction identifier(): number;\nfunction identifier() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getFunctions()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        function doOverloadTest(text: string, index: number, overloadIndex: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getFunctions()[index].getOverloads()[overloadIndex].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the function declaration", () => {
            doTest("function I() {}\n\nfunction J() {}\n\nfunction K() {}", 1, "function I() {}\n\nfunction K() {}");
        });

        it("should remove the function declaration and its overloads", () => {
            doTest("function I() {}\n\nfunction J(): void;\nfunction J() {}\n\nfunction K() {}", 1, "function I() {}\n\nfunction K() {}");
        });

        it("should remove the function declaration overload when the first", () => {
            doOverloadTest("function I() {}\n\nfunction J(): void;\nfunction J() {}\n\nfunction K() {}", 1, 0, "function I() {}\n\nfunction J() {}\n\nfunction K() {}");
        });

        it("should remove the function declaration overload when the middle", () => {
            doOverloadTest("function I() {}\n\nfunction J(first): void;\nfunction J(second): void;\nfunction J(third): void;\nfunction J() {}\n\nfunction K() {}", 1, 1,
                "function I() {}\n\nfunction J(first): void;\nfunction J(third): void;\nfunction J() {}\n\nfunction K() {}");
        });
        it("should remove the function declaration overload when last", () => {
            doOverloadTest("function I() {}\n\nfunction J(first): void;\nfunction J(second): void;\nfunction J() {}\n\nfunction K() {}", 1, 1,
                "function I() {}\n\nfunction J(first): void;\nfunction J() {}\n\nfunction K() {}");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.set), () => {
        function doTest(startingCode: string, structure: FunctionDeclarationSpecificStructure, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startingCode);
            sourceFile.getFunctions()[0].set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            const code = `funciton identifier(): string;\nfunction identifier() {\n}`;
            doTest(code, {}, code);
        });

        it("should replace overloads when changed", () => {
            const structure: MakeRequired<FunctionDeclarationSpecificStructure> = {
                overloads: [{ returnType: "string" }]
            };
            doTest("function identifier(p): number;\nfunction identifier() {\n}", structure,
                "function identifier(): string;\nfunction identifier() {\n}");
        });

        it("should remove overloads when specifying an empty array", () => {
            const structure: MakeRequired<FunctionDeclarationSpecificStructure> = {
                overloads: []
            };
            doTest("function identifier(p): number;\nfunction identifier() {\n}", structure,
                "function identifier() {\n}");
        });
    });

    describe(nameof<FunctionDeclaration>(d => d.getStructure), () => {
        type PropertyNamesToExclude = "classes" | "functions" | "enums" | "interfaces" | "namespaces" | "typeAliases";
        function doTest(text: string, expectedStructure: Omit<MakeRequired<FunctionDeclarationStructure>, PropertyNamesToExclude>) {
            const { sourceFile } = getInfoFromText<any>(text);
            const functionDec = sourceFile.getFunctions()[0];
            const structure = functionDec.getStructure() as FunctionDeclarationStructure;

            structure.parameters = structure.parameters!.map(p => ({ name: p.name }));
            structure.typeParameters = structure.typeParameters!.map(p => ({ name: p.name }));

            structure.overloads!.forEach(o => {
                o.parameters = o.parameters!.map(p => ({ name: p.name }));
                o.typeParameters = o.typeParameters!.map(p => ({ name: p.name }));
            });

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get the structure for an empty function", () => {
            doTest("declare function test() {}", {
                bodyText: "",
                docs: [],
                hasDeclareKeyword: true,
                isAsync: false,
                isDefaultExport: false,
                isExported: false,
                isGenerator: false,
                name: "test",
                overloads: [],
                parameters: [],
                returnType: undefined,
                typeParameters: []
            });
        });

        it("should get the structure for a function that has everything", () => {
            const code = `
/** docs2 */
export default async function *test<U>(p): number;
/** docs */
export default async function *test<T>(param): string {
    return '';
}
`;
            const overloadStructure: MakeRequired<FunctionDeclarationOverloadStructure> = {
                docs: [{ description: "docs2" }],
                hasDeclareKeyword: false,
                isAsync: true,
                isDefaultExport: true,
                isExported: true,
                isGenerator: true,
                parameters: [{ name: "p" }],
                returnType: "number",
                typeParameters: [{ name: "U" }]
            };

            doTest(code, {
                bodyText: "return '';",
                docs: [{ description: "docs" }],
                hasDeclareKeyword: false,
                isAsync: true,
                isDefaultExport: true,
                isExported: true,
                isGenerator: true,
                name: "test",
                overloads: [overloadStructure],
                parameters: [{ name: "param" }],
                returnType: "string",
                typeParameters: [{ name: "T" }]
            });
        });
    });
});
