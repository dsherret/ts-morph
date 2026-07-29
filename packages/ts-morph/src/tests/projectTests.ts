import {
  CompilerOptions,
  errors,
  getLibFiles,
  InMemoryFileSystemHost,
  ModuleKind,
  ModuleResolutionKind,
  nameof,
  ResolutionHosts,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  ts,
} from "@ts-morph/common";
import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { EOL } from "node:os";
import * as path from "node:path";
import { ClassDeclaration, EmitResult, Identifier, InterfaceDeclaration, MemoryEmitResult, ModuleDeclaration, Node, SourceFile } from "../compiler";
import { IndentationText } from "../options";
import { Project, ProjectOptions } from "../Project";
import { SourceFileStructure, StructureKind } from "../structures";
import { MakeRequired } from "../typings";
import { OptionalKindAndTrivia } from "./compiler/testHelpers";
import * as testHelpers from "./testHelpers";

console.log("");
console.log("TypeScript version: " + ts.getVersion());

describe("Project", () => {
  describe("constructor", () => {
    it("should set the manipulation settings if provided", () => {
      const project = new Project({
        manipulationSettings: {
          indentationText: IndentationText.EightSpaces,
        },
      });

      expect(project.manipulationSettings.getIndentationText()).to.equal(IndentationText.EightSpaces);
    });

    it("should add the files from tsconfig.json by default with the target in the tsconfig.json", () => {
      const fileSystem = new InMemoryFileSystemHost();
      fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES2015" }, "include": ["test"] }`);
      fileSystem.writeFileSync("/otherFile.ts", "");
      fileSystem.writeFileSync("/test/file.ts", "");
      fileSystem.writeFileSync("/test/test2/file2.ts", "");
      const project = new Project({ tsConfigFilePath: "tsconfig.json", fileSystem });
      expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(["/test/file.ts", "/test/test2/file2.ts"].sort());
      expect(project.getSourceFiles().map(s => s.getLanguageVersion())).to.deep.equal([ScriptTarget.ES2015, ScriptTarget.ES2015]);
    });

    it("should add the files from tsconfig.json by default and also take into account the passed in compiler options", () => {
      const fileSystem = new InMemoryFileSystemHost();
      fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
      fileSystem.writeFileSync("/otherFile.ts", "");
      fileSystem.writeFileSync("/test/file.ts", "");
      fileSystem.writeFileSync("/test/test2/file2.ts", "");
      const project = new Project({ tsConfigFilePath: "tsconfig.json", compilerOptions: { rootDir: "/test/test2" }, fileSystem });
      expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(["/otherFile.ts", "/test/file.ts", "/test/test2/file2.ts"].sort());
    });

    it("should not add the files from tsconfig.json when specifying not to", () => {
      const fileSystem = new InMemoryFileSystemHost();
      fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES2015" } }`);
      fileSystem.writeFileSync("/test/file.ts", "");
      fileSystem.writeFileSync("/test/test2/file2.ts", "");
      const project = new Project({ tsConfigFilePath: "tsconfig.json", skipAddingFilesFromTsConfig: true, fileSystem });
      expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal([]);
    });

    it("should resolve dependencies by default", () => {
      const { project, initialFiles, resolvedFiles } = fileDependencyResolutionSetup();
      expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles, ...resolvedFiles]);
    });

    describe(nameof<ProjectOptions>("skipFileDependencyResolution"), () => {
      it("should not skip dependency resolution when false", () => {
        const { project, initialFiles, resolvedFiles } = fileDependencyResolutionSetup({ skipFileDependencyResolution: false });
        expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles, ...resolvedFiles]);
      });

      it("should skip dependency resolution when specified", () => {
        const { project, initialFiles } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });
        expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal(initialFiles);
      });
    });

    describe("custom module resolution", () => {
      it("should not throw when reading the compiler options outside a method", () => {
        expect(() =>
          new Project({
            useInMemoryFileSystem: true,
            resolutionHost: getCompilerOptions => {
              expect(getCompilerOptions()).to.deep.equal({ allowJs: true });
              return {};
            },
            compilerOptions: {
              allowJs: true,
            },
          })
        ).to.not.throw();
      });

      // The host is asked about one specifier at a time and answers where it
      // points, so a Deno-style host rewrites rather than resolving: dropping the
      // `.ts` says where to look and the compiler still decides how. It no longer
      // receives a module resolution host, because it no longer resolves itself.
      function setup(resolutionHost: ProjectOptions["resolutionHost"] = ResolutionHosts.deno) {
        const project = new Project({ useInMemoryFileSystem: true, resolutionHost });

        const testFile = project.createSourceFile("/Test.ts", "export class Test {}");
        const mainFile = project.createSourceFile("/main.ts", `import { Test } from "./Test.ts";\n\nconst test = new Test();`);
        return { project, testFile, mainFile };
      }

      it("should support when the file exists only in the project", () => {
        const { mainFile } = setup();
        const importDec = mainFile.getImportDeclarationOrThrow("./Test.ts");
        expect(importDec.getModuleSpecifierSourceFile()).to.not.be.undefined;
      });

      // What the host is actually for. tsgo finds the file behind `./Test.ts`
      // either way — resolution is not the part that needs help — but it rejects
      // the specifier as written unless `allowImportingTsExtensions` is on, and
      // that option demands `noEmit`. Rewriting the specifier means the rule never
      // applies, so this is the assertion that fails with the host removed.
      it("should accept a .ts specifier that the compiler would reject", () => {
        const { project } = setup();
        expect(project.getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([]);
      });

      it("should be the host doing that, not the compiler", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        project.createSourceFile("/Test.ts", "export class Test {}");
        project.createSourceFile(
          "/main.ts",
          `import { Test } from "./Test.ts";

const test = new Test();`,
        );
        // 5097: an import path can only end with .ts when allowImportingTsExtensions is enabled
        expect(project.getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([5097]);
      });

      it("should support when the file exists only on disk", () => {
        const { mainFile, testFile } = setup();
        testFile.saveSync();
        testFile.forget();
        const importDec = mainFile.getImportDeclarationOrThrow("./Test.ts");
        expect(importDec.getModuleSpecifierSourceFile()).to.not.be.undefined;
      });

      it("should support when renaming with the language service", () => {
        const { project, mainFile, testFile } = setup();
        testFile.getClassOrThrow("Test").rename("NewClass");
        expect(mainFile.getFullText()).to.equal(`import { NewClass } from "./Test.ts";\n\nconst test = new NewClass();`);
        // the language service resolved through the host too, or the rewritten
        // specifier would have been rejected here the way it is above
        expect(project.getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([]);
      });

      it("should tell a host how the containing file imports", () => {
        // the compiler may ask about the same specifier more than once, so this
        // records the answer per specifier rather than a call log
        const seen = new Map<string, ModuleKind | undefined>();
        const project = new Project({
          useInMemoryFileSystem: true,
          compilerOptions: { moduleResolution: ModuleResolutionKind.NodeNext, module: ModuleKind.NodeNext },
          resolutionHost: () => ({
            resolveModuleName: ({ moduleName, resolutionMode }) => {
              seen.set(moduleName, resolutionMode);
              return undefined;
            },
          }),
        });
        project.createSourceFile("/dep.mts", "export const a = 1;");
        project.createSourceFile("/dep2.cts", "export const b = 1;");
        project.createSourceFile("/esm.mts", `import { a } from "./dep.mjs";`);
        project.createSourceFile("/cjs.cts", `import { b } from "./dep2.cjs";`);
        project.getPreEmitDiagnostics();
        expect(seen.get("./dep.mjs")).to.equal(ModuleKind.ESNext);
        expect(seen.get("./dep2.cjs")).to.equal(ModuleKind.CommonJS);
      });

      it("should let a host resolve a specifier outright", () => {
        const { mainFile } = setup(() => ({
          resolveModuleName: ({ moduleName }) => moduleName === "alias" ? { resolvedFileName: "/Test.ts" } : undefined,
        }));
        const aliased = mainFile.getSourceFile().getProject().createSourceFile("/other.ts", `import { Test } from "alias";`);
        expect(aliased.getImportDeclarationOrThrow("alias").getModuleSpecifierSourceFile()?.getFilePath()).to.equal("/Test.ts");
      });
    });

    describe(nameof<ProjectOptions>("skipLoadingLibFiles"), () => {
      it("should not skip loading lib files when empty", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("test.ts", "const t: String = '';");
        expect(project.getPreEmitDiagnostics().length).to.equal(0);

        const varDeclType = sourceFile.getVariableDeclarationOrThrow("t").getType();
        const stringDec = varDeclType.getSymbolOrThrow().getDeclarations()[0];
        expect(stringDec.getSourceFile().getFilePath()).to.equal("/node_modules/typescript/lib/lib.es5.d.ts");
      });

      it("should skip loading lib files when true", () => {
        const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true });
        const sourceFile = project.createSourceFile("test.ts", "const t: String = '';");
        expect(project.getPreEmitDiagnostics().length).to.equal(11);

        const varDeclType = sourceFile.getVariableDeclarationOrThrow("t").getType();
        expect(varDeclType.getSymbol()).to.be.undefined;
      });

      it("should throw when providing skipLoadingLibFiles and a libFolderPath", async () => {
        expect(() => new Project({ skipLoadingLibFiles: true, libFolderPath: "/" }))
          .to.throw("Cannot set skipLoadingLibFiles to true when libFolderPath is provided.");
      });
    });

    describe(nameof<ProjectOptions>("libFolderPath"), () => {
      it("should support specifying a different folder for the lib files", () => {
        const fileSystem = new InMemoryFileSystemHost();
        for (const file of getLibFiles())
          fileSystem.writeFileSync(`/other/${file.fileName}`, file.text);
        const project = new Project({ fileSystem, libFolderPath: "/other" });
        const sourceFile = project.createSourceFile("test.ts", "const t: String = '';");
        expect(project.getPreEmitDiagnostics().length).to.equal(0);

        const varDeclType = sourceFile.getVariableDeclarationOrThrow("t").getType();
        const stringDec = varDeclType.getSymbolOrThrow().getDeclarations()[0];
        expect(stringDec.getSourceFile().getFilePath()).to.equal("/other/lib.es5.d.ts");
      });
    });
  });

  describe(nameof<Project>("resolveSourceFileDependencies"), () => {
    it("should resolve file dependencies once specified", () => {
      const { project, initialFiles, resolvedFiles } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });
      expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles]);
      const result = project.resolveSourceFileDependencies();
      expect(result.map(s => s.getFilePath())).to.deep.equal(resolvedFiles);
      assertHasSourceFiles(project, [...initialFiles, ...resolvedFiles]);
    });

    // a resolved file is wrapped straight off the program rather than read back in,
    // and the compiler strips a byte order mark without reporting that it did
    it("should keep the byte order mark of a resolved file", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([
        { filePath: "/dep.ts", text: "﻿export const dep = 1;\n" },
        { filePath: "/main.ts", text: `import { dep } from "./dep";\nconst a = dep;\n` },
      ]);
      const project = new Project({ fileSystem, compilerOptions: { noLib: true } });
      project.addSourceFileAtPath("/main.ts");
      project.resolveSourceFileDependencies();

      const dep = project.getSourceFileOrThrow("/dep.ts");
      dep.addStatements("export const two = 2;");
      dep.saveSync();
      expect(fileSystem.readFileSync("/dep.ts").charCodeAt(0)).to.equal(0xFEFF);
    });

    it("should not resolve file dependencies until called", () => {
      const {
        project,
        initialFiles,
        resolvedFiles,
        initialDirectories,
        resolvedDirectories,
      } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });
      expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles], "initial");
      project.getSourceFiles()[0].addStatements("console.log(5);");
      project.getProgram().compilerObject; // force the program to be created
      expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles], "after add");
      const result = project.resolveSourceFileDependencies();
      expect(result.map(s => s.getFilePath())).to.deep.equal(resolvedFiles);
      assertHasSourceFiles(project, [...initialFiles, ...resolvedFiles]);
      assertHasDirectories(project, [...initialDirectories, ...resolvedDirectories]);
    });

    it("should resolve the files in node_modules if the node_modules folder is in the project", () => {
      const {
        project,
        initialFiles,
        resolvedFiles,
        nodeModuleFiles,
        initialDirectories,
        resolvedDirectories,
        nodeModuleDirectories,
      } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });

      expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles], "initial");
      project.addDirectoryAtPath("/node_modules");
      const result = project.resolveSourceFileDependencies();
      expect(result.map(s => s.getFilePath())).to.deep.equal([...resolvedFiles, ...nodeModuleFiles]);
      assertHasSourceFiles(project, [...initialFiles, ...resolvedFiles, ...nodeModuleFiles]);
      assertHasDirectories(project, [...initialDirectories, ...resolvedDirectories, ...nodeModuleDirectories]);
    });

    it("should resolve the files in node_modules if a directory between the file and node_modules is in the project", () => {
      const {
        project,
        initialFiles,
        resolvedFiles,
        nodeModuleFiles,
        initialDirectories,
        resolvedDirectories,
      } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });
      project.addDirectoryAtPath("/node_modules/library");
      const result = project.resolveSourceFileDependencies();

      expect(result.map(s => s.getFilePath())).to.deep.equal([...resolvedFiles, ...nodeModuleFiles]);
      assertHasSourceFiles(project, [...initialFiles, ...resolvedFiles, ...nodeModuleFiles]);
      assertHasDirectories(project, [...initialDirectories, ...resolvedDirectories, "/node_modules/library"]);
    });

    it("should ignore handle nested node_modules directories", () => {
      const fileSystem = new InMemoryFileSystemHost();
      fileSystem.writeFileSync("/node_modules/first.d.ts", "");
      fileSystem.writeFileSync("/node_modules/library/node_modules/second.d.ts", "");
      fileSystem.writeFileSync(
        "/main.ts",
        "/// <reference path='node_modules/first.d.ts' />\n/// <reference path='node_modules/library/node_modules/second.d.ts' />",
      );

      const project = new Project({ fileSystem, skipLoadingLibFiles: true });
      project.addSourceFileAtPath("/main.ts");
      project.resolveSourceFileDependencies();
      assertHasSourceFiles(project, ["/main.ts"]);
      assertHasDirectories(project, ["/"]);

      project.addDirectoryAtPath("node_modules");
      assertHasSourceFiles(project, ["/main.ts"]);
      assertHasDirectories(project, ["/", "/node_modules"]);

      project.resolveSourceFileDependencies();
      assertHasSourceFiles(project, ["/main.ts", "/node_modules/first.d.ts"]);
      assertHasDirectories(project, ["/", "/node_modules"]);

      project.addDirectoryAtPath("/node_modules/library/node_modules");
      project.resolveSourceFileDependencies();
      assertHasSourceFiles(project, ["/main.ts", "/node_modules/first.d.ts", "/node_modules/library/node_modules/second.d.ts"]);
      assertHasDirectories(project, ["/", "/node_modules", "/node_modules/library", "/node_modules/library/node_modules"]);
    });
  });

  function fileDependencyResolutionSetup(options: ProjectOptions = {}) {
    const fileSystem = new InMemoryFileSystemHost();

    fileSystem.writeFileSync("/package.json", `{ "name": "testing", "version": "0.0.1" }`);
    fileSystem.writeFileSync(
      "/node_modules/library/package.json",
      `{ "name": "library", "version": "0.0.1", "main": "index.js", "typings": "index.d.ts", "typescript": { "definition": "index.d.ts" } }`,
    );
    fileSystem.writeFileSync("/node_modules/library/index.js", "export class Test {}");
    fileSystem.writeFileSync("/node_modules/library/index.d.ts", "export class Test {}");
    fileSystem.mkdirSync("/node_modules/library/subDir");
    fileSystem.writeFileSync(
      "/node_modules/library2/package.json",
      `{ "name": "library2", "version": "0.0.1", "main": "index.js", "typings": "index.d.ts", "typescript": { "definition": "index.d.ts" } }`,
    );
    fileSystem.writeFileSync("/node_modules/library2/index.js", "export class Library2 {}");
    fileSystem.writeFileSync("/node_modules/library2/index.d.ts", "export class Library2 {}");
    fileSystem.writeFileSync("/src/main.ts", "/// <reference path='../other/referenced-file.d.ts' />\n\nimport { Test } from 'library'; nameof();");
    fileSystem.writeFileSync("/other/referenced-file.d.ts", "declare function nameof(): void;");
    fileSystem.writeFileSync("/tsconfig.json", `{ "files": ["src/main.ts"] }`);

    const project = new Project({
      tsConfigFilePath: "tsconfig.json",
      fileSystem,
      skipLoadingLibFiles: true,
      ...options,
    });
    return {
      project,
      initialFiles: ["/src/main.ts"],
      initialDirectories: ["/src"],
      resolvedFiles: ["/other/referenced-file.d.ts"],
      resolvedDirectories: ["/other"],
      nodeModuleFiles: ["/node_modules/library/index.d.ts"],
      nodeModuleDirectories: ["/node_modules", "/node_modules/library"],
    };
  }

  describe(nameof<Project>("getCompilerOptions"), () => {
    it(`should get the default compiler options when not providing anything and no tsconfig exists`, () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      expect(project.getCompilerOptions()).to.deep.equal({});
    });

    it(`should not get the compiler options from tsconfig.json when not providing anything and a tsconfig exists`, () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([{
        filePath: "tsconfig.json",
        text: `{ "compilerOptions": { "rootDir": "test", "target": "ES2015" } }`,
      }]);
      const project = new Project({ fileSystem });
      expect(project.getCompilerOptions()).to.deep.equal({});
    });

    it(`should get empty compiler options when providing an empty compiler options object`, () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ compilerOptions: {}, fileSystem });
      expect(project.getCompilerOptions()).to.deep.equal({});
    });

    function doTsConfigTest(skipAddingFilesFromTsConfig: boolean) {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([{
        filePath: "tsconfig.json",
        text: `{ "compilerOptions": { "rootDir": "test", "target": "ES2015" } }`,
      }]);
      const project = new Project({
        tsConfigFilePath: "tsconfig.json",
        compilerOptions: {
          target: 2,
        },
        defaultCompilerOptions: {
          // any target other than the one above, so it is visible that the
          // explicit compilerOptions win over the defaults
          target: 3,
          allowJs: true,
        },
        skipAddingFilesFromTsConfig, // the behaviour changes based on this value so it's good to test both of these
        fileSystem,
      });
      expect(project.getCompilerOptions()).to.deep.equal({ rootDir: "/test", target: 2, allowJs: true, configFilePath: "/tsconfig.json" });
    }

    it(`should override the tsconfig options when specifying to add files from tsconfig`, () => {
      doTsConfigTest(false);
    });

    it(`should override the tsconfig options when specifying to not skip adding files from tsconfig`, () => {
      doTsConfigTest(true);
    });
  });

  describe(nameof<Project>("addDirectoryAtPathIfExists"), () => {
    it("should throw if the directory doesn't exist", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      expect(project.addDirectoryAtPathIfExists("someDir")).to.be.undefined;
    });

    it("should add the directory if it exists", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["someDir"]);
      const project = new Project({ fileSystem });
      const dir = project.addDirectoryAtPathIfExists("someDir");
      expect(dir).to.not.be.undefined;
    });

    it("should add a directory and all its descendant directories when specifying the recursive option", () => {
      const directories = ["/", "dir", "dir/child1", "dir/child2", "dir/child1/grandChild1"];
      const project = new Project({ useInMemoryFileSystem: true });
      directories.forEach(d => project.getFileSystem().mkdirSync(d));
      expect(project.addDirectoryAtPathIfExists("dir", { recursive: true })).to.equal(project.getDirectoryOrThrow("dir"));

      testHelpers.testDirectoryTree(project.getDirectoryOrThrow("dir"), {
        directory: project.getDirectoryOrThrow("dir"),
        children: [{
          directory: project.getDirectoryOrThrow("dir/child1"),
          children: [{ directory: project.getDirectoryOrThrow("dir/child1/grandChild1") }],
        }, {
          directory: project.getDirectoryOrThrow("dir/child2"),
        }],
      }, project.getDirectoryOrThrow("/"));
    });

    it("should add the directory to the project", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "/dir/file.ts", text: "" }]);
      const project = new Project({ fileSystem });
      const dir = project.addDirectoryAtPathIfExists("/dir")!;

      expect(dir._isInProject()).to.be.true;
    });

    it("should add the directory to the project if previously not in the project", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const dir = project.createDirectory("/dir");
      project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
      expect(dir._isInProject()).to.be.false;
      project.addDirectoryAtPathIfExists("/dir");
      expect(dir._isInProject()).to.be.true;
    });
  });

  describe(nameof<Project>("addDirectoryAtPath"), () => {
    it("should throw if the directory doesn't exist", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      expect(() => {
        project.addDirectoryAtPath("someDir");
      }).to.throw(errors.DirectoryNotFoundError);
    });

    it("should add the directory if it exists", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["someDir"]);
      const project = new Project({ fileSystem });
      const dir = project.addDirectoryAtPath("someDir");
      expect(dir).to.not.be.undefined;
    });

    it("should add a directory and all its descendant directories when specifying the recursive option", () => {
      const directories = ["/", "dir", "dir/child1", "dir/child2", "dir/child1/grandChild1"];
      const project = new Project({ useInMemoryFileSystem: true });
      directories.forEach(d => project.getFileSystem().mkdirSync(d));
      expect(project.addDirectoryAtPath("dir", { recursive: true })).to.equal(project.getDirectoryOrThrow("dir"));

      testHelpers.testDirectoryTree(project.getDirectoryOrThrow("dir"), {
        directory: project.getDirectoryOrThrow("dir"),
        children: [{
          directory: project.getDirectoryOrThrow("dir/child1"),
          children: [{ directory: project.getDirectoryOrThrow("dir/child1/grandChild1") }],
        }, {
          directory: project.getDirectoryOrThrow("dir/child2"),
        }],
      }, project.getDirectoryOrThrow("/"));
    });

    it("should add the directory to the project", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "/dir/file.ts", text: "" }]);
      const project = new Project({ fileSystem });
      const dir = project.addDirectoryAtPath("/dir");

      expect(dir._isInProject()).to.be.true;
    });

    it("should add the directory to the project if previously not in the project", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const dir = project.createDirectory("/dir");
      project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
      expect(dir._isInProject()).to.be.false;
      project.addDirectoryAtPath("/dir");
      expect(dir._isInProject()).to.be.true;
    });
  });

  describe(nameof<Project>("createDirectory"), () => {
    it("should create the directory when it doesn't exist", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      const createdDir = project.createDirectory("someDir");
      expect(createdDir).to.not.be.undefined;
      expect(project.getDirectoryOrThrow("someDir")).to.equal(createdDir);
    });

    it("should create the parent directory if it doesn't exist", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      project.createSourceFile("file.txt");
      const createdDir = project.createDirectory("someDir");
      expect(createdDir).to.not.be.undefined;
      expect(project.getDirectoryOrThrow("someDir")).to.equal(createdDir);
    });

    it("should not throw when a directory already exists at the specified path", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      const createdDir = project.createDirectory("someDir");
      expect(() => project.createDirectory("someDir")).to.not.throw();
      expect(project.createDirectory("someDir")).to.equal(createdDir);
    });

    it("should not throw when a directory already exists on the file system at the specified path", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["childDir"]);
      const project = new Project({ fileSystem });
      expect(() => project.createDirectory("childDir")).to.not.throw();
    });

    it("should be added to the project", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const dir = project.createDirectory("/dir");

      expect(dir._isInProject()).to.be.true;
    });

    it("should be added to the project when creating a directory that's created, but not in the project", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const dir = project.createDirectory("/dir");
      project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
      expect(dir._isInProject()).to.be.false;
      const newDir = project.createDirectory("/dir");

      expect(dir._isInProject()).to.be.true;
      expect(newDir._isInProject()).to.be.true;
    });
  });

  describe(nameof<Project>("getDirectory"), () => {
    const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
    const project = new Project({ fileSystem });
    project.createSourceFile("dir/file.ts");

    it("should get a directory if it exists", () => {
      expect(project.getDirectory("dir")).to.not.be.undefined;
    });

    it("should not get a directory that doesn't exist", () => {
      expect(project.getDirectory("otherDir")).to.be.undefined;
    });
  });

  describe(nameof<Project>("getDirectoryOrThrow"), () => {
    const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
    const project = new Project({ fileSystem });
    project.createSourceFile("dir/file.ts");

    it("should get a directory if it exists", () => {
      expect(project.getDirectoryOrThrow("dir")).to.not.be.undefined;
    });

    it("should throw when it doesn't exist", () => {
      expect(() => project.getDirectoryOrThrow("otherDir")).to.throw();
    });
  });

  describe(nameof<Project>("getRootDirectories"), () => {
    function getProject() {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      project.createSourceFile("/dir/sub/file.ts");
      project.createSourceFile("/dir/sub/child/file.ts");
      project.createSourceFile("/dir/sub2/file2.ts");
      project.createSourceFile("/dir/sub2/child/file2.ts");
      project.createSourceFile("/dir/sub3/child/file2.ts");
      return project;
    }

    it("should get all the directories without a parent", () => {
      const project = getProject();
      expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal([
        project.getDirectoryOrThrow("/dir/sub"),
        project.getDirectoryOrThrow("/dir/sub2"),
        project.getDirectoryOrThrow("/dir/sub3/child"),
      ].map(d => d.getPath()));
    });

    it("should not add an ancestor dir when requesting it", () => {
      const project = getProject();
      project.getDirectoryOrThrow("/dir");
      expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal([
        project.getDirectoryOrThrow("/dir/sub"),
        project.getDirectoryOrThrow("/dir/sub2"),
        project.getDirectoryOrThrow("/dir/sub3/child"),
      ].map(d => d.getPath()));
    });

    it("should not add the root directory when requesting it", () => {
      const project = getProject();
      expect(project.getDirectory("/otherDir")).to.be.undefined;
      project.getDirectoryOrThrow("/");
      expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal([
        project.getDirectoryOrThrow("/dir/sub"),
        project.getDirectoryOrThrow("/dir/sub2"),
        project.getDirectoryOrThrow("/dir/sub3/child"),
      ].map(d => d.getPath()));
    });
  });

  describe(nameof<Project>("getDirectories"), () => {
    it("should get all the directories in the order based on the directory structure", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      project.createSourceFile("dir/child/file.ts");
      project.createSourceFile("dir2/child/file2.ts");
      project.createSourceFile("dir3/child/file2.ts");
      project.createSourceFile("dir/file.ts");
      project.createSourceFile("dir2/file2.ts");

      assertHasDirectories(project, [
        "/dir",
        "/dir2",
        "/dir3/child", // sorted here because it's an orphan directory
        "/dir/child",
        "/dir2/child",
      ]);
    });

    it("should not return directories not in the project", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const rootDir = project.createDirectory("/");
      const subDir = project.createDirectory("/sub");
      project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);

      assertHasDirectories(project, ["/"]);
    });

    it("should not return an ancestor directory that exists, but is not in the project", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const rootDir = project.createDirectory("/");
      project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(rootDir);
      project.createDirectory("/subDir");
      expect(rootDir._isInProject()).to.be.false;

      assertHasDirectories(project, ["/subDir"]);
    });
  });

  describe(nameof<Project>("addSourceFilesFromTsConfig"), () => {
    it("should throw if the tsconfig doesn't exist", () => {
      const fileSystem = new InMemoryFileSystemHost();
      const project = new Project({ fileSystem, skipLoadingLibFiles: true });
      expect(() => project.addSourceFilesFromTsConfig("tsconfig.json")).to.throw(errors.FileNotFoundError);
    });

    it("should add the files from tsconfig.json", () => {
      const fileSystem = new InMemoryFileSystemHost();
      // todo: why did I need a slash at the start of `/test/exclude`?
      fileSystem.writeFileSync(
        "tsconfig.json",
        `{ "compilerOptions": { "rootDir": "test", "target": "ES2015" }, "include": ["test"], "exclude": ["/test/exclude"] }`,
      );
      fileSystem.writeFileSync("/otherFile.ts", "");
      fileSystem.writeFileSync("/test/file.ts", "");
      fileSystem.writeFileSync("/test/test2/file2.ts", "");
      fileSystem.writeFileSync("/test/exclude/file.ts", "");
      fileSystem.mkdirSync("/test/emptyDir");
      const project = new Project({ fileSystem, skipLoadingLibFiles: true });
      expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal([].sort());
      expect(project.getDirectories().map(s => s.getPath()).sort()).to.deep.equal([].sort());
      const returnedFiles = project.addSourceFilesFromTsConfig("tsconfig.json");
      const expectedFiles = ["/test/file.ts", "/test/test2/file2.ts"].sort();
      const expectedDirs = ["/test", "/test/test2", "/test/emptyDir"].sort();
      expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(expectedFiles);
      expect(returnedFiles.map(s => s.getFilePath()).sort()).to.deep.equal(expectedFiles);
      expect(project.getDirectories().map(s => s.getPath()).sort()).to.deep.equal(expectedDirs);
      // uses the compiler options of the project
      expect(project.getSourceFiles().map(s => s.getLanguageVersion())).to.deep.equal([ScriptTarget.Latest, ScriptTarget.Latest]);
    });
  });

  describe(nameof<Project>("addSourceFileAtPath"), () => {
    it("should throw an exception if adding a source file at a non-existent path", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      expect(() => {
        project.addSourceFileAtPath("non-existent-file.ts");
      }).to.throw(errors.FileNotFoundError, `File not found: /non-existent-file.ts`);
    });

    it("should add a source file that exists", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
      const project = new Project({ fileSystem });
      const sourceFile = project.addSourceFileAtPath("file.ts");
      expect(sourceFile).to.not.be.undefined;
      expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.Latest);
    });
  });

  describe(nameof<Project>("addSourceFileAtPathIfExists"), () => {
    it("should return undefined if adding a source file at a non-existent path", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      expect(project.addSourceFileAtPathIfExists("non-existent-file.ts")).to.be.undefined;
    });

    it("should add a source file that exists", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
      const project = new Project({ fileSystem });
      const sourceFile = project.addSourceFileAtPathIfExists("file.ts");
      expect(sourceFile).to.not.be.undefined;
      expect(sourceFile!.getLanguageVersion()).to.equal(ScriptTarget.Latest);
    });
  });

  describe(nameof<Project>("addSourceFilesAtPaths"), () => {
    it("should add based on a string file glob", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const fs = project.getFileSystem();
      fs.writeFileSync("file1.ts", "");
      fs.writeFileSync("dir/file.ts", "");
      fs.writeFileSync("dir/subDir/file.ts", "");
      const result = project.addSourceFilesAtPaths("/dir/**/*.ts");
      const sourceFiles = project.getSourceFiles();
      expect(sourceFiles.length).to.equal(2);
      expect(result).to.deep.equal(sourceFiles);
      expect(sourceFiles[0].getFilePath()).to.equal("/dir/file.ts");
      expect(sourceFiles[0].getLanguageVersion()).to.equal(ScriptTarget.Latest);
      expect(sourceFiles[0].isSaved()).to.be.true; // should be saved because it was read from the disk
      expect(sourceFiles[1].getFilePath()).to.equal("/dir/subDir/file.ts");
    });

    it("should add based on multiple file globs", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const fs = project.getFileSystem();
      fs.writeFileSync("file1.ts", "");
      fs.writeFileSync("dir/file.ts", "");
      fs.writeFileSync("dir/file.d.ts", "");
      fs.writeFileSync("dir/subDir/file.ts", "");
      const result = project.addSourceFilesAtPaths(["/dir/**/*.ts", "!/dir/**/*.d.ts"]);
      const sourceFiles = project.getSourceFiles();
      expect(sourceFiles.length).to.equal(2);
      expect(result).to.deep.equal(sourceFiles);
      expect(sourceFiles[0].getFilePath()).to.equal("/dir/file.ts");
      expect(sourceFiles[0].getLanguageVersion()).to.equal(ScriptTarget.Latest);
      expect(sourceFiles[1].getFilePath()).to.equal("/dir/subDir/file.ts");
    });

    it("should add the directory's descendant directories specified in the glob and ignore negated globs", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const fs = project.getFileSystem();
      ["/dir", "/dir2", "/dir/child", "/dir/child/grandChild", "/dir3"].forEach(d => {
        fs.mkdirSync(d);
        fs.writeFileSync(d + "/test.ts", "");
      });
      const result = project.addSourceFilesAtPaths(["/dir/**/*.ts", "!/dir2", "/dir3/**/*.ts"]);
      testHelpers.testDirectoryTree(project.getDirectoryOrThrow("/dir"), {
        directory: project.getDirectoryOrThrow("/dir"),
        sourceFiles: [project.getSourceFileOrThrow("/dir/test.ts")],
        children: [{
          directory: project.getDirectoryOrThrow("/dir/child"),
          sourceFiles: [project.getSourceFileOrThrow("/dir/child/test.ts")],
          children: [{
            directory: project.getDirectoryOrThrow("/dir/child/grandChild"),
            sourceFiles: [project.getSourceFileOrThrow("/dir/child/grandChild/test.ts")],
          }],
        }],
      });
      testHelpers.testDirectoryTree(project.getDirectoryOrThrow("/dir3"), {
        directory: project.getDirectoryOrThrow("/dir3"),
        sourceFiles: [project.getSourceFileOrThrow("/dir3/test.ts")],
      });
    });

    it("should add the directory's descendant directories specified in the glob", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const fs = project.getFileSystem();
      ["/dir", "/dir/node_modules", "/dir/child", "/dir/child/grandChild"].forEach(d => {
        fs.mkdirSync(d);
        fs.writeFileSync(d + "/test.ts", "");
      });
      project.addSourceFilesAtPaths("/dir/*/grandChild/*.ts");
      expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal(["/dir/child/grandChild"]);
    });
  });

  describe(nameof<Project>("createSourceFile"), () => {
    it("should throw an exception if creating a source file at an existing path", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("file.ts", "");
      expect(() => {
        project.createSourceFile("file.ts", "");
      }).to.throw(
        errors.InvalidOperationError,
        `Did you mean to provide the overwrite option? A source file already exists at the provided file path: /file.ts`,
      );
    });

    it("should not throw an exception if creating a source file at an existing path when providing the overwrite option", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const file1 = project.createSourceFile("file.ts", "");
      const newFileText = "class Identifier {}";
      const file2 = project.createSourceFile("file.ts", newFileText, { overwrite: true });
      expect(file1.getFullText()).to.equal(newFileText);
      expect(file2.getFullText()).to.equal(newFileText);
      expect(file1).to.equal(file2);
    });

    it("should throw an exception if creating a source file at an existing path on the disk", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
      const project = new Project({ fileSystem });
      expect(() => project.createSourceFile("file.ts", "")).to.throw(errors.InvalidOperationError);
    });

    it("should mark the source file as having not been saved", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      expect(project.createSourceFile("file.ts", "").isSaved()).to.be.false;
    });

    it("should create a source file with the default target", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      expect(project.createSourceFile("file.ts", "").getLanguageVersion()).to.equal(ScriptTarget.Latest);
    });

    it("should create a source file with the compiler options' target", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.compilerOptions.set({ target: ScriptTarget.ES2015 });
      expect(project.createSourceFile("file.ts", "").getLanguageVersion()).to.equal(ScriptTarget.ES2015);
    });

    it("should add a source file based on a writer function", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile("test.ts", writer => writer.writeLine("enum MyEnum {}"));
      expect(sourceFile.getFullText()).to.equal("enum MyEnum {}\n");
    });

    it("should add a source file based on a structure", () => {
      // basic test
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile("MyFile.ts", {
        statements: [{
          kind: StructureKind.Enum,
          name: "MyEnum",
        }],
      });
      expect(sourceFile.getFullText()).to.equal(`enum MyEnum {\n}\n`);
    });

    it("should add for everything in the structure", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<SourceFileStructure>> = {
        statements: ["console.log('here');"],
      };
      const sourceFile = new Project({ useInMemoryFileSystem: true }).createSourceFile("MyFile.ts", structure);
      const expectedText = "console.log('here');\n";
      expect(sourceFile.getFullText()).to.equal(expectedText);
    });

    it("should be able to specify a script kind", () => {
      const sourceFile = new Project({ useInMemoryFileSystem: true }).createSourceFile("MyFile.json", "{}", { scriptKind: ScriptKind.JSON });
      expect(sourceFile.getScriptKind()).to.equal(ScriptKind.JSON);

      // should work after manipulation
      sourceFile.replaceWithText("5");
      expect(sourceFile.getScriptKind()).to.equal(ScriptKind.JSON);
    });

    it("", () => {
      // todo: remove
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile("MyFile.ts", "enum MyEnum {\n    myMember\n}\nlet myEnum: MyEnum;\nlet myOtherEnum: MyNewEnum;");
      const enumDef = sourceFile.getEnums()[0];
      enumDef.rename("NewName");
      const addedEnum = sourceFile.addEnum({
        name: "MyNewEnum",
      });
      addedEnum.rename("MyOtherNewName");
      const enumMember = enumDef.getMembers()[0];
      enumMember.rename("myNewMemberName");
      expect(enumMember.getValue()).to.equal(0);
      expect(sourceFile.getFullText())
        .to.equal("enum NewName {\n    myNewMemberName\n}\nlet myEnum: NewName;\nlet myOtherEnum: MyOtherNewName;\n\nenum MyOtherNewName {\n}\n");
    });

    // Parsing a file makes the compiler reopen its project, and a reopen costs time
    // proportional to how many files the project already holds — so a create that
    // parsed as it went would make this loop quadratic in the number of files, which
    // it was. A project eight times the size should cost about eight times as much,
    // no more.
    //
    // Per file the bigger project is the *cheaper* of the two, because the fixed
    // cost of standing a project up is spread over more files: the ratio measured
    // here is 0.24, steady to ±0.01 across runs, so the threshold leaves a loaded
    // machine six times the room it needs. The quadratic behaviour this replaced put
    // the ratio at 5.3.
    it("should cost about the same per file however many files the project holds", function() {
      this.timeout(90_000); // enough that a regression is reported rather than timing out
      createFiles(50); // the first project pays for warming the compiler up

      const small = createFiles(200);
      const large = createFiles(1600);
      expect(large).to.be.lessThan(small * 1.5);

      function createFiles(count: number) {
        const project = new Project({ useInMemoryFileSystem: true });
        const start = performance.now();
        const sourceFiles: SourceFile[] = [];
        for (let i = 0; i < count; i++)
          sourceFiles.push(project.createSourceFile(`/file${i}.ts`, `export const value${i} = ${i};`));
        // reading the files back is what opens the project, so what that costs
        // belongs in the measurement
        let declarationCount = 0;
        for (const sourceFile of sourceFiles)
          declarationCount += sourceFile.getVariableDeclarations().length;
        const perFile = (performance.now() - start) / count;
        expect(declarationCount).to.equal(count);
        return perFile;
      }
    });

    // Editing a file reopens the project too, and what the reopen costs used to grow
    // with how many files the project held: the compiler counted a reference on every
    // file in the new program and released one on every file in the old, once each per
    // edit, and described every project's whole root file list back to the client
    // along with it. None of that is about the file being edited, and none of it is
    // done per file any more.
    //
    // A project eight times the size costs an edit 1.45 to 2.2 times as much across
    // runs — what is left is mostly the reopen's own fixed cost — so the threshold
    // leaves some room over the worst of that. It is a guard against a return to
    // counting per file, which would put the ratio near 8, and not a guard against
    // the smaller regression it was written alongside: the behaviour this replaced
    // measured 1.9 to 2.0 and would still pass.
    it("should cost about the same to edit a file however many files the project holds", function() {
      this.timeout(120_000); // enough that a regression is reported rather than timing out
      editFiles(50, 10); // the first project pays for warming the compiler up

      const small = editFiles(200, 100);
      const large = editFiles(1600, 100);
      expect(large).to.be.lessThan(small * 3);

      function editFiles(count: number, edits: number) {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFiles: SourceFile[] = [];
        for (let i = 0; i < count; i++)
          sourceFiles.push(project.createSourceFile(`/file${i}.ts`, `export const value${i} = ${i};`));
        project.getSourceFiles(); // opens the project, so only the edits are measured
        const start = performance.now();
        for (let i = 0; i < edits; i++)
          sourceFiles[i % count].addClass({ name: `Class${i}` });
        const perEdit = (performance.now() - start) / edits;
        expect(sourceFiles[0].getClasses().length).to.be.greaterThan(0);
        return perEdit;
      }
    });

    // The commonest codegen loop: create a file, then manipulate it before creating
    // the next. Reading the new file's tree is what forces the project open, so the
    // deferral the create-only loop above relies on has nothing to collect here and
    // every file costs a reopen.
    //
    // A reopen is still proportional to the project — adding a root rebuilds the
    // program, which is the ceiling documented in tsgo-wasm/TODO.md §3.4 — so this
    // does not claim a constant cost per file, and it is not a regression test for
    // anything that has been fixed. It is a tripwire for the loop going fully
    // quadratic, which would put the ratio below at 4: four times the files measures
    // 1.2 to 1.5 times the cost per file across runs, on an idle machine and a loaded
    // one alike, and measured 1.6 before the snapshot costs were cut.
    it("should not cost four times as much per file for four times the files when each is manipulated as it is created", function() {
      this.timeout(120_000);
      createAndManipulate(50); // the first project pays for warming the compiler up

      const small = createAndManipulate(100);
      const large = createAndManipulate(400);
      expect(large).to.be.lessThan(small * 2.5);

      function createAndManipulate(count: number) {
        const project = new Project({ useInMemoryFileSystem: true });
        const start = performance.now();
        for (let i = 0; i < count; i++) {
          const sourceFile = project.createSourceFile(`/file${i}.ts`, `export const value${i} = ${i};`);
          sourceFile.addClass({ name: `Class${i}` });
        }
        const perFile = (performance.now() - start) / count;
        expect(project.getSourceFiles().length).to.equal(count);
        return perFile;
      }
    });
  });

  describe("mixing real files with in-memory files", () => {
    function createProject() {
      // @ts-ignore
      const testFilesDirPath = path.join(import.meta.dirname, "../../src/tests/testFiles");
      const project = new Project();
      project.addSourceFilesAtPaths(`${testFilesDirPath}/**/*.ts`);
      project.createSourceFile(
        path.join(testFilesDirPath, "variableTestFile.ts"),
        `import * as testClasses from "./testClasses";\n\nlet myVar = new testClasses.TestClass().name;\n`,
      );
      return project;
    }

    it("should have 4 source files", () => {
      const project = createProject();
      expect(project.getSourceFiles().length).to.equal(4);
    });

    it("should rename a name appropriately", () => {
      const project = createProject();
      const interfaceFile = project.getSourceFileOrThrow("testInterfaces.ts");
      interfaceFile.getInterfaces()[0].getProperties()[0].rename("newName");
      const variableFile = project.getSourceFileOrThrow("variableTestFile.ts");
      expect(variableFile.getFullText()).to.equal(`import * as testClasses from "./testClasses";\n\nlet myVar = new testClasses.TestClass().newName;\n`);
    });
  });

  describe(nameof<Project>("removeSourceFile"), () => {
    it("should remove the source file", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile("myFile.ts", ``);
      expect(project.removeSourceFile(sourceFile)).to.equal(true);
      expect(project.removeSourceFile(sourceFile)).to.equal(false);
      expect(project.getSourceFiles().length).to.equal(0);
      expect(() => sourceFile.getChildCount()).to.throw(); // should be forgotten
    });
  });

  describe(nameof<Project>("save"), () => {
    it("should save all the unsaved source files asynchronously", async () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      project.createSourceFile("file1.ts", "").saveSync();
      project.createSourceFile("file2.ts", "");
      project.createSourceFile("file3.ts", "");
      await project.save();
      expect(project.getSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
      expect(fileSystem.getWriteLog().length).to.equal(3);
    });

    it("should delete any deleted source files & directories and save unsaved source files", async () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      const sourceFileToDelete = project.createDirectory("dir").createSourceFile("file.ts");
      sourceFileToDelete.saveSync();
      sourceFileToDelete.delete();
      const dirToDelete = project.createDirectory("dir2");
      dirToDelete.createSourceFile("file.ts");
      dirToDelete.saveSync();
      dirToDelete.delete();
      let sourceFileToUndelete = project.createSourceFile("file.ts");
      sourceFileToUndelete.saveSync();
      sourceFileToUndelete.delete();
      sourceFileToUndelete = project.createSourceFile("file.ts");

      await project.save();
      expect(fileSystem.getFiles().map(f => f[0])).to.deep.equal(["/file.ts"]);
      expect(fileSystem.getCreatedDirectories().sort()).to.deep.equal(["/dir"].sort());
    });
  });

  describe(nameof<Project>("saveSync"), () => {
    it("should save all the unsaved source files synchronously", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
      const project = new Project({ fileSystem });
      project.createSourceFile("file1.ts", "").saveSync();
      project.createSourceFile("file2.ts", "");
      project.createSourceFile("file3.ts", "");
      project.saveSync();

      expect(project.getSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
      expect(fileSystem.getWriteLog().length).to.equal(3);
    });
  });

  function emitSetup(compilerOptions: CompilerOptions) {
    const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
    const project = new Project({ compilerOptions, fileSystem });
    project.createSourceFile("file1.ts", "const num1 = 1;");
    project.createSourceFile("file2.ts", "const num2 = 2;");
    return { fileSystem, project };
  }

  describe(nameof<Project>("emit"), () => {
    it("should emit multiple files when not specifying any options", async () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
      const result = await project.emit();
      expect(result).to.be.instanceof(EmitResult);

      const writeLog = fileSystem.getWriteLog();
      expect(writeLog[0].filePath).to.equal("/dist/file1.js");
      expect(writeLog[0].fileText).to.equal("\"use strict\";\nconst num1 = 1;\n");
      expect(writeLog[1].filePath).to.equal("/dist/file2.js");
      expect(writeLog[1].fileText).to.equal("\"use strict\";\nconst num2 = 2;\n");
      expect(writeLog.length).to.equal(2);
    });

    it("should emit the source file when specified", async () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
      await project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });

      const writeLog = fileSystem.getWriteLog();
      expect(writeLog[0].filePath).to.equal("/dist/file1.js");
      expect(writeLog[0].fileText).to.equal("\"use strict\";\nconst num1 = 1;\n");
      expect(writeLog.length).to.equal(1);
    });

    it("should emit with bom if specified", async () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", emitBOM: true });
      await project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });
      expect(fileSystem.getWriteLog()[0].fileText).to.equal("\uFEFF\"use strict\";\nconst num1 = 1;\n");
    });

    it("should only emit the declaration file when specified", async () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", declaration: true });
      await project.emit({ emitOnlyDtsFiles: true });

      const writeLog = fileSystem.getWriteLog();
      expect(writeLog[0].filePath).to.equal("/dist/file1.d.ts");
      expect(writeLog[0].fileText).to.equal("declare const num1 = 1;\n");
      expect(writeLog[1].filePath).to.equal("/dist/file2.d.ts");
      expect(writeLog[1].fileText).to.equal("declare const num2 = 2;\n");
      expect(writeLog.length).to.equal(2);
    });

    // tsgo's per-file emit is a forced one, so a targeted emit has to answer
    // noEmit and noEmitOnError itself; these check it answers them the same way
    // a whole-project emit does.
    it("should not emit the specified source file when noEmit is on", async () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", noEmit: true });
      const result = await project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });
      expect(result.getEmitSkipped()).to.be.true;
      expect(fileSystem.getWriteLog().length).to.equal(0);
    });

    it("should not emit the specified source file when noEmitOnError is on and it has an error", async () => {
      // no noLib here: without the lib files every file has global-type errors
      const { project, fileSystem } = emitSetup({ outDir: "dist", noEmitOnError: true });
      project.createSourceFile("file3.ts", "const num3: number = '';");
      const result = await project.emit({ targetSourceFile: project.getSourceFile("file3.ts") });
      expect(result.getEmitSkipped()).to.be.true;
      expect(result.getDiagnostics().map(d => d.getCode())).to.deep.equal([2322]);
      expect(fileSystem.getWriteLog().length).to.equal(0);
    });

    it("should emit the specified source file when noEmitOnError is on and it has no error", async () => {
      const { project, fileSystem } = emitSetup({ outDir: "dist", noEmitOnError: true });
      const result = await project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });
      expect(result.getEmitSkipped()).to.be.false;
      expect(fileSystem.getWriteLog().map(l => l.filePath)).to.deep.equal(["/dist/file1.js"]);
    });

    it("should only emit the declaration file for the specified source file when emitDeclarationOnly is on", async () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", declaration: true, emitDeclarationOnly: true });
      const result = await project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });
      expect(result.getEmitSkipped()).to.be.false;

      const writeLog = fileSystem.getWriteLog();
      expect(writeLog.map(l => l.filePath)).to.deep.equal(["/dist/file1.d.ts"]);
      expect(writeLog[0].fileText).to.equal("declare const num1 = 1;\n");
    });

    it("should not emit the specified source file when emitDeclarationOnly is on and no declarations are emitted", async () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", emitDeclarationOnly: true });
      const result = await project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });
      expect(result.getEmitSkipped()).to.be.true;
      expect(fileSystem.getWriteLog().length).to.equal(0);
    });

    // custom transformers are gone: tsgo emits in Go, and a JavaScript transform
    // cannot take part in that pipeline. See the note on EmitOptionsBase.
  });

  describe(nameof<Project>("emitSync"), () => {
    it("should emit synchronously", () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
      const result = project.emitSync();
      expect(result).to.be.instanceof(EmitResult);

      const writeLog = fileSystem.getWriteLog();
      expect(writeLog[0].filePath).to.equal("/dist/file1.js");
      expect(writeLog[0].fileText).to.equal("\"use strict\";\nconst num1 = 1;\n");
      expect(writeLog[1].filePath).to.equal("/dist/file2.js");
      expect(writeLog[1].fileText).to.equal("\"use strict\";\nconst num2 = 2;\n");
      expect(writeLog.length).to.equal(2);
    });

    it("should emit with bom if specified", () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", emitBOM: true });
      project.emitSync({ targetSourceFile: project.getSourceFile("file1.ts") });
      expect(fileSystem.getWriteLog()[0].fileText).to.equal("\uFEFF\"use strict\";\nconst num1 = 1;\n");
    });
  });

  describe(nameof<Project>("emitToMemory"), () => {
    it("should emit multiple files to memory", () => {
      const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
      const result = project.emitToMemory();
      expect(result).to.be.instanceof(MemoryEmitResult);

      const writeLog = fileSystem.getWriteLog();
      expect(writeLog.length).to.equal(0);

      const files = result.getFiles();
      expect(files[0].filePath).to.equal("/dist/file1.js");
      expect(files[0].text).to.equal("\"use strict\";\nconst num1 = 1;\n");
      expect(files[1].filePath).to.equal("/dist/file2.js");
      expect(files[1].text).to.equal("\"use strict\";\nconst num2 = 2;\n");
      expect(files.length).to.equal(2);
    });
  });

  describe(nameof<Project>("getSourceFile"), () => {
    it("should get the first match based on the directory structure", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("dir/file.ts");
      const expectedFile = project.createSourceFile("file.ts");
      expect(project.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
    });

    it("should get the first match based on the directory structure when specifying a dot slash", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("dir/file.ts");
      const expectedFile = project.createSourceFile("file.ts");
      expect(project.getSourceFile("./file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
    });

    it("should get the first match based on the directory structure when using ../", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const expectedFile = project.createSourceFile("dir/file.ts");
      project.createSourceFile("file.ts");
      expect(project.getSourceFile("dir/../dir/file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
    });

    it("should get the first match based on a file name", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("file.ts");
      const expectedFile = project.createSourceFile("dir/file2.ts");
      expect(project.getSourceFile("file2.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
    });

    it("should get when specifying an absolute path", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("dir/file.ts");
      const expectedFile = project.createSourceFile("file.ts");
      expect(project.getSourceFile("/file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
    });

    it("should get the first match based on the directory structure when swapping the order of what was created first", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const expectedFile = project.createSourceFile("file.ts");
      project.createSourceFile("dir/file.ts");
      expect(project.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
    });
  });

  describe(nameof<Project>("getSourceFileOrThrow"), () => {
    it("should throw when it can't find the source file based on a provided file name", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      expect(() => project.getSourceFileOrThrow("fileName.ts")).to.throw(
        "Could not find source file in project with the provided file name: fileName.ts",
      );
    });

    it("should throw when it can't find the source file based on a provided relative path", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      // this should show the absolute path in the error message
      expect(() => project.getSourceFileOrThrow("src/fileName.ts")).to.throw(
        "Could not find source file in project at the provided path: /src/fileName.ts",
      );
    });

    it("should throw when it can't find the source file based on a provided absolute path", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      expect(() => project.getSourceFileOrThrow("/fileName.ts")).to.throw(
        "Could not find source file in project at the provided path: /fileName.ts",
      );
    });

    it("should throw when it can't find the source file based on a provided condition", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      expect(() => project.getSourceFileOrThrow(() => false)).to.throw(
        "Could not find source file in project based on the provided condition.",
      );
    });

    it("should not throw when it finds the file", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("myFile.ts", "");
      expect(project.getSourceFileOrThrow("myFile.ts").getFilePath()).to.contain("myFile.ts");
    });
  });

  describe(nameof<Project>("getSourceFiles"), () => {
    it("should get all the source files added to the project sorted by directory structure", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("dir/child/file.ts");
      project.createSourceFile("dir/file.ts");
      project.createSourceFile("file1.ts");
      project.createSourceFile("File1.ts");
      project.createSourceFile("file2.ts");
      expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([
        "/File1.ts", // uppercase first
        "/file1.ts",
        "/file2.ts",
        "/dir/file.ts",
        "/dir/child/file.ts",
      ]);
    });

    describe("globbing", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("file.ts", "");
      project.createSourceFile("src/file.ts", "");
      project.createSourceFile("src/test/file1.ts", "");
      project.createSourceFile("src/test/file1.d.ts", "");
      project.createSourceFile("src/test/file2.ts", "");
      project.createSourceFile("src/test/file3.ts", "");
      project.createSourceFile("src/test/file3.js", "");
      project.createSourceFile("src/test/folder/file.ts", "");

      it("should be able to do a file glob", () => {
        expect(project.getSourceFiles("**/test/**/*.ts").map(s => s.getFilePath())).to.deep.equal([
          "/src/test/file1.d.ts",
          "/src/test/file1.ts",
          "/src/test/file2.ts",
          "/src/test/file3.ts",
          "/src/test/folder/file.ts",
        ]);
      });

      it("should be able to do a file glob with a relative path", () => {
        expect(project.getSourceFiles("src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
          "/src/test/folder/file.ts",
        ]);
      });

      it("should be able to do a file glob with a relative path with a dot", () => {
        expect(project.getSourceFiles("./src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
          "/src/test/folder/file.ts",
        ]);
      });

      it("should be able to do a file glob with an absolute path", () => {
        expect(project.getSourceFiles("/src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
          "/src/test/folder/file.ts",
        ]);
      });

      it("should be able to do a file glob with multiple patterns", () => {
        expect(project.getSourceFiles(["**/src/**/*.ts", "!**/src/test/**/*.ts", "!**/*.d.ts"]).map(s => s.getFilePath())).to.deep.equal([
          "/src/file.ts",
        ]);
      });
    });

    it("should not return files not in the project", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const subDirFile = project.createSourceFile("/dir/other.ts");
      project.createSourceFile("main.ts");
      project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDirFile.getDirectory());
      assertHasSourceFiles(project, ["/main.ts"]);
    });
  });

  describe(nameof<Project>("forgetNodesCreatedInBlock"), () => {
    it("should work for a synchronous block", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      let sourceFile: SourceFile;
      let sourceFileNotNavigated: SourceFile;
      let classNode: Node;
      let namespaceNode: ModuleDeclaration;
      let namespaceKeywordNode: Node;
      let interfaceNode1: Node;
      let interfaceNode2: Node;
      let interfaceNode3: Node;
      let interfaceNode4: Node;
      let interfaceNode5: Node;
      const returnedNode = project.forgetNodesCreatedInBlock(remember => {
        sourceFile = project.createSourceFile(
          "test.ts",
          "class MyClass {} namespace MyNamespace { interface Interface1 {} interface Interface2 {} "
            + "interface Interface3 {} interface Interface4 {} }",
        );
        sourceFileNotNavigated = project.createSourceFile("test2.ts", "class MyClass {}");
        classNode = sourceFile.getClassOrThrow("MyClass");
        namespaceNode = sourceFile.getModuleOrThrow("MyNamespace");

        project.forgetNodesCreatedInBlock(remember2 => {
          interfaceNode2 = namespaceNode.getInterfaceOrThrow("Interface2");
          interfaceNode3 = namespaceNode.getInterfaceOrThrow("Interface3");
          interfaceNode4 = namespaceNode.getInterfaceOrThrow("Interface4");
          interfaceNode5 = namespaceNode.addInterface({ name: "Interface5" });
          remember2(interfaceNode3, interfaceNode4);
        });

        namespaceKeywordNode = namespaceNode.getFirstChildByKindOrThrow(SyntaxKind.NamespaceKeyword);
        interfaceNode1 = namespaceNode.getInterfaceOrThrow("Interface1");
        remember(interfaceNode1);

        return namespaceNode.addInterface({ name: "Interface6" });
      });

      expect(sourceFile!.wasForgotten()).to.be.false;
      expect(sourceFileNotNavigated!.wasForgotten()).to.be.false;
      expect(classNode!.wasForgotten()).to.be.true;
      expect(namespaceNode!.wasForgotten()).to.be.false;
      expect(namespaceKeywordNode!.wasForgotten()).to.be.true;
      expect(interfaceNode1!.wasForgotten()).to.be.false;
      expect(interfaceNode2!.wasForgotten()).to.be.true;
      expect(interfaceNode3!.wasForgotten()).to.be.false;
      expect(interfaceNode4!.wasForgotten()).to.be.false;
      expect(interfaceNode5!.wasForgotten()).to.be.true;
      expect(returnedNode.wasForgotten()).to.be.false;

      const newSourceFile = project.createSourceFile("file3.ts", "class MyClass {}");
      project.forgetNodesCreatedInBlock(() => {
        const classDec = newSourceFile.getClassOrThrow("MyClass");
        classDec.remove();
      });

      const newSourceFile2 = project.createSourceFile("file4.ts");
      project.forgetNodesCreatedInBlock(remember => {
        const classDec = newSourceFile2.addClass({ name: "Class" });
        classDec.forget();
        expect(() => remember(classDec)).to.throw(errors.InvalidOperationError);
      });

      expect(() =>
        project.forgetNodesCreatedInBlock(() => {
          throw new Error("");
        })
      ).to.throw();
      const result = project.forgetNodesCreatedInBlock(() => 5);
      assert<IsExact<typeof result, number>>(true);
      expect(result).to.equal(5);
    });

    describe("asynchronous", () => {
      it("should have forgotten the class or interface", async () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("file.ts");
        let interfaceDec: InterfaceDeclaration;
        let classDec: ClassDeclaration;
        const returnedNode = await project.forgetNodesCreatedInBlock(async remember => {
          // do something to cause this code to be added to the end of the execution queue
          await new Promise<void>((resolve, reject) => resolve());

          classDec = sourceFile.addClass({ name: "Class" });
          interfaceDec = sourceFile.addInterface({ name: "Interface" });
          remember(interfaceDec);
          return sourceFile.addInterface({ name: "ReturnedInterface" });
        });

        expect(classDec!.wasForgotten()).to.be.true;
        expect(interfaceDec!.wasForgotten()).to.be.false;
        expect(returnedNode.wasForgotten()).to.be.false;
      });

      it("should get the return value", async () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const resultPromise = project.forgetNodesCreatedInBlock(() => Promise.resolve(5));
        assert<IsExact<typeof resultPromise, Promise<number>>>(true);
        const result = await resultPromise;
        expect(result).to.equal(5);
      });
    });
  });

  describe(nameof<Project>("compilerOptions"), () => {
    it("should reparse after modifying the compiler options", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile("myFile.ts", `function myFunction(param: string) {}`);
      expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.Latest);
      project.compilerOptions.set({ target: ScriptTarget.ES2015 });
      expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.ES2015);
    });

    // `lib` is typed as the library file names, which is the form the
    // `typescript` package produced; a tsconfig's `lib` is short names
    it("should accept a lib given as library file names", () => {
      function setup(lib: string[]) {
        const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { lib, target: ScriptTarget.Latest } });
        project.createSourceFile("/a.ts", "const p = Promise.resolve(1);");
        return project.getPreEmitDiagnostics().map(d => d.getCode());
      }

      expect(setup(["lib.es2015.d.ts"])).to.deep.equal([]);
      // and the list is honoured rather than every library being loaded anyway:
      // 2585, `Promise` needs a lib of es2015 or later
      expect(setup(["lib.es5.d.ts"])).to.deep.equal([2585]);
      // the short name a tsconfig would use goes through untouched, and means the same
      expect(setup(["es2015"])).to.deep.equal([]);
      expect(setup(["es5"])).to.deep.equal([2585]);
    });

    it("should reject a lib that names no library", () => {
      const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { lib: ["lib.not-a-lib.d.ts"], target: ScriptTarget.Latest } });
      project.createSourceFile("/a.ts", "const a = 1;");
      // 6046: the argument for --lib must be one of the known libraries
      expect(project.getPreEmitDiagnostics().map(d => d.getCode())).to.contain(6046);
    });
  });

  describe("ambient modules", () => {
    function getProject() {
      const project = new Project({ useInMemoryFileSystem: true });
      const fileSystem = project.getFileSystem();

      fileSystem.writeFileSync(
        "/node_modules/@types/jquery/index.d.ts",
        `
    declare module 'jquery' {
        export = jQuery;
    }
    declare const jQuery: JQueryStatic;
    interface JQueryStatic {
        test: string;
    }`,
      );
      fileSystem.writeFileSync(
        "/node_modules/@types/jquery/package.json",
        `{ "name": "@types/jquery", "version": "1.0.0", "typeScriptVersion": "2.3" }`,
      );

      project.createSourceFile("test.ts", "import * as ts from 'jquery';");
      return project;
    }

    describe(nameof<Project>("getAmbientModules"), () => {
      it("should get when exist", () => {
        const project = getProject();
        expect(project.getAmbientModules().map(m => m.getName())).to.deep.equal([`"jquery"`]);
      });

      it("should get when doesn't exist", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        expect(project.getAmbientModules().length).to.equal(0);
      });
    });

    describe(nameof<Project>("getAmbientModule"), () => {
      function doTest(moduleName: string, expectedName: string | undefined) {
        const project = getProject();
        const ambientModule = project.getAmbientModule(moduleName);
        expect(ambientModule?.getName()).to.equal(expectedName);
      }

      it("should find when using single quotes", () => doTest(`'jquery'`, `"jquery"`));
      it("should find when using double quotes", () => doTest(`"jquery"`, `"jquery"`));
      it("should find when using no quotes", () => doTest("jquery", `"jquery"`));
      it("should not find when does not exist", () => doTest("other-module", undefined));
    });

    describe(nameof<Project>("getAmbientModuleOrThrow"), () => {
      function doTest(moduleName: string, expectedName: string | undefined) {
        const project = getProject();

        if (expectedName != null)
          expect(project.getAmbientModuleOrThrow(moduleName).getName()).to.equal(expectedName);
        else
          expect(() => project.getAmbientModuleOrThrow(moduleName)).to.throw();
      }

      it("should find when using single quotes", () => doTest(`'jquery'`, `"jquery"`));
      it("should find when using double quotes", () => doTest(`"jquery"`, `"jquery"`));
      it("should find when using no quotes", () => doTest("jquery", `"jquery"`));
      it("should not find when does not exist", () => doTest("other-module", undefined));
    });
  });

  describe("manipulating then getting something from the type checker", () => {
    it("should not error after manipulation", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile("myFile.ts", `function myFunction(param: string) {}`);
      const param = sourceFile.getFunctions()[0].getParameters()[0];
      expect(param.getType().getText()).to.equal("string");
      param.setType("number");
      expect(param.getType().getText()).to.equal("number");
    });
  });

  describe(nameof<Project>("getPreEmitDiagnostics"), () => {
    // tsgo reports an options diagnostic from both its program and its global
    // category, so the categories have to be deduplicated the way the
    // `typescript` package deduplicated them
    it("should report an options diagnostic once", () => {
      const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { allowJs: true } });
      project.createSourceFile("/a.js", "var x = 1;");
      // 5055: cannot write file because it would overwrite an input file
      expect(project.getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([5055]);
    });

    // the compiler is only opened on the document registry's own config, so a
    // complaint about the caller's tsconfig is not in any of its categories
    it("should report a diagnostic from the caller's own tsconfig", () => {
      const fileSystem = testHelpers.getFileSystemHostWithFiles([
        { filePath: "/tsconfig.json", text: `{ "compilerOptions": { "notARealOption": true } }` },
        { filePath: "/a.ts", text: "export const a = 1;\n" },
      ]);
      const project = new Project({ tsConfigFilePath: "/tsconfig.json", fileSystem });
      // 5023: unknown compiler option
      expect(project.getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([5023]);
      expect(project.getSourceFileOrThrow("/a.ts").getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([5023]);
    });

    it("should keep the message chain of a deduplicated diagnostic", () => {
      const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { outDir: "/dist", rootDir: "/nope" } });
      project.createSourceFile("/a.ts", "var x = 1;");
      const diagnostics = project.getPreEmitDiagnostics();
      // 6059: the file is not under the rootDir
      expect(diagnostics.map(d => d.getCode())).to.deep.equal([6059]);
      // 1430: the elaboration naming the rootDir the compiler inferred instead
      expect(diagnostics[0].getMessageChain()?.map(m => m.getCode())).to.deep.equal([1430]);
    });

    // ts-morph writes the config the compiler opens its project from, so the
    // project having no source files is not something to report to the caller
    it("should not report the synthetic config's file list being empty", () => {
      expect(new Project({ useInMemoryFileSystem: true }).getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([]);
    });

    it("should not report an empty file list after the last file is removed", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.removeSourceFile(project.createSourceFile("/a.ts", "var x = 1;"));
      expect(project.getPreEmitDiagnostics().map(d => d.getCode())).to.deep.equal([]);
    });
  });

  describe(nameof<Project>("formatDiagnosticsWithColorAndContext"), () => {
    function setup() {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile("test.ts", "const t; const u;");
      return project;
    }

    function testForLineFeed(text: string) {
      expect(text.indexOf("\r\n")).to.equal(-1);
    }

    function testForCarriageReturnLineFeed(text: string) {
      expect(text.split("\n").slice(0, -1).every(line => line[line.length - 1] === "\r")).to.be.true;
    }

    it("should get the text formatted based on the OS", () => {
      const project = setup();
      const text = project.formatDiagnosticsWithColorAndContext(project.getPreEmitDiagnostics());
      if (EOL === "\n")
        testForLineFeed(text);
      if (EOL === "\r\n")
        testForCarriageReturnLineFeed(text);
    });

    it("should use line feeds when passed in", () => {
      const project = setup();
      const text = project.formatDiagnosticsWithColorAndContext(project.getPreEmitDiagnostics(), { newLineChar: "\n" });
      testForLineFeed(text);
    });

    it("should use carriage return line feeds when passed in", () => {
      const project = setup();
      const text = project.formatDiagnosticsWithColorAndContext(project.getPreEmitDiagnostics(), { newLineChar: "\r\n" });
      testForCarriageReturnLineFeed(text);
    });
  });

  describe(nameof<Project>("getModuleResolutionHost"), () => {
    function setup() {
      const project = new Project({ useInMemoryFileSystem: true });
      const moduleResolutionHost = project.getModuleResolutionHost();
      return {
        project,
        fileSystem: project.getFileSystem(),
        moduleResolutionHost,
      };
    }

    it("should get if a directory exists on the file system", () => {
      const { moduleResolutionHost, fileSystem } = setup();
      fileSystem.mkdirSync("/dir");
      expect(moduleResolutionHost.directoryExists!("/dir")).to.be.true;
      expect(moduleResolutionHost.directoryExists!("/dir2")).to.be.false;
    });

    it("should get if a directory exists in the project", () => {
      const { moduleResolutionHost, project } = setup();
      project.createDirectory("/dir");
      expect(moduleResolutionHost.directoryExists!("/dir")).to.be.true;
    });

    it("should get if a file exists on the file system", () => {
      const { moduleResolutionHost, fileSystem } = setup();
      fileSystem.writeFileSync("/file.ts", "");
      expect(moduleResolutionHost.fileExists!("/file.ts")).to.be.true;
      expect(moduleResolutionHost.fileExists!("/file2.ts")).to.be.false;
    });

    it("should get if a file exists in the project", () => {
      const { moduleResolutionHost, project } = setup();
      project.createSourceFile("/file.ts", "");
      expect(moduleResolutionHost.fileExists!("/file.ts")).to.be.true;
    });

    it("should read the contents of a file when it exists on the file system", () => {
      const { moduleResolutionHost, fileSystem } = setup();
      const contents = "test";
      fileSystem.writeFileSync("/file.ts", contents);
      expect(moduleResolutionHost.readFile!("/file.ts")).to.equal(contents);
    });

    it("should read the contents of a file when it exists in the project", () => {
      const { moduleResolutionHost, project } = setup();
      const contents = "test";
      project.createSourceFile("/file.ts", contents);
      expect(moduleResolutionHost.readFile!("/file.ts")).to.equal(contents);
    });

    it("should return undefined when reading a file that doesn't exist", () => {
      const { moduleResolutionHost } = setup();
      expect(moduleResolutionHost.readFile!("/file.ts")).to.be.undefined;
    });

    it("should get the current directory", () => {
      const { moduleResolutionHost } = setup();
      expect(moduleResolutionHost.getCurrentDirectory!()).to.equal("/");
    });

    it("should read the directories in a folder on the file system", () => {
      const { moduleResolutionHost, fileSystem } = setup();
      fileSystem.mkdirSync("/dir1");
      fileSystem.mkdirSync("/dir2");
      expect(moduleResolutionHost.getDirectories!("/")).to.deep.equal([
        "/dir1",
        "/dir2",
      ]);
    });

    it("should read the directories in a folder combining that with directores that exist in the project", () => {
      const { moduleResolutionHost, fileSystem, project } = setup();
      fileSystem.mkdirSync("/dir1");
      project.createDirectory("/dir2").saveSync(); // exists on both file system and project
      project.createDirectory("/dir3");
      expect(moduleResolutionHost.getDirectories!("/")).to.deep.equal([
        "/dir1",
        "/dir2",
        "/dir3",
      ]);
    });

    it("should get the real path", () => {
      const { moduleResolutionHost, fileSystem } = setup();
      fileSystem.realpathSync = p => p + "_RealPath";
      expect(moduleResolutionHost.realpath!("/test")).to.equal("/test_RealPath");
    });

    it("should not have a trace function", () => {
      const { moduleResolutionHost } = setup();
      // This hasn't been implemented and I'm not sure it will be.
      // Looking at the compiler API code, it seems this writes to
      // stdout. Probably best to let people implement this themselves
      // if they want it.
      expect(moduleResolutionHost.trace).to.be.undefined;
    });
  });

  describe(nameof<Project>("getConfigFileParsingDiagnostics"), () => {
    it("should get the diagnostics found when parsing the tsconfig.json file", () => {
      const fileSystem = new InMemoryFileSystemHost();
      fileSystem.writeFileSync("/tsconfig.json", `{ "fies": [] }`);
      const project = new Project({ fileSystem, tsConfigFilePath: "/tsconfig.json" });
      expect(project.getConfigFileParsingDiagnostics().map(d => d.getMessageText())).to.deep.equal([
        `No inputs were found in config file '/tsconfig.json'. Specified 'include' paths were '["**/*"]' and 'exclude' paths were '[]'.`,
      ]);
    });
  });
});

function assertHasDirectories(project: Project, dirPaths: string[]) {
  expect(project.getDirectories().map(d => d.getPath()).sort()).to.deep.equal(dirPaths.sort());
}

function assertHasSourceFiles(project: Project, filePaths: string[]) {
  expect(project.getSourceFiles().map(d => d.getFilePath()).sort()).to.deep.equal(filePaths.sort());
}
