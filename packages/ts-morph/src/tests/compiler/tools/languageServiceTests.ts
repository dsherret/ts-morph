import { expect } from "chai";
import { EmitOutput, FileTextChanges, LanguageService, SourceFile, TextChange, TextSpan } from "../../../compiler";
import { errors, ScriptTarget, ts } from "@ts-morph/common";
import { getInfoFromText } from "../testHelpers";

describe(nameof(LanguageService), () => {
    describe(nameof<LanguageService>(l => l.getEmitOutput), () => {
        it("should get the emit output", () => {
            function doTest(sourceFileOrFilePath: string | SourceFile) {
                const output = sourceFile._context.languageService.getEmitOutput(sourceFileOrFilePath);
                checkOutput(output, {
                    emitSkipped: false,
                    outputFiles: [{
                        fileName: "/" + sourceFile.getBaseName().replace(".ts", ".js"),
                        text: "var t = 5;\n",
                        writeByteOrderMark: false
                    }]
                });
            }

            const { sourceFile } = getInfoFromText("const t = 5;", { compilerOptions: { target: ScriptTarget.ES5 } });

            doTest(sourceFile);
            doTest(sourceFile.getFilePath());
        });

        it("should get the emit output when specifying a source file", () => {
            const { sourceFile, project } = getInfoFromText("const t = 5;", { compilerOptions: { target: ScriptTarget.ES5 } });
            const output = sourceFile._context.languageService.getEmitOutput(sourceFile);
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
            const { sourceFile, project } = getInfoFromText("const t = 5;", { compilerOptions: { declaration: true } });
            const output = sourceFile._context.languageService.getEmitOutput(sourceFile.getFilePath(), true);
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
            const { sourceFile, project } = getInfoFromText("export class Test extends MyClass {}\n", { compilerOptions: { declaration: true } });
            const output = sourceFile._context.languageService.getEmitOutput(sourceFile.getFilePath(), true);

            checkOutput(output, {
                emitSkipped: true,
                outputFiles: []
            });
        });

        it("should throw when the specified file does not exist", () => {
            const { project } = getInfoFromText("");
            expect(() => project.getLanguageService().getEmitOutput("nonExistentFile.ts")).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<LanguageService>(l => l.organizeImports), () => {
        it("should remove imports that don't exist", () => {
            const { sourceFile, project } = getInfoFromText("import * as bravo from 'bravo';\nimport * as alpha from 'alpha';", { filePath: "/file.ts" });
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
            const { project } = getInfoFromText("export default class MyClass {}", { filePath: "/MyClass.ts" });
            project.createSourceFile("/MyInterface.ts", "export default interface MyInterface {}");
            project.createSourceFile("/UnusedInterface.ts", "export default interface Identifier {}");
            const sourceFile = project.createSourceFile("/main.ts", "import MyInterface from './MyInterface';\nimport MyClass from './MyClass';\n"
                + "import UnusedInterface from './UnusedInterface';\n"
                + "const myVar: MyInterface = new MyClass();");
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

    describe(nameof<LanguageService>(l => l.getEditsForRefactor), () => {
        it("should get edits for known refactor 'Move to a new file'", () => {
            const { sourceFile, project } = getInfoFromText("export class A {}\nfunction f() { return new A(); }", { filePath: "/file.ts" });
            const nameNode = sourceFile.getClassOrThrow("A").getNameNodeOrThrow();
            const results = project.getLanguageService().getEditsForRefactor(sourceFile, {}, nameNode, "Move to a new file", "Move to a new file", {});
            expect(results!.getEdits()).to.lengthOf(2);
            expect(results!.getRenameFilePath()).to.be.undefined;
            expect(results!.getRenameLocation()).to.be.undefined;

            const edit1 = results!.getEdits().find(edit => edit.getFilePath() === sourceFile.getFilePath());
            const edit2 = results!.getEdits().find(edit => edit.getFilePath() === "/A.ts");

            expect(results!.getEdits()[0].isNewFile()).to.be.false;
            expect(results!.getEdits()[1].isNewFile()).to.be.true;

            checkFileTextChanges(edit1!, {
                fileName: "/file.ts",
                textChanges: [{
                    newText: "import { A } from \"./A\";\n\n",
                    span: { start: 0, length: 0 }
                }, {
                    newText: "",
                    span: { start: 0, length: 18 }
                }]
            });

            checkFileTextChanges(edit2!, {
                fileName: "/A.ts",
                textChanges: [{
                    newText: "export class A {\n}\n",
                    span: { start: 0, length: 0 }
                }]
            });
        });

        it("should return undefined if given refactor doesn't exists", () => {
            const { project, sourceFile } = getInfoFromText("const moment = require('moment'); moment(); ");
            expect(project.getLanguageService().getEditsForRefactor(sourceFile, {}, 1, "Non Existent Refactor", "Non Existent Refactor Action", {}))
                .to.be.undefined;
        });

        it("should throw for a file that doesn't exist", () => {
            const { project } = getInfoFromText("const moment = require('moment'); moment(); ");
            expect(() => project.getLanguageService().getEditsForRefactor("nonExistent.ts", {}, 1, "Move to a new file", "Move to a new file", {}))
                .to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<LanguageService>(l => l.getCombinedCodeFix), () => {
        it("should get the combined code fixes", () => {
            const { sourceFile, project } = getInfoFromText("export class T extends Node {}", { filePath: "/file.ts" });
            const languageService = project.getLanguageService();
            project.createSourceFile("/Node.ts", "export class Node { prop: string; }");
            const result = languageService.getCombinedCodeFix(sourceFile, "fixMissingImport");

            expect(result.getChanges().map(c => ({ filePath: c.getFilePath(), changes: c.getTextChanges().map(t => t.compilerObject) }))).to.deep.equal([{
                filePath: "/file.ts",
                changes: [{
                    newText: `import { Node } from "./Node";\n\n`,
                    span: {
                        length: 0,
                        start: 0
                    }
                }]
            }]);
        });
    });

    describe(nameof<LanguageService>(l => l.getCodeFixesAtPosition), () => {
        it("should get code fixes at position for known code fixes convertToEs6Module (error code 80001)", () => {
            const { sourceFile, project } = getInfoFromText("const moment = require('moment'); moment(); ", { filePath: "/file.ts" });
            const variableDeclaration = sourceFile.getVariableDeclarationOrThrow("moment");
            const results = project.getLanguageService().getCodeFixesAtPosition(
                sourceFile,
                variableDeclaration.getStart(),
                variableDeclaration.getEnd(),
                [80001]
            );

            expect(results).to.lengthOf(1);
            expect(results[0]!.getFixName()).to.equal("convertToEs6Module");
            expect(results[0]!.getDescription()).to.equal("Convert to ES6 module");

            expect(results[0]!.getFixId()).to.be.undefined;
            expect(results[0]!.getFixAllDescription()).to.be.undefined;

            checkFileTextChanges(results[0]!.getChanges()[0], {
                fileName: "/file.ts",
                textChanges: [{
                    newText: "import moment from 'moment';",
                    span: { start: 0, length: 33 }
                }]
            });
        });

        it("should throw for a file that doesn't exist", () => {
            const { project } = getInfoFromText("const moment = require('moment'); moment(); ");
            expect(() => project.getLanguageService().getCodeFixesAtPosition("nonExistent.ts", 0, 1, [80001], {}, {})).to.throw(errors.FileNotFoundError);
        });
    });

    describe(nameof<LanguageService>(l => l.getSuggestionDiagnostics), () => {
        it("should return default suggestion diagnostics for file", () => {
            const { sourceFile, project } = getInfoFromText("const moment = require('moment'); moment(); ");
            const diagnostics = project.getLanguageService().getSuggestionDiagnostics(sourceFile);
            expect(diagnostics).to.lengthOf(1);
            expect(diagnostics[0].getCode()).to.equal(80005);
            expect(diagnostics[0].getMessageText()).to.equal("\'require\' call may be converted to an import.");
            expect(diagnostics[0].getStart()).to.equal(15);
            expect(diagnostics[0].getLength()).to.equal(17);
        });

        it("should throw for a file that doesn't exist", () => {
            const { project } = getInfoFromText("const moment = require('moment'); moment(); ");
            expect(() => project.getLanguageService().getSuggestionDiagnostics("someFile.ts")).to.throw(errors.FileNotFoundError);
        });
    });
});

function checkOutput(
    output: EmitOutput,
    expected: { emitSkipped: boolean; outputFiles: { fileName: string; text: string; writeByteOrderMark: boolean; }[]; }
) {
    expect(output.getEmitSkipped()).to.equal(expected.emitSkipped, "emit skipped");
    expect(output.getOutputFiles().length).to.equal(expected.outputFiles.length, "output files length");
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
