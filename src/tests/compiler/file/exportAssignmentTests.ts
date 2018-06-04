import { expect } from "chai";
import { ExportAssignment } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(ExportAssignment), () => {
    describe(nameof<ExportAssignment>(n => n.isExportEquals), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ExportAssignment>(text);
            expect(firstChild.isExportEquals()).to.equal(expected);
        }

        it("should be an export equals when is one", () => {
            doTest("export = 5;", true);
        });

        it("should not be an export equals when not one", () => {
            doTest(`export default 5;`, false);
        });
    });

    describe(nameof<ExportAssignment>(n => n.getExpression), () => {
        function doTest(text: string, expected: string) {
            const {firstChild} = getInfoFromText<ExportAssignment>(text);
            expect(firstChild.getExpression().getText()).to.equal(expected);
        }

        it("should get the expression for an export equals", () => {
            doTest("export = 5;", "5");
        });

        it("should get the expression for an export default", () => {
            doTest("export default 5;", "5");
        });
    });
});
