import { expect } from "chai";
import { FormatCodeSettings } from "../../../compiler";
import { JSDocTagStructurePrinter } from "../../../structurePrinters";
import { JSDocTagStructure, OptionalKind } from "../../../structures";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(JSDocTagStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
        printStarsOnNewLine?: boolean;
    }

    function doTest(structure: OptionalKind<JSDocTagStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forJSDocTag({ printStarsOnNewLine: options.printStarsOnNewLine ?? true }).printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    describe(nameof<JSDocTagStructurePrinter>(p => p.printText), () => {
        it("should write with only tag name", () => {
            doTest(
                { tagName: "param" },
                `@param`
            );
        });

        it("should write with tag name and text", () => {
            doTest(
                { tagName: "param", text: "p - Test" },
                `@param p - Test`
            );
        });

        it("should write with tag name and text with writer function", () => {
            doTest(
                { tagName: "param", text: writer => writer.write("p - Test") },
                `@param p - Test`
            );
        });

        it("should write multi-line text with stars when specified", () => {
            doTest(
                { tagName: "param", text: "p - Test\nother" },
                `@param p - Test\n * other`
            );
        });

        it("should write multi-line text without stars when specified", () => {
            doTest(
                { tagName: "param", text: "p - Test\nother" },
                `@param p - Test\nother`,
                { printStarsOnNewLine: false }
            );
        });
    });
});
