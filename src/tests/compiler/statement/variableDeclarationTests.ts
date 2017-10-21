import {expect} from "chai";
import {VariableStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(VariableStatement), () => {
    describe(nameof<VariableStatement>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getVariableDeclarations()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the statement when the only declaration", () => {
            doTest("const t = '';\nconst v = '';\nconst u = '';", 1, "const t = '';\nconst u = '';");
        });

        it("should remove the variable declaration when the first", () => {
            doTest("const t = 1, u = 2;", 0, "const u = 2;");
        });

        it("should remove the variable declaration when in the middle", () => {
            doTest("const t = 1, u = 2, v = 3;", 1, "const t = 1, v = 3;");
        });

        it("should remove the variable declaration when the last", () => {
            doTest("const t = 1, u = 2;", 1, "const t = 1;");
        });
    });
});
