import { DiagnosticCategory, nameof } from "@ts-morph/common";
import { expect } from "chai";
import { Diagnostic } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe("Diagnostic", () => {
  const { project, sourceFile } = getInfoFromText("const a: string;", { includeLibDts: true });
  project.createSourceFile("file.ts", "interface MyInterface { declare prop: string; }");
  const diagnostics = project.getPreEmitDiagnostics();
  const constError = diagnostics[1];

  it("should have two errors overall", () => {
    expect(diagnostics.length).to.equal(2);
  });

  describe("getting diagnostics from a source file", () => {
    const sourceFileDiagnostics = sourceFile.getPreEmitDiagnostics();
    it("should have the correct error in the original source file", () => {
      expect(sourceFileDiagnostics.length).to.equal(1);
    });
  });

  describe(nameof<Diagnostic>("getMessageText"), () => {
    it("should get the message text", () => {
      expect(constError.getMessageText()).to.equal(`'const' declarations must be initialized.`);
    });
  });

  describe(nameof<Diagnostic>("getCategory"), () => {
    it("should get the category", () => {
      expect(constError.getCategory()).to.equal(DiagnosticCategory.Error);
    });
  });

  describe(nameof<Diagnostic>("getCode"), () => {
    it("should get the code", () => {
      expect(constError.getCode()).to.equal(1155);
    });
  });

  describe(nameof<Diagnostic>("getStart"), () => {
    it("should get the start", () => {
      expect(constError.getStart()).to.equal(6);
    });
  });

  describe(nameof<Diagnostic>("getLineNumber"), () => {
    it("should get the line number", () => {
      expect(constError.getLineNumber()).to.equal(1);
    });
  });

  describe(nameof<Diagnostic>("getLength"), () => {
    it("should get the length", () => {
      expect(constError.getLength()).to.equal(1);
    });
  });

  // getSource is gone: tsgo's ast.Diagnostic carries no source field. The LSP
  // layer stamps a constant "ts" on the way out (internal/ls/lsconv/converters.go),
  // so there is nothing per-diagnostic left to read.

  describe(nameof<Diagnostic>("getSourceFile"), () => {
    it("should get the source file", () => {
      expect(constError.getSourceFile()!.getFilePath()).to.equal(sourceFile.getFilePath());
    });
  });

  // tsgo reports a span rather than a start and a length, and gives -1 for a
  // diagnostic with no location, where the `typescript` package left both undefined
  describe("a diagnostic with no location", () => {
    it("should have no start, length or line number", () => {
      const { project } = getInfoFromText("", { compilerOptions: { types: ["does-not-exist"] } });
      const diagnostic = project.getPreEmitDiagnostics().find(d => d.getCode() === 2688)!;
      expect(diagnostic).to.not.be.undefined;
      expect(diagnostic.getSourceFile()).to.be.undefined;
      expect(diagnostic.getStart()).to.be.undefined;
      expect(diagnostic.getLength()).to.be.undefined;
      expect(diagnostic.getLineNumber()).to.be.undefined;
    });
  });
});
