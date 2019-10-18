import { expect } from "chai";
import { ExportAssignment } from "../../../../compiler";
import { ExportAssignmentStructure, StructureKind } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

describe(nameof(ExportAssignment), () => {
    describe(nameof<ExportAssignment>(n => n.isExportEquals), () => {
        function doTest(text: string, expected: boolean) {
            const { firstChild } = getInfoFromText<ExportAssignment>(text);
            expect(firstChild.isExportEquals()).to.equal(expected);
        }

        it("should be an export equals when is one", () => {
            doTest("export = 5;", true);
        });

        it("should not be an export equals when not one", () => {
            doTest(`export default 5;`, false);
        });
    });

    describe(nameof<ExportAssignment>(n => n.setIsExportEquals), () => {
        function doTest(text: string, value: boolean, expected: string) {
            const { firstChild, sourceFile } = getInfoFromText<ExportAssignment>(text);
            firstChild.setIsExportEquals(value);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should do nothing when is one", () => {
            doTest("export = 5", true, "export = 5");
        });

        it("should change to export default", () => {
            doTest("export = 5", false, "export default 5");
        });

        it("should change to export equals", () => {
            doTest("export default 5", true, "export = 5");
        });
    });

    describe(nameof<ExportAssignment>(n => n.getExpression), () => {
        function doTest(text: string, expected: string) {
            const { firstChild } = getInfoFromText<ExportAssignment>(text);
            expect(firstChild.getExpression().getText()).to.equal(expected);
        }

        it("should get the expression for an export equals", () => {
            doTest("export = 5;", "5");
        });

        it("should get the expression for an export default", () => {
            doTest("export default 5;", "5");
        });
    });

    describe(nameof<ExportAssignment>(n => n.setExpression), () => {
        function doTest(text: string, textOrWriterFunction: string | WriterFunction, expected: string) {
            const { firstChild, sourceFile } = getInfoFromText<ExportAssignment>(text);
            firstChild.setExpression(textOrWriterFunction);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should set for an export equals", () => {
            doTest("export = 5;", "6", "export = 6;");
        });

        it("should set with writer and using queued child indentation", () => {
            doTest("export = 5;", writer => writer.writeLine("4 +").write("7"), "export = 4 +\n    7;");
        });

        it("should set for an export default", () => {
            doTest("export default 5;", writer => writer.write("6"), "export default 6;");
        });
    });

    describe(nameof<ExportAssignment>(n => n.getStructure), () => {
        function doTest(text: string, structure: Partial<ExportAssignmentStructure>, expected: string) {
            const { firstChild, sourceFile } = getInfoFromText<ExportAssignment>(text);
            firstChild.set(structure);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should do nothing when empty", () => {
            doTest("export = 5;", {}, "export = 5;");
        });

        it("should set everything when specified", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<ExportAssignmentStructure>> = {
                expression: "6",
                isExportEquals: false
            };
            doTest("export = 5;", structure, "export default 6;");
        });
    });

    describe(nameof<ExportAssignment>(n => n.getStructure), () => {
        function doTest(text: string, expected: OptionalTrivia<MakeRequired<ExportAssignmentStructure>>) {
            const structure = getInfoFromText<ExportAssignment>(text).firstChild.getStructure();
            expect(structure).to.deep.equals(expected);
        }

        it("should get structure for an export equals", () => {
            doTest("export = 5;", {
                kind: StructureKind.ExportAssignment,
                expression: "5",
                isExportEquals: true
            });
        });

        it("should get structure for an export default", () => {
            doTest("export default 5;", {
                kind: StructureKind.ExportAssignment,
                expression: "5",
                isExportEquals: false
            });
        });
    });
});
