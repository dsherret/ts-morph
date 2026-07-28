import { errors, nameof } from "@ts-morph/common";
import { expect } from "chai";
import { Program } from "../../../compiler";
import { Project } from "../../../Project";
import { getFileSystemHostWithFiles } from "../../testHelpers";
import { getInfoFromText } from "../testHelpers";

describe("Program", () => {
  describe(nameof<Program>("getGlobalDiagnostics"), () => {
    it("should get the global diagnostics when not including a the lib.d.ts files", () => {
      const { project } = getInfoFromText("const t: string;");
      expect(project.getProgram().getGlobalDiagnostics().length).to.equal(10);
    });

    it("should have no global compile errors when including the lib.d.ts files", () => {
      const { project } = getInfoFromText("const t: string;", { includeLibDts: true });
      expect(project.getProgram().getGlobalDiagnostics().length).to.equal(0);
    });

    // tsgo's own global category is every project diagnostic without a file,
    // which is what an options diagnostic is; these are the checker's alone
    it("should not report the options diagnostics the program reports", () => {
      const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { allowJs: true } });
      project.createSourceFile("/a.js", "var x = 1;");
      // 5055, from the program category
      expect(project.getProgram().getGlobalDiagnostics().map(d => d.getCode())).to.deep.equal([]);
      expect(project.getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([5055]);
    });
  });

  describe(nameof<Program>("emit"), () => {
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

  describe(nameof<Program>("emitSync"), () => {
    it("should not throw if specifying a writeCallback", () => {
      const { project } = getInfoFromText("const t: string;", { includeLibDts: true });
      expect(() => project.getProgram().emitSync({ writeFile: () => {} })).to.not.throw();
    });
  });

  describe(nameof<Program>("isSourceFileFromExternalLibrary"), () => {
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
            + `"typings": "index.d.ts", "typescript": { "definition": "index.d.ts" } }`,
        },
        { filePath: "node_modules/library/index.js", text: "export class Test {}" },
        { filePath: "node_modules/library/index.d.ts", text: "export class Test {}" },
      ], ["node_modules", "node_modules/library"]);
      const { sourceFile, project } = getInfoFromText("import { Test } from 'library';", { host: fileSystem });
      const librarySourceFile = sourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFileOrThrow();
      return { program: project.getProgram(), librarySourceFile };
    }

    // the setup above reaches the library file through the import declaration's symbol.
    // resolveSourceFileDependencies takes the other route — the compiler pulls the file
    // into the program and ts-morph looks it up by path afterwards
    it("should be for a dependency the compiler resolved into the program", () => {
      const { project } = resolvedSetup();
      const librarySourceFile = project.getSourceFileOrThrow("/node_modules/library/index.d.ts");
      expect(project.getProgram().isSourceFileFromExternalLibrary(librarySourceFile)).to.be.true;
    });

    it("should not be for the file that imported the dependency", () => {
      const { project } = resolvedSetup();
      expect(project.getProgram().isSourceFileFromExternalLibrary(project.getSourceFileOrThrow("/main.ts"))).to.be.false;
    });

    // the same channel carries the default library flag, so a dead channel shows up here too
    it("should leave the lib files reported as default library files", () => {
      const { project } = resolvedSetup();
      const compilerProgram = project.getProgram().compilerObject;
      const libFiles = compilerProgram.getSourceFiles().filter(f => compilerProgram.isSourceFileDefaultLibrary(f));
      expect(libFiles.length).to.be.greaterThan(0);
      expect(libFiles.every(f => f.fileName.includes("/lib."))).to.be.true;
    });

    function resolvedSetup() {
      const fileSystem = getFileSystemHostWithFiles([
        { filePath: "package.json", text: `{ "name": "testing", "version": "0.0.1" }` },
        {
          filePath: "node_modules/library/package.json",
          text: `{ "name": "library", "version": "0.0.1", "main": "index.js", "typings": "index.d.ts" }`,
        },
        { filePath: "node_modules/library/index.d.ts", text: "export declare class Test {}" },
        { filePath: "main.ts", text: "import { Test } from 'library';\nconst t: Test = null as any;\n" },
      ], ["node_modules", "node_modules/library"]);
      const project = new Project({ fileSystem });
      project.addSourceFileAtPath("/main.ts");
      project.resolveSourceFileDependencies();
      return { project };
    }
  });
});
