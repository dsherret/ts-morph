import { expect } from "chai";
import { FormatCodeSettings, Scope } from "../../../compiler";
import { PropertyDeclarationStructurePrinter } from "../../../structurePrinters";
import { PropertyDeclarationStructure, OptionalKind } from "../../../structures";
import { OptionalKindAndTrivia } from "../../compiler/testHelpers";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe(nameof(PropertyDeclarationStructurePrinter), () => {
    interface Options {
        formatCodeSettings?: FormatCodeSettings;
        isAmbient?: boolean;
    }

    function doTest(structure: OptionalKind<PropertyDeclarationStructure>, expectedOutput: string, options: Options = {}) {
        const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
        factory.forPropertyDeclaration().printText(writer, structure);
        expect(writer.toString()).to.equal(expectedOutput);
    }

    // todo: more tests

    describe(nameof<PropertyDeclarationStructurePrinter>(p => p.printText), () => {
        it("should write a property when the structure has everything", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<PropertyDeclarationStructure>> = {
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
            };

            doTest(structure, [
                "/** test */",
                "@dec",
                "declare public abstract static readonly prop?: number = 5;"
            ].join("\n"));
        });
    });
});
