import {expect} from "chai";
import {ts, ScriptTarget} from "./../../../typescript";
import {LanguageService, EmitOutput, SourceFile} from "./../../../compiler";
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
                expect(actualFile.getFilePath()).to.equal(expectedFile.fileName);
                expect(actualFile.getText()).to.equal(expectedFile.text);
                expect(actualFile.getWriteByteOrderMark()).to.equal(expectedFile.writeByteOrderMark);
            }
        }

        it("should get the emit output", () => {
            function doTest(sourceFileOrFilePath: string | SourceFile) {
                const output = sourceFile.global.languageService.getEmitOutput(sourceFileOrFilePath);
                checkOutput(output, {
                    emitSkipped: false,
                    outputFiles: [{
                        fileName: "/" + sourceFile.getBaseName().replace(".ts", ".js"),
                        text: "var t = 5;\n",
                        writeByteOrderMark: false
                    }]
                });
            }

            const {sourceFile} = getInfoFromText("const t = 5;", { compilerOptions: { target: ScriptTarget.ES5 } });

            doTest(sourceFile);
            doTest(sourceFile.getFilePath());
        });

        it("should get the emit output when specifying a source file", () => {
            const {sourceFile, tsSimpleAst} = getInfoFromText("const t = 5;", { compilerOptions: { target: ScriptTarget.ES5 } });
            const output = sourceFile.global.languageService.getEmitOutput(sourceFile);
            checkOutput(output, {
                emitSkipped: false,
                outputFiles: [{
                    fileName: "/" + sourceFile.getBaseName().replace(".ts", ".js"),
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
                    fileName: "/" + sourceFile.getBaseName().replace(".ts", ".d.ts"),
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
                outputFiles: [{
                    fileName: "/" + sourceFile.getBaseName().replace(".ts", ".d.ts"),
                    text: "export declare class Test extends MyClass {\n}\n",
                    writeByteOrderMark: false
                }]
            });
        });

        it("should throw when the specified file does not exist", () => {
            const {tsSimpleAst} = getInfoFromText("");
            expect(() => tsSimpleAst.getLanguageService().getEmitOutput("nonExistentFile.ts")).to.throw(FileNotFoundError);
        });
    });
});
