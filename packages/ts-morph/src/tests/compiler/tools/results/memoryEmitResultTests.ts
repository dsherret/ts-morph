import { CompilerOptions } from "@ts-morph/common";
import { expect } from "chai";
import { Project } from "../../../../Project";
import { MemoryEmitResult } from "../../../../compiler";
describe(nameof(MemoryEmitResult), () => {
    function emitSetup(compilerOptions: CompilerOptions) {
        const project = new Project({ compilerOptions, useInMemoryFileSystem: true });
        const fileSystem = project.getFileSystem();
        fileSystem.writeFileSync("file1.ts", "\uFEFFconst num1 = 1;"); // has BOM
        project.addSourceFileAtPath("file1.ts");
        project.createSourceFile("file2.ts", "const num2 = 2;");
        return { project, fileSystem };
    }

    describe(nameof<MemoryEmitResult>(r => r.saveFiles), () => {
        it("should save multiple files asynchronously", async () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
            const result = project.emitToMemory();
            await result.saveFiles();

            expect(fileSystem.readFileSync("dist/file1.js")).to.equal("var num1 = 1;\n");
            expect(fileSystem.readFileSync("dist/file2.js")).to.equal("var num2 = 2;\n");
        });

        it("should save multiple files asynchronously with bom when specified", async () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", emitBOM: true });
            const result = project.emitToMemory();
            await result.saveFiles();

            expect(fileSystem.readFileSync("dist/file1.js")).to.equal("\uFEFFvar num1 = 1;\n");
            expect(fileSystem.readFileSync("dist/file2.js")).to.equal("\uFEFFvar num2 = 2;\n");
        });
    });

    describe(nameof<MemoryEmitResult>(r => r.saveFilesSync), () => {
        it("should save multiple files synchronously", () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
            const result = project.emitToMemory();
            result.saveFilesSync();

            expect(fileSystem.readFileSync("dist/file1.js")).to.equal("var num1 = 1;\n");
            expect(fileSystem.readFileSync("dist/file2.js")).to.equal("var num2 = 2;\n");
        });

        it("should save multiple files synchronously with BOM when specified", () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", emitBOM: true });
            const result = project.emitToMemory();
            result.saveFilesSync();

            expect(fileSystem.readFileSync("dist/file1.js")).to.equal("\uFEFFvar num1 = 1;\n");
            expect(fileSystem.readFileSync("dist/file2.js")).to.equal("\uFEFFvar num2 = 2;\n");
        });
    });
});
