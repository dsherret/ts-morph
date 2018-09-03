import { expect } from "chai";
import { Program } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(Program), () => {
    describe(nameof<Program>(p => p.getGlobalDiagnostics), () => {
        it("should get the global diagnostics when not including a the lib.d.ts files", () => {
            const { sourceFile, project } = getInfoFromText("const t: string;");
            expect(project.getProgram().getGlobalDiagnostics().length).to.equal(8);
        });

        it("should have no global compile errors when including the lib.d.ts files", () => {
            const { sourceFile, project } = getInfoFromText("const t: string;", { includeLibDts: true });
            expect(project.getProgram().getGlobalDiagnostics().length).to.equal(0);
        });
    });
});
