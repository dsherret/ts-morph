import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrayLiteralExpression, NamespaceDeclaration } from "../../../compiler";
import { WriterFunction } from "../../../types";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../compiler/testHelpers";
import { OptionalKind, PropertyAssignmentStructure } from "../../../structures";

describe("insertIntoCommaSeparatedNodes", () => {
    // these are high level tests of this function
    describe("named imports", () => {
        function doTest(text: string, index: number, writerFunction: WriterFunction, expected: string, surroundWithSpaces = true) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(`declare namespace Test {\n    import ${text} from "./test";\n}\n`);
            const importDec = firstChild.getImportDeclarations()[0];
            if (!surroundWithSpaces)
                firstChild._context.manipulationSettings.set({ insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false });
            importDec.insertNamedImports(index, writerFunction);
            expect(importDec.getImportClauseOrThrow().getNamedBindingsOrThrow().getText()).to.equal(expected);
        }

        it("should insert at the start when it shouldn't use a space", () => {
            doTest(`{name2}`, 0, writer => writer.write("name1"), `{name1, name2}`, false);
        });

        it("should insert in the middle when it shouldn't use a space", () => {
            doTest(`{name1, name3}`, 1, writer => writer.write("name2"), `{name1, name2, name3}`, false);
        });

        it("should insert at the end when it shouldn't use a space", () => {
            doTest(`{name1, name2}`, 2, writer => writer.write("name3"), `{name1, name2, name3}`, false);
        });

        it("should insert at the start using newlines when it shouldn't use a space", () => {
            doTest(`{\n        name2\n    }`, 0, writer => writer.newLine().writeLine("name1"), `{\n        name1,\n        name2\n    }`, false);
        });

        it("should insert in the middle using newlines when it shouldn't use a space", () => {
            doTest(`{\n        name1,\n        name3\n    }`, 1, writer => writer.newLine().writeLine("name2"),
                `{\n        name1,\n        name2,\n        name3\n    }`, false);
        });

        it("should insert at the end using newlines when it shouldn't use a space", () => {
            doTest(`{\n        name1\n    }`, 1, writer => writer.newLine().writeLine("name2"), `{\n        name1,\n        name2\n    }`, false);
        });

        it("should insert at the start", () => {
            doTest(`{ name2 }`, 0, writer => writer.write("name1"), `{ name1, name2 }`);
        });

        it("should insert in middle", () => {
            doTest(`{ name1, name3 }`, 1, writer => writer.write("name2"), `{ name1, name2, name3 }`);
        });

        it("should insert at end", () => {
            doTest(`{ name1 }`, 1, writer => writer.write("name2"), `{ name1, name2 }`);
        });

        it("should insert at the start when writing newlines", () => {
            doTest(
                `{\n        name2\n    }`,
                0,
                writer => writer.newLine().writeLine("name1"),
                `{\n        name1,\n        name2\n    }`
            );
        });

        it("should insert in middle when writing newlines", () => {
            doTest(`{\n        name1,\n        name3\n    }`, 1, writer => writer.newLine().writeLine("name2"),
                `{\n        name1,\n        name2,\n        name3\n    }`);
        });

        it("should insert at end when writing newlines", () => {
            doTest(`{\n        name1\n    }`, 1, writer => writer.newLine().writeLine("name2"), `{\n        name1,\n        name2\n    }`);
        });

        it("should insert when none exist", () => {
            doTest(`{}`, 0, writer => writer.write("name1"), `{ name1 }`);
        });

        it("should insert when none exist and writing surrounding newlines", () => {
            doTest(`{}`, 0, writer => writer.newLine().writeLine("name1"), `{\n        name1\n    }`);
        });

        it("should not append a comma if the user wrote one", () => {
            doTest(`{name2}`, 0, writer => writer.write("name1,"), `{name1, name2}`, false);
        });
    });

    describe("array", () => {
        function doTest(text: string, index: number, writerFunction: WriterFunction, expected: string) {
            text = "namespace Test {\n    const t = " + text + ";\n}";
            const { descendant } = getInfoFromTextWithDescendant<ArrayLiteralExpression>(text, SyntaxKind.ArrayLiteralExpression);
            descendant.insertElements(index, writerFunction);
            expect(descendant.getText()).to.equal(expected);
        }

        it("should insert at the start", () => {
            doTest(`[name2]`, 0, writer => writer.write("name1"), `[name1, name2]`);
        });

        it("should insert in middle", () => {
            doTest(`[name1, name3]`, 1, writer => writer.write("name2"), `[name1, name2, name3]`);
        });

        it("should insert at end", () => {
            doTest(`[name1]`, 1, writer => writer.write("name2"), `[name1, name2]`);
        });

        it("should insert at the start with newlines", () => {
            doTest(
                `[\n        name2\n    ]`,
                0,
                writer => writer.newLine().writeLine("name1"),
                `[\n        name1,\n        name2\n    ]`
            );
        });

        it("should insert in middle with newlines", () => {
            doTest(`[\n        name1,\n        name3\n    ]`, 1, writer => writer.newLine().writeLine("name2"),
                `[\n        name1,\n        name2,\n        name3\n    ]`);
        });

        it("should insert at end with newlines", () => {
            doTest(
                `[\n        name1\n    ]`,
                1,
                writer => writer.newLine().writeLine("name2"),
                `[\n        name1,\n        name2\n    ]`
            );
        });

        it("should insert at the start when no other elements", () => {
            doTest(`[]`, 0, writer => writer.write("name1"), `[name1]`);
        });

        it("should insert at the start when no other elements on a new line", () => {
            doTest(`[]`, 0, writer => writer.newLine().writeLine("name1"), `[\n        name1\n    ]`);
        });
    });

    function getObjectLiteralExpression(text: string) {
        const opts = getInfoFromText(text);
        const objectLiteralExpression = opts.sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        return {
            objectLiteralExpression,
            ...opts
        };
    }

    describe("object literal expression", () => {
        function doTest(text: string, index: number, structures: OptionalKind<PropertyAssignmentStructure>[], expectedText: string) {
            const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertPropertyAssignments(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should take into account inserting after a comment", () => {
            doTest(
                "const t = {\n    // test\n};",
                1,
                [{ name: "prop2", initializer: "4" }],
                "const t = {\n    // test\n    prop2: 4\n};"
            );
        });

        it("should take into account inserting after a comment when there exists a node before that comment with no comma", () => {
            doTest(
                "const t = {\n    prop1\n    // test\n};",
                2,
                [{ name: "prop2", initializer: "4" }],
                "const t = {\n    prop1,\n    // test\n    prop2: 4\n};"
            );
        });

        it("should take into account inserting after a comment with a trailing comment when there exists a node before that comment with no comma", () => {
            doTest(
                "const t = {\n    prop1\n    /* 1 */ // 2\n};",
                2,
                [{ name: "prop2", initializer: "4" }],
                "const t = {\n    prop1,\n    /* 1 */ // 2\n    prop2: 4\n};"
            );
        });

        it("should take into account comments in the index", () => {
            doTest(
                "const t = {\n    // test\n    prop1: 5\n};",
                2,
                [{ name: "prop2", initializer: "4" }],
                "const t = {\n    // test\n    prop1: 5,\n    prop2: 4\n};"
            );
        });

        it("should take into account inserting before a comment", () => {
            doTest(
                "const t = {\n    // test\n};",
                0,
                [{ name: "prop2", initializer: "4" }],
                "const t = {\n    prop2: 4\n    // test\n};"
            );
        });

        it("should take into account inserting before a comment that has a non-comment node after", () => {
            doTest(
                "const t = {\n    // test\n    p};",
                0,
                [{ name: "prop2", initializer: "4" }],
                "const t = {\n    prop2: 4,\n    // test\n    p};"
            );
        });

        it("should take into account inserting before a comment with a preceeding node", () => {
            doTest(
                "const t = {\n    p\n    // test\n};",
                1,
                [{ name: "prop2", initializer: "4" }],
                "const t = {\n    p,\n    prop2: 4\n    // test\n};"
            );
        });
    });
});
