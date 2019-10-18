import { expect } from "chai";
import { EmitResult } from "../../../compiler";
import { Project } from "../../../Project";
import * as testHelpers from "../../testHelpers";

describe(nameof(EmitResult), () => {
    it("should get the emit result when there are no errors", async () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const project = new Project({ compilerOptions: { noLib: true, outDir: "dist" }, fileSystem });
        project.createSourceFile("file1.ts", "const num1 = 1;");
        project.createSourceFile("file2.ts", "const num2 = 2;");
        const result = await project.emit();
        expect(result.compilerObject).to.not.be.undefined;
        expect(result.getEmitSkipped()).to.be.false;
        expect(result.getDiagnostics().length).to.equal(0);
    });

    it("should get the emit result when there are errors", async () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const project = new Project({ compilerOptions: { noLib: true, outDir: "dist", noEmitOnError: true }, fileSystem });
        project.createSourceFile("file1.ts", "const num1;");
        const result = await project.emit();

        expect(result.getEmitSkipped()).to.be.true;
        const diagnostics = result.getDiagnostics();
        const filteredDiagnostics = diagnostics.map(d => d.getMessageText()).filter(d => (d as string).indexOf("Cannot find global type"));
        expect(filteredDiagnostics.length).to.equal(1);
        expect(filteredDiagnostics[0]).to.equal("'const' declarations must be initialized.");
    });
});
