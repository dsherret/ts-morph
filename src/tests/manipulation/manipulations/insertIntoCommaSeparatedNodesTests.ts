import { expect } from "chai";
import { ArrayLiteralExpression, NamespaceDeclaration } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { WriterFunction } from "../../../types";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../compiler/testHelpers";

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
            doTest(`{\n        name2\n    }`, 0, writer => writer.newLine().writeLine("name1"),
                `{\n        name1,\n        name2\n    }`);
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

        it("should not prepend a comma if the user wrote one", () => {
            doTest(`{name1}`, 1, writer => writer.write(",name2"), `{name1,name2}`, false);
        });

        it("should not append a comma if the user wrote one", () => {
            doTest(`{name2}`, 0, writer => writer.write("name1,"), `{name1,name2}`, false);
        });

        it("should not append and prepend a comma if the user wrote both", () => {
            doTest(`{name1, name3}`, 1, writer => writer.write(",name2,"), `{name1,name2,name3}`, false);
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
            doTest(`[\n        name2\n    ]`, 0, writer => writer.newLine().writeLine("name1"),
                `[\n        name1,\n        name2\n    ]`);
        });

        it("should insert in middle with newlines", () => {
            doTest(`[\n        name1,\n        name3\n    ]`, 1, writer => writer.newLine().writeLine("name2"),
                `[\n        name1,\n        name2,\n        name3\n    ]`);
        });

        it("should insert at end with newlines", () => {
            doTest(`[\n        name1\n    ]`, 1, writer => writer.newLine().writeLine("name2"),
                `[\n        name1,\n        name2\n    ]`);
        });

        it("should insert at the start when no other elements", () => {
            doTest(`[]`, 0, writer => writer.write("name1"), `[name1]`);
        });

        it("should insert at the start when no other elements on a new line", () => {
            doTest(`[]`, 0, writer => writer.newLine().writeLine("name1"), `[\n        name1\n    ]`);
        });
    });
});
