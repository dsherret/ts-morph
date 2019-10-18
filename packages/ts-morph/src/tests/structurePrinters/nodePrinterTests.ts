import { expect } from "chai";
import { Structure } from "../../structures";
import { NodePrinter } from "../../structurePrinters";
import { getInfoFromText } from "../compiler/testHelpers";

describe(nameof(NodePrinter), () => {
    describe("leading trivia", () => {
        function doTest(leadingTrivia: Structure["leadingTrivia"], expectedText: string) {
            const { sourceFile } = getInfoFromText("");
            sourceFile.addClass({
                leadingTrivia,
                name: "MyClass"
            });
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should do nothing when an empty string", () => {
            doTest("", `class MyClass {\n}\n`);
        });

        it("should write whitespace", () => {
            doTest("  \t", `  \tclass MyClass {\n}\n`);
        });

        it("should write trivia as a string", () => {
            doTest("// test", `// test\nclass MyClass {\n}\n`);
        });

        it("should not write extra newline when ends with a newline", () => {
            doTest("// test\n", `// test\nclass MyClass {\n}\n`);
        });

        it("should write trivia as a writer function", () => {
            doTest(writer => writer.write("// test"), `// test\nclass MyClass {\n}\n`);
        });

        it("should write trivia when providing an array", () => {
            doTest(["// test", "// other"], `// test\n// other\nclass MyClass {\n}\n`);
        });

        it("should close the comment with a */ when not closing it", () => {
            doTest("/* test", `/* test */class MyClass {\n}\n`);
        });

        it("should not do a newline after a */ comment", () => {
            doTest("/* test */", `/* test */class MyClass {\n}\n`);
        });

        it("should not think it's inside a star slash comment when in a slash slash", () => {
            // so should do a newline
            doTest("// /* test", `// /* test\nclass MyClass {\n}\n`);
        });
    });

    describe("trailing trivia", () => {
        function doTest(trailingTrivia: Structure["trailingTrivia"], expectedText: string) {
            const { sourceFile } = getInfoFromText("");
            sourceFile.addClass({
                trailingTrivia,
                name: "MyClass"
            });
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should do nothing when an empty string", () => {
            doTest("", `class MyClass {\n}\n`);
        });

        it("should write trivia as a string", () => {
            doTest("// test", `class MyClass {\n}// test\n`);
        });

        it("should not write extra newline when ends with a newline", () => {
            doTest("// test\n", `class MyClass {\n}// test\n`);
        });

        it("should write trivia as a writer function", () => {
            doTest(writer => writer.write("// test"), `class MyClass {\n}// test\n`);
        });

        it("should write leading trivia when providing an array", () => {
            doTest(["// test", "// other"], `class MyClass {\n}// test\n// other\n`);
        });

        it("should not close the comment with a */ when not closing it", () => {
            doTest("/* test", `class MyClass {\n}/* test\n`);
        });
    });
});
