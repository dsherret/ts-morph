import { errors, nameof, ScriptTarget, ts } from "@ts-morph/common";
import { expect } from "chai";
import { EmitOutput, FileTextChanges, LanguageService, SourceFile, TextChange, TextSpan } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe("LanguageService", () => {
  describe(nameof<LanguageService>("getEmitOutput"), () => {
    it("should get the emit output", () => {
      function doTest(sourceFileOrFilePath: string | SourceFile) {
        const output = sourceFile._context.languageService.getEmitOutput(sourceFileOrFilePath);
        checkOutput(output, {
          emitSkipped: false,
          outputFiles: [{
            fileName: "/" + sourceFile.getBaseName().replace(".ts", ".js"),
            text: "\"use strict\";\nconst t = 5;\n",
            writeByteOrderMark: false,
          }],
        });
      }

      const { sourceFile } = getInfoFromText("const t = 5;", { compilerOptions: { target: ScriptTarget.ES2015 } });

      doTest(sourceFile);
      doTest(sourceFile.getFilePath());
    });

    it("should get the emit output when specifying a source file", () => {
      const { sourceFile, project } = getInfoFromText("const t = 5;", { compilerOptions: { target: ScriptTarget.ES2015 } });
      const output = sourceFile._context.languageService.getEmitOutput(sourceFile);
      checkOutput(output, {
        emitSkipped: false,
        outputFiles: [{
          fileName: "/" + sourceFile.getBaseName().replace(".ts", ".js"),
          text: "\"use strict\";\nconst t = 5;\n",
          writeByteOrderMark: false,
        }],
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
          writeByteOrderMark: false,
        }],
      });
    });

    it("should throw when the specified file does not exist", () => {
      const { project } = getInfoFromText("");
      expect(() => project.getLanguageService().getEmitOutput("nonExistentFile.ts")).to.throw(errors.FileNotFoundError);
    });
  });

  describe(nameof<LanguageService>("organizeImports"), () => {
    it("should remove imports that don't exist", () => {
      const { sourceFile, project } = getInfoFromText("import * as bravo from 'bravo';\nimport * as alpha from 'alpha';", { filePath: "/file.ts" });
      const results = project.getLanguageService().organizeImports(sourceFile);
      expect(results.length).to.equal(1);
      // one change rather than two: tsgo's change tracker coalesces the adjacent
      // deletions into a single span covering both import declarations.
      checkFileTextChanges(results[0], {
        fileName: "/file.ts",
        textChanges: [{
          newText: "",
          span: { start: 0, length: 63 },
        }],
      });
    });

    it("should organize imports when they're used", () => {
      const { project } = getInfoFromText("export default class MyClass {}", { filePath: "/MyClass.ts" });
      project.createSourceFile("/MyInterface.ts", "export default interface MyInterface {}");
      project.createSourceFile("/UnusedInterface.ts", "export default interface Identifier {}");
      const sourceFile = project.createSourceFile(
        "/main.ts",
        "import MyInterface from './MyInterface';\nimport MyClass from './MyClass';\n"
          + "import UnusedInterface from './UnusedInterface';\n"
          + "const myVar: MyInterface = new MyClass();",
      );
      const results = project.getLanguageService().organizeImports(sourceFile.getFilePath());
      expect(results.length).to.equal(1);
      checkFileTextChanges(results[0], {
        fileName: "/main.ts",
        textChanges: [{
          newText: "import MyClass from './MyClass';\nimport MyInterface from './MyInterface';\n",
          span: { start: 0, length: 41 },
        }, {
          newText: "",
          span: { start: 41, length: 33 },
        }, {
          newText: "",
          span: { start: 74, length: 49 },
        }],
      });
    });
  });

  // getEditsForRefactor is gone: tsgo has no refactor surface at all. See
  // src/tests/removed-capabilities/refactorEditInfoTests.ts for the record.

  describe(nameof<LanguageService>("getCombinedCodeFix"), () => {
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
            start: 0,
          },
        }],
      }]);
    });
  });

  describe(nameof<LanguageService>("getCodeFixesAtPosition"), () => {
    // this used to exercise convertToEsModule (error code 80001), which tsgo has
    // no provider for — its three are import fixes, isolated declarations and
    // class-implements. See internal/ls/codeactions.go:86.
    it("should get code fixes at position for known code fixes fixMissingImport (error code 2304)", () => {
      const { sourceFile, project } = getInfoFromText("export class T extends Node {}", { filePath: "/file.ts" });
      project.createSourceFile("/Node.ts", "export class Node { prop: string; }");
      const nameNode = sourceFile.getClassOrThrow("T").getExtendsOrThrow().getExpression();
      const results = project.getLanguageService().getCodeFixesAtPosition(sourceFile, nameNode.getStart(), nameNode.getEnd(), [2304]);

      // getFixName, getFixId and getFixAllDescription are gone with the fix-all
      // grouping; see the note on the CodeFixAction wrapper.
      expect(results).to.lengthOf(1);
      expect(results[0]!.getDescription()).to.equal("Add import from \"./Node\"");

      checkFileTextChanges(results[0]!.getChanges()[0], {
        fileName: "/file.ts",
        textChanges: [{
          newText: "import { Node } from \"./Node\";\n\n",
          span: { start: 0, length: 0 },
        }],
      });
    });

    it("should throw for a file that doesn't exist", () => {
      const { project } = getInfoFromText("const moment = require('moment'); moment(); ");
      // the trailing formatSettings and userPreferences arguments are gone: tsgo
      // takes neither for a code fix
      expect(() => project.getLanguageService().getCodeFixesAtPosition("nonExistent.ts", 0, 1, [2304])).to.throw(errors.FileNotFoundError);
    });
  });

  describe(nameof<LanguageService>("getSuggestionDiagnostics"), () => {
    // this used to assert 80005, "'require' call may be converted to an import".
    // tsgo's suggestions come from the checker only — deprecated declarations and
    // unused ones — so the services-layer suggestions classic TypeScript computed
    // in suggestionDiagnostics.ts are not produced.
    it("should return default suggestion diagnostics for file", () => {
      const { sourceFile, project } = getInfoFromText("/** @deprecated */\nfunction old() {}\nold();");
      const diagnostics = project.getLanguageService().getSuggestionDiagnostics(sourceFile);
      expect(diagnostics).to.lengthOf(1);
      expect(diagnostics[0].getCode()).to.equal(6387);
      expect(diagnostics[0].getMessageText()).to.equal("The signature '(): void' of 'old' is deprecated.");
      expect(diagnostics[0].getStart()).to.equal(37);
      expect(diagnostics[0].getLength()).to.equal(3);
    });

    it("should throw for a file that doesn't exist", () => {
      const { project } = getInfoFromText("const moment = require('moment'); moment(); ");
      expect(() => project.getLanguageService().getSuggestionDiagnostics("someFile.ts")).to.throw(errors.FileNotFoundError);
    });
  });
});

function checkOutput(
  output: EmitOutput,
  expected: { emitSkipped: boolean; outputFiles: { fileName: string; text: string; writeByteOrderMark: boolean }[] },
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
