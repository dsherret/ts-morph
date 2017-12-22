import * as ts from "typescript";
import {expect} from "chai";
import {LanguageService, EmitOutput} from "./../../../compiler";
import {FileNotFoundError} from "./../../../errors";
import {FileUtils} from "./../../../utils";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(LanguageService), () => {
    describe(nameof<LanguageService>(l => l.getEmitOutput), () => {
        function checkOutput(output: EmitOutput, expected: { emitSkipped: boolean; outputFiles: { fileName: string; text: string; writeByteOrderMark: boolean; }[]; }) {
            expect(output.getEmitSkipped()).to.equal(expected.emitSkipped);
            expect(output.getOutputFiles().length).to.equal(expected.outputFiles.length);
            for (let i = 0; i < expected.outputFiles.length; i++) {
                const actualFile = output.getOutputFiles()[i];
                const expectedFile = expected.outputFiles[i];
                expect(actualFile.getName()).to.equal(FileUtils.getStandardizedAbsolutePath(expectedFile.fileName));
                expect(actualFile.getText()).to.equal(expectedFile.text);
                expect(actualFile.getWriteByteOrderMark()).to.equal(expectedFile.writeByteOrderMark);
            }
        }

        it("should get the emit output", () => {
            const {sourceFile, tsSimpleAst} = getInfoFromText("const t = 5;", { compilerOptions: { target: ts.ScriptTarget.ES5 } });
            const output = sourceFile.global.languageService.getEmitOutput(sourceFile.getFilePath());
            checkOutput(output, {
                emitSkipped: false,
                outputFiles: [{
                    fileName: sourceFile.getBaseName().replace(".ts", ".js"),
                    text: "var t = 5;\n",
                    writeByteOrderMark: false
                }]
            });
        });

        it("should only emit the declaration file when specified", () => {
            const {sourceFile, tsSimpleAst} = getInfoFromText("const t = 5;", { compilerOptions: { declaration: true } });
            const output = sourceFile.global.languageService.getEmitOutput(sourceFile.getFilePath(), true);
            checkOutput(output, {
                emitSkipped: false,
                outputFiles: [{
                    fileName: sourceFile.getBaseName().replace(".ts", ".d.ts"),
                    text: "declare const t = 5;\n",
                    writeByteOrderMark: false
                }]
            });
        });

        it("should not emit if there is a declaraton file error", () => {
            const {sourceFile, tsSimpleAst} = getInfoFromText("class MyClass {}\n export class Test extends MyClass {}\n", { compilerOptions: { declaration: true } });
            const output = sourceFile.global.languageService.getEmitOutput(sourceFile.getFilePath(), true);
            checkOutput(output, {
                emitSkipped: true,
                outputFiles: []
            });

            expect(output.getDiagnostics().length).to.equal(1);
        });

        it("should throw when the specified file does not exist", () => {
            const {tsSimpleAst} = getInfoFromText("");
            expect(() => tsSimpleAst.getLanguageService().getEmitOutput("nonExistentFile.ts")).to.throw(FileNotFoundError);
        });
    });
});
