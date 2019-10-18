import { expect } from "chai";
import { Program } from "../../../compiler";
import { errors } from "@ts-morph/common";
import { getFileSystemHostWithFiles } from "../../testHelpers";
import { getInfoFromText } from "../testHelpers";

describe(nameof(Program), () => {
    describe(nameof<Program>(p => p.getGlobalDiagnostics), () => {
        it("should get the global diagnostics when not including a the lib.d.ts files", () => {
            const { project } = getInfoFromText("const t: string;");
            expect(project.getProgram().getGlobalDiagnostics().length).to.equal(8);
        });

        it("should have no global compile errors when including the lib.d.ts files", () => {
            const { project } = getInfoFromText("const t: string;", { includeLibDts: true });
            expect(project.getProgram().getGlobalDiagnostics().length).to.equal(0);
        });
    });

    describe(nameof<Program>(p => p.emit), () => {
        it("should throw if specifying a writeCallback", async () => {
            let error: any;
            const { project } = getInfoFromText("const t: string;", { includeLibDts: true });
            try {
                await project.getProgram().emit({ writeFile: () => {} });
            } catch (e) {
                error = e;
            }
            expect(error).to.be.instanceOf(errors.InvalidOperationError);
        });
    });

    describe(nameof<Program>(p => p.emitSync), () => {
        it("should not throw if specifying a writeCallback", () => {
            const { project } = getInfoFromText("const t: string;", { includeLibDts: true });
            expect(() => project.getProgram().emitSync({ writeFile: () => {} })).to.not.throw();
        });
    });

    describe(nameof<Program>(p => p.isSourceFileFromExternalLibrary), () => {
        it("should not be when not", () => {
            const { project, sourceFile } = getInfoFromText("");
            expect(project.getProgram().isSourceFileFromExternalLibrary(sourceFile)).to.be.false;
        });

        it("should be when is", () => {
            const { program, librarySourceFile } = trueSetup();
            expect(program.isSourceFileFromExternalLibrary(librarySourceFile)).to.be.true;
        });

        it("should be after manipulating the file", () => {
            const { program, librarySourceFile } = trueSetup();
            librarySourceFile.addStatements("console;");
            expect(program.isSourceFileFromExternalLibrary(librarySourceFile)).to.be.true;
        });

        function trueSetup() {
            const fileSystem = getFileSystemHostWithFiles([
                { filePath: "package.json", text: `{ "name": "testing", "version": "0.0.1" }` },
                {
                    filePath: "node_modules/library/package.json",
                    text: `{ "name": "library", "version": "0.0.1", "main": "index.js", `
                        + `"typings": "index.d.ts", "typescript": { "definition": "index.d.ts" } }`
                },
                { filePath: "node_modules/library/index.js", text: "export class Test {}" },
                { filePath: "node_modules/library/index.d.ts", text: "export class Test {}" }
            ], ["node_modules", "node_modules/library"]);
            const { sourceFile, project } = getInfoFromText("import { Test } from 'library';", { host: fileSystem });
            const librarySourceFile = sourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFileOrThrow();
            return { program: project.getProgram(), librarySourceFile };
        }
    });
});
