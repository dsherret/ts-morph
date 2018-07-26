import { expect } from "chai";
import { EmitOutput, FileTextChanges, LanguageService, SourceFile, TextChange, TextSpan } from "../../../compiler";
import { FileNotFoundError } from "../../../errors";
import { ScriptTarget, ts } from "../../../typescript";
import { getInfoFromText } from "../testHelpers";

describe(nameof(LanguageService), () => {
    describe(nameof<LanguageService>(l => l.getEmitOutput), () => {
        it("should get the emit output", () => {
            function doTest(sourceFileOrFilePath: string | SourceFile) {
                const output = sourceFile.context.languageService.getEmitOutput(sourceFileOrFilePath);
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
            const {sourceFile, project} = getInfoFromText("const t = 5;", { compilerOptions: { target: ScriptTarget.ES5 } });
            const output = sourceFile.context.languageService.getEmitOutput(sourceFile);
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
            const {sourceFile, project} = getInfoFromText("const t = 5;", { compilerOptions: { declaration: true } });
            const output = sourceFile.context.languageService.getEmitOutput(sourceFile.getFilePath(), true);
            checkOutput(output, {
                emitSkipped: false,
                outputFiles: [{
                    fileName: "/" + sourceFile.getBaseName().replace(".ts", ".d.ts"),
                    text: "declare const t = 5;\n",
                    writeByteOrderMark: false
                }]
            });
        });

        it("should not emit if there is a declaration file error", () => {
            const {sourceFile, project} = getInfoFromText("export class Test extends MyClass {}\n", { compilerOptions: { declaration: true } });
            const output = sourceFile.context.languageService.getEmitOutput(sourceFile.getFilePath(), true);

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
            const {project} = getInfoFromText("");
            expect(() => project.getLanguageService().getEmitOutput("nonExistentFile.ts")).to.throw(FileNotFoundError);
        });
    });

    describe(nameof<LanguageService>(l => l.organizeImports), () => {
        it("should remove imports that don't exist", () => {
            const {sourceFile, project} = getInfoFromText("import * as bravo from 'bravo';\nimport * as alpha from 'alpha';", { filePath: "/file.ts" });
            const results = project.getLanguageService().organizeImports(sourceFile);
            expect(results.length).to.equal(1);
            checkFileTextChanges(results[0], {
                fileName: "/file.ts",
                textChanges: [{
                    newText: "",
                    span: { start: 0, length: 32 }
                }, {
                    newText: "",
                    span: { start: 32, length: 31 }
                }]
            });
        });

        it("should organize imports when they're used", () => {
            const {project} = getInfoFromText("export default class MyClass {}", { filePath: "/MyClass.ts" });
            project.createSourceFile("/MyInterface.ts", "export default interface MyInterface {}");
            project.createSourceFile("/UnusedInterface.ts", "export default interface Identifier {}");
            const sourceFile = project.createSourceFile("/main.ts", "import MyInterface from './MyInterface';\nimport MyClass from './MyClass';\n" +
                "import UnusedInterface from './UnusedInterface';\n" +
                "const myVar: MyInterface = new MyClass();");
            const results = project.getLanguageService().organizeImports(sourceFile.getFilePath());
            expect(results.length).to.equal(1);
            checkFileTextChanges(results[0], {
                fileName: "/main.ts",
                textChanges: [{
                    newText: "import MyClass from './MyClass';\nimport MyInterface from './MyInterface';\n",
                    span: { start: 0, length: 41 }
                }, {
                    newText: "",
                    span: { start: 41, length: 33 }
                }, {
                    newText: "",
                    span: { start: 74, length: 49 }
                }]
            });
        });
    });
});

function checkOutput(output: EmitOutput, expected: { emitSkipped: boolean; outputFiles: { fileName: string; text: string; writeByteOrderMark: boolean; }[]; }) {
    expect(output.getEmitSkipped()).to.equal(expected.emitSkipped);
    expect(output.getOutputFiles().length).to.equal(expected.outputFiles.length);
    for (let i = 0; i < expected.outputFiles.length; i++) {
        const actualFile = output.getOutputFiles()[i];
        const expectedFile = expected.outputFiles[i];
        expect(actualFile.getFilePath()).to.equal(expectedFile.fileName, "fileName");
        expect(actualFile.getText()).to.equal(expectedFile.text, "text");
        expect(actualFile.getWriteByteOrderMark()).to.equal(expectedFile.writeByteOrderMark, "writeByteOrderMark");
    }
}

function checkFileTextChanges(actual: FileTextChanges, expected: ts.FileTextChanges) {
    expect(actual.getFilePath()).to.equal(expected.fileName, "fileName");
    expect(actual.getTextChanges().length).to.equal(expected.textChanges.length, "textChangesLength");
    for (let i = 0; i < expected.textChanges.length; i++)
        checkTextChange(actual.getTextChanges()[i], expected.textChanges[i]);
}

function checkTextChange(actual: TextChange, expected: ts.TextChange) {
    expect(actual.getNewText()).to.equal(expected.newText, "newText");
    checkTextSpan(actual.getSpan(), expected.span);
}

function checkTextSpan(actual: TextSpan, expected: ts.TextSpan) {
    expect(actual.getStart()).to.equal(expected.start, "start");
    expect(actual.getLength()).to.equal(expected.length, "length");
    expect(actual.getEnd()).to.equal(expected.start + expected.length, "end");
}
