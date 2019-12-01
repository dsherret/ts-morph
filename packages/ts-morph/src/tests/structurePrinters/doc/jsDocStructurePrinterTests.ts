import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { JSDocStructurePrinter } from "../../../structurePrinters";
import { JSDocStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(JSDocStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
    }

    function doTest(structure: OptionalKind<JSDocStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forJSDoc().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    describe(nameof<JSDocStructurePrinter>(p => p.printText), () => {
        describe(nameof<JSDocStructure>(s => s.description), () => {
            it("should write when single line", () => {
                doTest({ description: "Test" }, `/** Test */`);
            });

            it("should write multi-line when starts with \\n", () => {
                doTest({ description: "\nTest" }, `/**\n * Test\n */`);
            });

            it("should write multi-line when starts with \\r\\n", () => {
                doTest({ description: "\r\nTest" }, `/**\n * Test\n */`);
            });

            it("should write multi-line when is multiple lines", () => {
                doTest({ description: "Test\nOther" }, `/**\n * Test\n * Other\n */`);
            });

            it("should ignore first newline when is multi-line", () => {
                // This is to prevent a newline at the start when someone transitions
                // from writing a forced multi-line js doc to an actual multi-line js doc.
                doTest({ description: "\nTest\nOther" }, `/**\n * Test\n * Other\n */`);
            });

            it("should have a new newline when starting with two new lines", () => {
                // workaround for someone who really wants to do this
                doTest({ description: "\n\nTest\nOther" }, `/**\n *\n * Test\n * Other\n */`);
            });
        });

        describe(nameof<JSDocStructure>(s => s.tags), () => {
            it("should write with single line description and tag", () => {
                doTest(
                    { description: "Test", tags: [{ tagName: "param", text: "p - Test" }] },
                    `/**\n * Test\n * @param p - Test\n */`
                );
            });

            it("should write with multi-line description and tag", () => {
                doTest(
                    { description: "\nTest", tags: [{ tagName: "param", text: "p - Test" }] },
                    `/**\n * Test\n * @param p - Test\n */`
                );
            });

            it("should write with description and tags", () => {
                doTest(
                    { description: "Test.\nOther.", tags: [{ tagName: "param", text: "p - Test" }, { tagName: "param", text: "other" }] },
                    `/**\n * Test.\n * Other.\n * @param p - Test\n * @param other\n */`
                );
            });

            it("should write with only tags", () => {
                doTest(
                    { tags: [{ tagName: "param", text: "p - Test" }, { tagName: "param" }] },
                    `/**\n * @param p - Test\n * @param\n */`
                );
            });

            it("should write tag that is multi-line", () => {
                doTest(
                    { tags: [{ tagName: "param", text: "p - Test\nOther." }] },
                    `/**\n * @param p - Test\n * Other.\n */`
                );
            });
        });
    });
});
