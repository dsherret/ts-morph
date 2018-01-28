import {expect} from "chai";
import {ImportEqualsDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ImportEqualsDeclaration), () => {
    describe(nameof<ImportEqualsDeclaration>(n => n.getName), () => {
        function doTest(text: string, expected: string) {
            const {firstChild} = getInfoFromText<ImportEqualsDeclaration>(text);
            expect(firstChild.getName()).to.equal(expected);
        }

        it("should get the name", () => {
            doTest("import test = Namespace.Test;", "test");
        });
    });

    describe(nameof<ImportEqualsDeclaration>(n => n.getModuleReference), () => {
        function doTest(text: string, expected: string) {
            const {firstChild} = getInfoFromText<ImportEqualsDeclaration>(text);
            expect(firstChild.getModuleReference().getText()).to.equal(expected);
        }

        it("should get the module reference when specifying an entity", () => {
            doTest("import test = Namespace.Test;", "Namespace.Test");
        });

        it("should get the module specifier when importing a require", () => {
            doTest(`import test = require("testing");`, `require("testing")`);
        });
    });

    describe(nameof<ImportEqualsDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            (sourceFile.getStatements()[index] as ImportEqualsDeclaration).remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the import equals declaration", () => {
            doTest("import test = Namespace.Test;", 0, "");
        });
    });
});
