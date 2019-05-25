import { expect } from "chai";
import { EOL } from "os";
import * as path from "path";
import { ClassDeclaration, EmitResult, MemoryEmitResult, InterfaceDeclaration, NamespaceDeclaration, Node, SourceFile, Identifier } from "../compiler";
import * as errors from "../errors";
import { VirtualFileSystemHost } from "../fileSystem";
import { IndentationText } from "../options";
import { Project, ProjectOptions } from "../Project";
import { SourceFileStructure, StructureKind } from "../structures";
import { CompilerOptions, ScriptTarget, SyntaxKind, ts } from "../typescript";
import { OptionalKindAndTrivia } from "./compiler/testHelpers";
import * as testHelpers from "./testHelpers";

console.log("");
console.log("TypeScript version: " + ts.version);

describe(nameof(Project), () => {
    describe("constructor", () => {
        it("should set the manipulation settings if provided", () => {
            const project = new Project({
                manipulationSettings: {
                    indentationText: IndentationText.EightSpaces
                }
            });

            expect(project.manipulationSettings.getIndentationText()).to.equal(IndentationText.EightSpaces);
        });

        it("should add the files from tsconfig.json by default with the target in the tsconfig.json", () => {
            const fileSystem = new VirtualFileSystemHost();
            fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fileSystem.writeFileSync("/otherFile.ts", "");
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json", fileSystem });
            expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(["/test/file.ts", "/test/test2/file2.ts"].sort());
            expect(project.getSourceFiles().map(s => s.getLanguageVersion())).to.deep.equal([ScriptTarget.ES5, ScriptTarget.ES5]);
        });

        it("should add the files from tsconfig.json by default and also take into account the passed in compiler options", () => {
            const fileSystem = new VirtualFileSystemHost();
            fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES5" } }`);
            fileSystem.writeFileSync("/otherFile.ts", "");
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json", compilerOptions: { rootDir: "/test/test2" }, fileSystem });
            expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(["/test/test2/file2.ts"].sort());
        });

        it("should not add the files from tsconfig.json when specifying not to", () => {
            const fileSystem = new VirtualFileSystemHost();
            fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json", addFilesFromTsConfig: false, fileSystem });
            expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal([]);
        });

        it("should resolve dependencies by default", () => {
            const { project, initialFiles, resolvedFiles } = fileDependencyResolutionSetup();
            expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles, ...resolvedFiles]);
        });

        describe("skipFileDependencyResolution", () => {
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
            it("should throw if getting the compiler options not within a method", () => {
                expect(() => new Project({
                    useVirtualFileSystem: true,
                    resolutionHost: (_, getCompilerOptions) => {
                        getCompilerOptions(); // this isn't allowed here
                        return {};
                    }
                })).to.throw(errors.InvalidOperationError);
            });

            it("should throw if using the module resolution host not within a method", () => {
                expect(() => new Project({
                    useVirtualFileSystem: true,
                    resolutionHost: moduleResolutionHost => {
                        moduleResolutionHost.fileExists("./test.ts"); // this isn't allowed here
                        return {};
                    }
                })).to.throw(errors.InvalidOperationError);
            });

            function setup() {
                // this is deno style module resolution
                const project = new Project({
                    useVirtualFileSystem: true,
                    resolutionHost: (moduleResolutionHost, getCompilerOptions) => {
                        return {
                            resolveModuleNames: (moduleNames, containingFile) => {
                                const compilerOptions = getCompilerOptions();
                                const resolvedModules: ts.ResolvedModule[] = [];

                                for (const moduleName of moduleNames.map(removeTsExtension)) {
                                    const result = ts.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost);
                                    if (result.resolvedModule)
                                        resolvedModules.push(result.resolvedModule);
                                }

                                return resolvedModules;
                            }
                        };

                        function removeTsExtension(moduleName: string) {
                            if (moduleName.slice(-3).toLowerCase() === ".ts")
                                return moduleName.slice(0, -3);
                            return moduleName;
                        }
                    }
                });

                const testFile = project.createSourceFile("/Test.ts", "export class Test {}");
                const mainFile = project.createSourceFile("/main.ts", `import { Test } from "./Test.ts";\n\nconst test = new Test();`);
                return { testFile, mainFile };
            }

            it("should support when the file exists only in the project", () => {
                const { mainFile } = setup();
                const importDec = mainFile.getImportDeclarationOrThrow("./Test.ts");
                const testFile = importDec.getModuleSpecifierSourceFile();
                expect(testFile).to.not.be.undefined;
            });

            it("should support when the file exists only on disk", () => {
                const { mainFile, testFile } = setup();
                testFile.saveSync();
                testFile.forget();
                const importDec = mainFile.getImportDeclarationOrThrow("./Test.ts");
                const newTestFile = importDec.getModuleSpecifierSourceFile();
                expect(newTestFile).to.not.be.undefined;
            });

            it("should support when renaming with the language service", () => {
                // this test indicates that the language service was passed the custom module resolution
                const { mainFile, testFile } = setup();
                testFile.getClassOrThrow("Test").rename("NewClass");
                expect(mainFile.getFullText()).to.equal(`import { NewClass } from "./Test.ts";\n\nconst test = new NewClass();`);
            });
        });

        describe("custom type reference directive resolution", () => {
            function setup() {
                const fileSystem = new VirtualFileSystemHost();
                const testFilePath = "/other/test.d.ts";
                fileSystem.writeFileSync("/dir/tsconfig.json", `{ "compilerOptions": { "target": "ES5" } }`);
                fileSystem.writeFileSync("/dir/main.ts", `/// <reference types="../other/testasdf" />\n\nconst test = new Test();`);
                fileSystem.writeFileSync(testFilePath, `declare class Test {}`);
                fileSystem.getCurrentDirectory = () => "/dir";
                const project = new Project({
                    fileSystem,
                    resolutionHost: (moduleResolutionHost, getCompilerOptions) => {
                        return {
                            resolveTypeReferenceDirectives: (typeDirectiveNames: string[], containingFile: string) => {
                                const compilerOptions = getCompilerOptions();
                                const resolvedTypeReferenceDirectives: ts.ResolvedTypeReferenceDirective[] = [];

                                for (const typeDirectiveName of typeDirectiveNames.map(replaceAsdfExtension)) {
                                    const result = ts.resolveTypeReferenceDirective(typeDirectiveName, containingFile, compilerOptions, moduleResolutionHost);
                                    if (result.resolvedTypeReferenceDirective)
                                        resolvedTypeReferenceDirectives.push(result.resolvedTypeReferenceDirective);
                                }

                                return resolvedTypeReferenceDirectives;
                            }
                        };

                        function replaceAsdfExtension(moduleName: string) {
                            return moduleName.replace("asdf", "");
                        }
                    },
                    tsConfigFilePath: "/dir/tsconfig.json"
                });

                const mainFile = project.getSourceFileOrThrow("main.ts");
                const testIdentifier = mainFile.getFirstDescendantOrThrow(d => d.getText() === "Test") as Identifier;
                return { project, mainFile, testFilePath, testIdentifier };
            }

            it("should support custom resolution", () => {
                const { testIdentifier } = setup();
                expect(testIdentifier.getDefinitionNodes().map(d => d.getText())).to.deep.equal(["declare class Test {}"]);
            });

            it("should support when renaming with the language service", () => {
                // todo: this should be investigated in the future as this test doesn't fail when the custom type reference directive resolution
                // is not provided to the language service.
                const { testIdentifier } = setup();
                testIdentifier.rename("NewClass");
                expect(testIdentifier.getDefinitionNodes().map(d => d.getText())).to.deep.equal(["declare class NewClass {}"]);
            });
        });
    });

    describe(nameof<Project>(p => p.resolveSourceFileDependencies), () => {
        it("should resolve file dependencies once specified", () => {
            const { project, initialFiles, resolvedFiles } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });
            expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles]);
            const result = project.resolveSourceFileDependencies();
            expect(result.map(s => s.getFilePath())).to.deep.equal(resolvedFiles);
            assertHasSourceFiles(project, [...initialFiles, ...resolvedFiles]);
        });

        it("should not resolve file dependencies until called", () => {
            const {
                project,
                initialFiles,
                resolvedFiles,
                initialDirectories,
                resolvedDirectories
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
                nodeModuleDirectories
            } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });

            expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([...initialFiles], "initial");
            project.addExistingDirectory("/node_modules");
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
                resolvedDirectories
            } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });
            project.addExistingDirectory("/node_modules/library");
            const result = project.resolveSourceFileDependencies();

            expect(result.map(s => s.getFilePath())).to.deep.equal([...resolvedFiles, ...nodeModuleFiles]);
            assertHasSourceFiles(project, [...initialFiles, ...resolvedFiles, ...nodeModuleFiles]);
            assertHasDirectories(project, [...initialDirectories, ...resolvedDirectories, "/node_modules/library"]);
        });

        it("should ignore handle nested node_modules directories", () => {
            const fileSystem = new VirtualFileSystemHost();
            fileSystem.writeFileSync("/node_modules/first.d.ts", "");
            fileSystem.writeFileSync("/node_modules/library/node_modules/second.d.ts", "");
            fileSystem.writeFileSync("/main.ts",
                "/// <reference path='node_modules/first.d.ts' />\n/// <reference path='node_modules/library/node_modules/second.d.ts' />");

            const project = new Project({ fileSystem });
            project.addExistingSourceFile("/main.ts");
            project.resolveSourceFileDependencies();
            assertHasSourceFiles(project, ["/main.ts"]);
            assertHasDirectories(project, ["/"]);

            project.addExistingDirectory("node_modules");
            assertHasSourceFiles(project, ["/main.ts"]);
            assertHasDirectories(project, ["/", "/node_modules"]);

            project.resolveSourceFileDependencies();
            assertHasSourceFiles(project, ["/main.ts", "/node_modules/first.d.ts"]);
            assertHasDirectories(project, ["/", "/node_modules"]);

            project.addExistingDirectory("/node_modules/library/node_modules");
            project.resolveSourceFileDependencies();
            assertHasSourceFiles(project, ["/main.ts", "/node_modules/first.d.ts", "/node_modules/library/node_modules/second.d.ts"]);
            assertHasDirectories(project, ["/", "/node_modules", "/node_modules/library", "/node_modules/library/node_modules"]);
        });
    });

    function fileDependencyResolutionSetup(options: ProjectOptions = {}) {
        const fileSystem = new VirtualFileSystemHost();

        fileSystem.writeFileSync("/package.json", `{ "name": "testing", "version": "0.0.1" }`);
        fileSystem.writeFileSync("/node_modules/library/package.json",
            `{ "name": "library", "version": "0.0.1", "main": "index.js", "typings": "index.d.ts", "typescript": { "definition": "index.d.ts" } }`);
        fileSystem.writeFileSync("/node_modules/library/index.js", "export class Test {}");
        fileSystem.writeFileSync("/node_modules/library/index.d.ts", "export class Test {}");
        fileSystem.mkdirSync("/node_modules/library/subDir");
        fileSystem.writeFileSync("/node_modules/library2/package.json",
            `{ "name": "library2", "version": "0.0.1", "main": "index.js", "typings": "index.d.ts", "typescript": { "definition": "index.d.ts" } }`);
        fileSystem.writeFileSync("/node_modules/library2/index.js", "export class Library2 {}");
        fileSystem.writeFileSync("/node_modules/library2/index.d.ts", "export class Library2 {}");
        fileSystem.writeFileSync("/src/main.ts", "/// <reference path='../other/referenced-file.d.ts' />\n\nimport { Test } from 'library'; nameof();");
        fileSystem.writeFileSync("/other/referenced-file.d.ts", "declare function nameof(): void;");
        fileSystem.writeFileSync("/tsconfig.json", `{ "files": ["src/main.ts"] }`);

        const project = new Project({ tsConfigFilePath: "tsconfig.json", fileSystem, ...options });
        return {
            project,
            initialFiles: ["/src/main.ts"],
            initialDirectories: ["/src"],
            resolvedFiles: ["/other/referenced-file.d.ts"],
            resolvedDirectories: ["/other"],
            nodeModuleFiles: ["/node_modules/library/index.d.ts"],
            nodeModuleDirectories: ["/node_modules", "/node_modules/library"]
        };
    }

    describe(nameof<Project>(project => project.getCompilerOptions), () => {
        it(`should get the default compiler options when not providing anything and no tsconfig exists`, () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project({ fileSystem });
            expect(project.getCompilerOptions()).to.deep.equal({});
        });

        it(`should not get the compiler options from tsconfig.json when not providing anything and a tsconfig exists`, () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
            const project = new Project({ fileSystem });
            expect(project.getCompilerOptions()).to.deep.equal({});
        });

        it(`should get empty compiler options when providing an empty compiler options object`, () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions: {}, fileSystem });
            expect(project.getCompilerOptions()).to.deep.equal({});
        });

        function doTsConfigTest(addFilesFromTsConfig: boolean) {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
            const project = new Project({
                tsConfigFilePath: "tsconfig.json",
                compilerOptions: {
                    target: 2,
                    allowJs: true
                },
                addFilesFromTsConfig, // the behaviour changes based on this value so it's good to test both of these
                fileSystem
            });
            expect(project.getCompilerOptions()).to.deep.equal({ rootDir: "/test", target: 2, allowJs: true });
        }

        it(`should override the tsconfig options when specifying to add files from tsconfig`, () => {
            doTsConfigTest(true);
        });

        it(`should override the tsconfig options when specifying to not add files from tsconfig`, () => {
            doTsConfigTest(false);
        });
    });

    describe(nameof<Project>(project => project.addExistingDirectoryIfExists), () => {
        it("should throw if the directory doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project({ fileSystem });
            expect(project.addExistingDirectoryIfExists("someDir")).to.be.undefined;
        });

        it("should add the directory if it exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["someDir"]);
            const project = new Project({ fileSystem });
            const dir = project.addExistingDirectoryIfExists("someDir");
            expect(dir).to.not.be.undefined;
        });

        it("should add a directory and all its descendant directories when specifying the recursive option", () => {
            const directories = ["/", "dir", "dir/child1", "dir/child2", "dir/child1/grandChild1"];
            const project = new Project({ useVirtualFileSystem: true });
            directories.forEach(d => project.getFileSystem().mkdirSync(d));
            expect(project.addExistingDirectoryIfExists("dir", { recursive: true })).to.equal(project.getDirectoryOrThrow("dir"));

            testHelpers.testDirectoryTree(project.getDirectoryOrThrow("dir"), {
                directory: project.getDirectoryOrThrow("dir"),
                children: [{
                    directory: project.getDirectoryOrThrow("dir/child1"),
                    children: [{ directory: project.getDirectoryOrThrow("dir/child1/grandChild1") }]
                }, {
                    directory: project.getDirectoryOrThrow("dir/child2")
                }]
            }, project.getDirectoryOrThrow("/"));
        });

        it("should add the directory to the project", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "/dir/file.ts", text: "" }]);
            const project = new Project({ fileSystem });
            const dir = project.addExistingDirectoryIfExists("/dir")!;

            expect(dir._isInProject()).to.be.true;
        });

        it("should add the directory to the project if previously not in the project", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const dir = project.createDirectory("/dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            expect(dir._isInProject()).to.be.false;
            project.addExistingDirectoryIfExists("/dir");
            expect(dir._isInProject()).to.be.true;
        });
    });

    describe(nameof<Project>(project => project.addExistingDirectory), () => {
        it("should throw if the directory doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project({ fileSystem });
            expect(() => {
                project.addExistingDirectory("someDir");
            }).to.throw(errors.DirectoryNotFoundError);
        });

        it("should add the directory if it exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["someDir"]);
            const project = new Project({ fileSystem });
            const dir = project.addExistingDirectory("someDir");
            expect(dir).to.not.be.undefined;
        });

        it("should add a directory and all its descendant directories when specifying the recursive option", () => {
            const directories = ["/", "dir", "dir/child1", "dir/child2", "dir/child1/grandChild1"];
            const project = new Project({ useVirtualFileSystem: true });
            directories.forEach(d => project.getFileSystem().mkdirSync(d));
            expect(project.addExistingDirectory("dir", { recursive: true })).to.equal(project.getDirectoryOrThrow("dir"));

            testHelpers.testDirectoryTree(project.getDirectoryOrThrow("dir"), {
                directory: project.getDirectoryOrThrow("dir"),
                children: [{
                    directory: project.getDirectoryOrThrow("dir/child1"),
                    children: [{ directory: project.getDirectoryOrThrow("dir/child1/grandChild1") }]
                }, {
                    directory: project.getDirectoryOrThrow("dir/child2")
                }]
            }, project.getDirectoryOrThrow("/"));
        });

        it("should add the directory to the project", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "/dir/file.ts", text: "" }]);
            const project = new Project({ fileSystem });
            const dir = project.addExistingDirectory("/dir");

            expect(dir._isInProject()).to.be.true;
        });

        it("should add the directory to the project if previously not in the project", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const dir = project.createDirectory("/dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            expect(dir._isInProject()).to.be.false;
            project.addExistingDirectory("/dir");
            expect(dir._isInProject()).to.be.true;
        });
    });

    describe(nameof<Project>(project => project.createDirectory), () => {
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
            const project = new Project({ useVirtualFileSystem: true });
            const dir = project.createDirectory("/dir");

            expect(dir._isInProject()).to.be.true;
        });

        it("should be added to the project when creating a directory that's created, but not in the project", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const dir = project.createDirectory("/dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            expect(dir._isInProject()).to.be.false;
            const newDir = project.createDirectory("/dir");

            expect(dir._isInProject()).to.be.true;
            expect(newDir._isInProject()).to.be.true;
        });
    });

    describe(nameof<Project>(project => project.getDirectory), () => {
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

    describe(nameof<Project>(project => project.getDirectoryOrThrow), () => {
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

    describe(nameof<Project>(project => project.getRootDirectories), () => {
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
                project.getDirectoryOrThrow("/dir/sub3/child")
            ].map(d => d.getPath()));
        });

        it("should add an ancestor dir when requesting it", () => {
            const project = getProject();
            project.getDirectoryOrThrow("/dir");
            expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal([
                project.getDirectoryOrThrow("/dir")
            ].map(d => d.getPath()));
        });

        it("should add the root directory when requesting it", () => {
            const project = getProject();
            expect(project.getDirectory("/otherDir")).to.be.undefined;
            project.getDirectoryOrThrow("/");
            expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal([
                project.getDirectoryOrThrow("/")
            ].map(d => d.getPath()));
        });
    });

    describe(nameof<Project>(project => project.getDirectories), () => {
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
                "/dir2/child"
            ]);
        });

        it("should not return directories not in the project", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const rootDir = project.createDirectory("/");
            const subDir = project.createDirectory("/sub");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);

            assertHasDirectories(project, ["/"]);
        });

        it("should not return an ancestor directory that exists, but is not in the project", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const rootDir = project.createDirectory("/");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(rootDir);
            project.createDirectory("/subDir");
            expect(rootDir._isInProject()).to.be.false;

            assertHasDirectories(project, ["/subDir"]);
        });
    });

    describe(nameof<Project>(project => project.addSourceFilesFromTsConfig), () => {
        it("should throw if the tsconfig doesn't exist", () => {
            const fileSystem = new VirtualFileSystemHost();
            const project = new Project({ fileSystem });
            expect(() => project.addSourceFilesFromTsConfig("tsconfig.json")).to.throw(errors.FileNotFoundError);
        });

        it("should add the files from tsconfig.json", () => {
            const fileSystem = new VirtualFileSystemHost();
            // todo: why did I need a slash at the start of `/test/exclude`?
            fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" }, "exclude": ["/test/exclude"] }`);
            fileSystem.writeFileSync("/otherFile.ts", "");
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            fileSystem.writeFileSync("/test/exclude/file.ts", "");
            fileSystem.mkdirSync("/test/emptyDir");
            const project = new Project({ fileSystem });
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

    describe(nameof<Project>(project => project.addExistingSourceFile), () => {
        it("should throw an exception if adding a source file at a non-existent path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project({ fileSystem });
            expect(() => {
                project.addExistingSourceFile("non-existent-file.ts");
            }).to.throw(errors.FileNotFoundError, `File not found: /non-existent-file.ts`);
        });

        it("should add a source file that exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const project = new Project({ fileSystem });
            const sourceFile = project.addExistingSourceFile("file.ts");
            expect(sourceFile).to.not.be.undefined;
            expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.Latest);
        });
    });

    describe(nameof<Project>(project => project.addExistingSourceFileIfExists), () => {
        it("should return undefined if adding a source file at a non-existent path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(project.addExistingSourceFileIfExists("non-existent-file.ts")).to.be.undefined;
        });

        it("should add a source file that exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const project = new Project({ fileSystem });
            const sourceFile = project.addExistingSourceFileIfExists("file.ts");
            expect(sourceFile).to.not.be.undefined;
            expect(sourceFile!.getLanguageVersion()).to.equal(ScriptTarget.Latest);
        });
    });

    describe(nameof<Project>(project => project.addExistingSourceFiles), () => {
        it("should add based on a string file glob", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const fs = project.getFileSystem();
            fs.writeFileSync("file1.ts", "");
            fs.writeFileSync("dir/file.ts", "");
            fs.writeFileSync("dir/subDir/file.ts", "");
            const result = project.addExistingSourceFiles("/dir/**/*.ts");
            const sourceFiles = project.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(result).to.deep.equal(sourceFiles);
            expect(sourceFiles[0].getFilePath()).to.equal("/dir/file.ts");
            expect(sourceFiles[0].getLanguageVersion()).to.equal(ScriptTarget.Latest);
            expect(sourceFiles[0].isSaved()).to.be.true; // should be saved because it was read from the disk
            expect(sourceFiles[1].getFilePath()).to.equal("/dir/subDir/file.ts");
        });

        it("should add based on multiple file globs", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const fs = project.getFileSystem();
            fs.writeFileSync("file1.ts", "");
            fs.writeFileSync("dir/file.ts", "");
            fs.writeFileSync("dir/file.d.ts", "");
            fs.writeFileSync("dir/subDir/file.ts", "");
            const result = project.addExistingSourceFiles(["/dir/**/*.ts", "!/dir/**/*.d.ts"]);
            const sourceFiles = project.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(result).to.deep.equal(sourceFiles);
            expect(sourceFiles[0].getFilePath()).to.equal("/dir/file.ts");
            expect(sourceFiles[0].getLanguageVersion()).to.equal(ScriptTarget.Latest);
            expect(sourceFiles[1].getFilePath()).to.equal("/dir/subDir/file.ts");
        });

        it("should add the directory's descendant directories specified in the glob and ignore negated globs", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const fs = project.getFileSystem();
            ["/dir", "/dir2", "/dir/child", "/dir/child/grandChild", "/dir3"].forEach(d => fs.mkdir(d));
            const result = project.addExistingSourceFiles(["/dir/**/*.ts", "!/dir2", "/dir3/**/*.ts"]);
            testHelpers.testDirectoryTree(project.getDirectoryOrThrow("/dir"), {
                directory: project.getDirectoryOrThrow("/dir"),
                children: [{
                    directory: project.getDirectoryOrThrow("/dir/child"),
                    children: [{
                        directory: project.getDirectoryOrThrow("/dir/child/grandChild")
                    }]
                }]
            });
            testHelpers.testDirectoryTree(project.getDirectoryOrThrow("/dir3"), {
                directory: project.getDirectoryOrThrow("/dir3")
            });
        });
    });

    describe(nameof<Project>(project => project.createSourceFile), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("file.ts", "");
            expect(() => {
                project.createSourceFile("file.ts", "");
            }).to.throw(errors.InvalidOperationError, `A source file already exists at the provided file path: /file.ts`);
        });

        it("should not throw an exception if creating a source file at an existing path when providing the overwrite option", () => {
            const project = new Project({ useVirtualFileSystem: true });
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
            const project = new Project({ useVirtualFileSystem: true });
            expect(project.createSourceFile("file.ts", "").isSaved()).to.be.false;
        });

        it("should create a source file with the default target", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(project.createSourceFile("file.ts", "").getLanguageVersion()).to.equal(ScriptTarget.Latest);
        });

        it("should create a source file with the compiler options' target", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.compilerOptions.set({ target: ScriptTarget.ES2015 });
            expect(project.createSourceFile("file.ts", "").getLanguageVersion()).to.equal(ScriptTarget.ES2015);
        });

        it("should add a source file based on a writer function", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("test.ts", writer => writer.writeLine("enum MyEnum {}"));
            expect(sourceFile.getFullText()).to.equal("enum MyEnum {}\n");
        });

        it("should add a source file based on a structure", () => {
            // basic test
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("MyFile.ts", {
                statements: [{
                    kind: StructureKind.Enum,
                    name: "MyEnum"
                }]
            });
            expect(sourceFile.getFullText()).to.equal(`enum MyEnum {\n}\n`);
        });

        it("should add for everything in the structure", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<SourceFileStructure>> = {
                statements: ["console.log('here');"]
            };
            const sourceFile = new Project({ useVirtualFileSystem: true }).createSourceFile("MyFile.ts", structure);
            const expectedText = "console.log('here');\n";
            expect(sourceFile.getFullText()).to.equal(expectedText);
        });

        it("", () => {
            // todo: remove
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("MyFile.ts", "enum MyEnum {\n    myMember\n}\nlet myEnum: MyEnum;\nlet myOtherEnum: MyNewEnum;");
            const enumDef = sourceFile.getEnums()[0];
            enumDef.rename("NewName");
            const addedEnum = sourceFile.addEnum({
                name: "MyNewEnum"
            });
            addedEnum.rename("MyOtherNewName");
            const enumMember = enumDef.getMembers()[0];
            enumMember.rename("myNewMemberName");
            expect(enumMember.getValue()).to.equal(0);
            expect(sourceFile.getFullText()).to.equal("enum NewName {\n    myNewMemberName\n}\nlet myEnum: NewName;\nlet myOtherEnum: MyOtherNewName;\n\nenum MyOtherNewName {\n}\n");
        });
    });

    describe("mixing real files with virtual files", () => {
        const testFilesDirPath = path.join(__dirname, "../../src/tests/testFiles");
        const project = new Project();
        project.addExistingSourceFiles(`${testFilesDirPath}/**/*.ts`);
        project.createSourceFile(
            path.join(testFilesDirPath, "variableTestFile.ts"),
            `import * as testClasses from "./testClasses";\n\nlet myVar = new testClasses.TestClass().name;\n`
        );

        it("should have 4 source files", () => {
            expect(project.getSourceFiles().length).to.equal(4);
        });

        it("should rename a name appropriately", () => {
            const interfaceFile = project.getSourceFileOrThrow("testInterfaces.ts");
            interfaceFile.getInterfaces()[0].getProperties()[0].rename("newName");
            const variableFile = project.getSourceFileOrThrow("variableTestFile.ts");
            expect(variableFile.getFullText()).to.equal(`import * as testClasses from "./testClasses";\n\nlet myVar = new testClasses.TestClass().newName;\n`);
        });
    });

    describe(nameof<Project>(project => project.removeSourceFile), () => {
        it("should remove the source file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("myFile.ts", ``);
            expect(project.removeSourceFile(sourceFile)).to.equal(true);
            expect(project.removeSourceFile(sourceFile)).to.equal(false);
            expect(project.getSourceFiles().length).to.equal(0);
            expect(() => sourceFile.getChildCount()).to.throw(); // should be forgotten
        });
    });

    describe(nameof<Project>(project => project.save), () => {
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

    describe(nameof<Project>(project => project.saveSync), () => {
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

    describe(nameof<Project>(project => project.emit), () => {
        it("should emit multiple files when not specifying any options", async () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
            const result = await project.emit();
            expect(result).to.be.instanceof(EmitResult);

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog[1].filePath).to.equal("/dist/file2.js");
            expect(writeLog[1].fileText).to.equal("var num2 = 2;\n");
            expect(writeLog.length).to.equal(2);
        });

        it("should emit the source file when specified", async () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
            await project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog.length).to.equal(1);
        });

        it("should emit with bom if specified", async () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", emitBOM: true });
            await project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });
            expect(fileSystem.getWriteLog()[0].fileText).to.equal("\uFEFFvar num1 = 1;\n");
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

        it("should emit with custom transformations", async () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });

            function visitSourceFile(sourceFile: ts.SourceFile, context: ts.TransformationContext, visitNode: (node: ts.Node) => ts.Node) {
                return visitNodeAndChildren(sourceFile) as ts.SourceFile;

                function visitNodeAndChildren(node: ts.Node): ts.Node {
                    return ts.visitEachChild(visitNode(node), visitNodeAndChildren, context);
                }
            }

            function numericLiteralToStringLiteral(node: ts.Node) {
                if (ts.isNumericLiteral(node))
                    return ts.createStringLiteral(node.text);
                return node;
            }

            await project.emit({
                customTransformers: {
                    before: [context => sourceFile => visitSourceFile(sourceFile, context, numericLiteralToStringLiteral)]
                }
            });

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.js");
            expect(writeLog[0].fileText).to.equal(`var num1 = "1";\n`);
            expect(writeLog[1].filePath).to.equal("/dist/file2.js");
            expect(writeLog[1].fileText).to.equal(`var num2 = "2";\n`);
            expect(writeLog.length).to.equal(2);
        });
    });

    describe(nameof<Project>(project => project.emitSync), () => {
        it("should emit synchronously", () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
            const result = project.emitSync();
            expect(result).to.be.instanceof(EmitResult);

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog[1].filePath).to.equal("/dist/file2.js");
            expect(writeLog[1].fileText).to.equal("var num2 = 2;\n");
            expect(writeLog.length).to.equal(2);
        });

        it("should emit with bom if specified", () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist", emitBOM: true });
            project.emitSync({ targetSourceFile: project.getSourceFile("file1.ts") });
            expect(fileSystem.getWriteLog()[0].fileText).to.equal("\uFEFFvar num1 = 1;\n");
        });
    });

    describe(nameof<Project>(project => project.emitToMemory), () => {
        it("should emit multiple files to memory", () => {
            const { project, fileSystem } = emitSetup({ noLib: true, outDir: "dist" });
            const result = project.emitToMemory();
            expect(result).to.be.instanceof(MemoryEmitResult);

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog.length).to.equal(0);

            const files = result.getFiles();
            expect(files[0].filePath).to.equal("/dist/file1.js");
            expect(files[0].text).to.equal("var num1 = 1;\n");
            expect(files[1].filePath).to.equal("/dist/file2.js");
            expect(files[1].text).to.equal("var num2 = 2;\n");
            expect(files.length).to.equal(2);
        });
    });

    describe(nameof<Project>(project => project.getSourceFile), () => {
        it("should get the first match based on the directory structure", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on the directory structure when specifying a dot slash", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("./file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on the directory structure when using ../", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const expectedFile = project.createSourceFile("dir/file.ts");
            project.createSourceFile("file.ts");
            expect(project.getSourceFile("dir/../dir/file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on a file name", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("file.ts");
            const expectedFile = project.createSourceFile("dir/file2.ts");
            expect(project.getSourceFile("file2.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get when specifying an absolute path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("/file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on the directory structure when swapping the order of what was created first", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const expectedFile = project.createSourceFile("file.ts");
            project.createSourceFile("dir/file.ts");
            expect(project.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });
    });

    describe(nameof<Project>(project => project.getSourceFileOrThrow), () => {
        it("should throw when it can't find the source file based on a provided file name", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(() => project.getSourceFileOrThrow("fileName.ts")).to.throw(errors.InvalidOperationError,
                "Could not find source file in project with the provided file name: fileName.ts");
        });

        it("should throw when it can't find the source file based on a provided relative path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            // this should show the absolute path in the error message
            expect(() => project.getSourceFileOrThrow("src/fileName.ts")).to.throw(errors.InvalidOperationError,
                "Could not find source file in project at the provided path: /src/fileName.ts");
        });

        it("should throw when it can't find the source file based on a provided absolute path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(() => project.getSourceFileOrThrow("/fileName.ts")).to.throw(errors.InvalidOperationError,
                "Could not find source file in project at the provided path: /fileName.ts");
        });

        it("should throw when it can't find the source file based on a provided condition", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(() => project.getSourceFileOrThrow(() => false)).to.throw(errors.InvalidOperationError,
                "Could not find source file in project based on the provided condition.");
        });

        it("should not throw when it finds the file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("myFile.ts", "");
            expect(project.getSourceFileOrThrow("myFile.ts").getFilePath()).to.contain("myFile.ts");
        });
    });

    describe(nameof<Project>(project => project.getSourceFiles), () => {
        it("should get all the source files added to the project sorted by directory structure", () => {
            const project = new Project({ useVirtualFileSystem: true });
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
                "/dir/child/file.ts"
            ]);
        });

        describe("globbing", () => {
            const project = new Project({ useVirtualFileSystem: true });
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
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with a relative path", () => {
                expect(project.getSourceFiles("src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with a relative path with a dot", () => {
                expect(project.getSourceFiles("./src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with an absolute path", () => {
                expect(project.getSourceFiles("/src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with multiple patterns", () => {
                expect(project.getSourceFiles(["**/src/**/*.ts", "!**/src/test/**/*.ts", "!**/*.d.ts"]).map(s => s.getFilePath())).to.deep.equal([
                    "/src/file.ts"
                ]);
            });
        });

        it("should not return files not in the project", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const subDirFile = project.createSourceFile("/dir/other.ts");
            project.createSourceFile("main.ts");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDirFile.getDirectory());
            assertHasSourceFiles(project, ["/main.ts"]);
        });
    });

    describe(nameof<Project>(t => t.forgetNodesCreatedInBlock), () => {
        describe("synchronous", () => {
            const project = new Project({ useVirtualFileSystem: true });
            let sourceFile: SourceFile;
            let sourceFileNotNavigated: SourceFile;
            let classNode: Node;
            let namespaceNode: NamespaceDeclaration;
            let namespaceKeywordNode: Node;
            let interfaceNode1: Node;
            let interfaceNode2: Node;
            let interfaceNode3: Node;
            let interfaceNode4: Node;
            let interfaceNode5: Node;
            project.forgetNodesCreatedInBlock(remember => {
                sourceFile = project.createSourceFile("test.ts", "class MyClass {} namespace MyNamespace { interface Interface1 {} interface Interface2 {} " +
                    "interface Interface3 {} interface Interface4 {} }");
                sourceFileNotNavigated = project.createSourceFile("test2.ts", "class MyClass {}");
                classNode = sourceFile.getClassOrThrow("MyClass");
                namespaceNode = sourceFile.getNamespaceOrThrow("MyNamespace");

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
            });

            it("should not have forgotten the source file", () => {
                expect(sourceFile.wasForgotten()).to.be.false;
            });

            it("should not have forgotten the not navigated source file", () => {
                expect(sourceFileNotNavigated.wasForgotten()).to.be.false;
            });

            it("should have forgotten the class", () => {
                expect(classNode.wasForgotten()).to.be.true;
            });

            it("should not have forgotten the namespace because one of its children was remembered", () => {
                expect(namespaceNode.wasForgotten()).to.be.false;
            });

            it("should have forgotten the namespace keyword", () => {
                expect(namespaceKeywordNode.wasForgotten()).to.be.true;
            });

            it("should not have forgotten the first interface because it was remembered", () => {
                expect(interfaceNode1.wasForgotten()).to.be.false;
            });

            it("should have forgotten the second interface", () => {
                expect(interfaceNode2.wasForgotten()).to.be.true;
            });

            it("should not have forgotten the third interface because it was remembered", () => {
                expect(interfaceNode3.wasForgotten()).to.be.false;
            });

            it("should not have forgotten the fourth interface because it was remembered", () => {
                expect(interfaceNode4.wasForgotten()).to.be.false;
            });

            it("should have forgotten the created fifth interface because it was not remembered", () => {
                expect(interfaceNode5.wasForgotten()).to.be.true;
            });

            it("should not throw if removing a created node in a block", () => {
                const newSourceFile = project.createSourceFile("file3.ts", "class MyClass {}");
                project.forgetNodesCreatedInBlock(remember => {
                    const classDec = newSourceFile.getClassOrThrow("MyClass");
                    classDec.remove();
                });
            });

            it("should throw if attempting to remember a node that was forgotten", () => {
                const newSourceFile = project.createSourceFile("file4.ts");
                project.forgetNodesCreatedInBlock(remember => {
                    const classDec = newSourceFile.addClass({ name: "Class" });
                    classDec.forget();
                    expect(() => remember(classDec)).to.throw(errors.InvalidOperationError);
                });
            });

            it("should get exceptions thrown in the body", () => {
                expect(() => project.forgetNodesCreatedInBlock(() => { throw new Error(""); })).to.throw();
            });
        });

        describe("asynchronous", () => {
            it("should have forgotten the class or interface", async () => {
                const project = new Project({ useVirtualFileSystem: true });
                const sourceFile = project.createSourceFile("file.ts");
                let interfaceDec: InterfaceDeclaration;
                let classDec: ClassDeclaration;
                await project.forgetNodesCreatedInBlock(async remember => {
                    // do something to cause this code to be added to the end of the execution queue
                    await new Promise((resolve, reject) => resolve());

                    classDec = sourceFile.addClass({ name: "Class" });
                    interfaceDec = sourceFile.addInterface({ name: "Interface" });
                    remember(interfaceDec);
                });

                expect(classDec!.wasForgotten()).to.be.true;
                expect(interfaceDec!.wasForgotten()).to.be.false;
            });
        });
    });

    describe(nameof<Project>(p => p.compilerOptions), () => {
        it("should reparse after modifying the compiler options", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("myFile.ts", `function myFunction(param: string) {}`);
            expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.Latest);
            project.compilerOptions.set({ target: ScriptTarget.ES5 });
            expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.ES5);
        });
    });

    describe("ambient modules", () => {
        function getProject() {
            const project = new Project({ useVirtualFileSystem: true });
            const fileSystem = project.getFileSystem();

            fileSystem.writeFileSync("/node_modules/@types/jquery/index.d.ts", `
    declare module 'jquery' {
        export = jQuery;
    }
    declare const jQuery: JQueryStatic;
    interface JQueryStatic {
        test: string;
    }`);
            fileSystem.writeFileSync("/node_modules/@types/jquery/package.json",
                `{ "name": "@types/jquery", "version": "1.0.0", "typeScriptVersion": "2.3" }`);

            project.createSourceFile("test.ts", "import * as ts from 'jquery';");
            return project;
        }

        describe(nameof<Project>(p => p.getAmbientModules), () => {
            it("should get when exist", () => {
                const project = getProject();
                expect(project.getAmbientModules().map(m => m.getName())).to.deep.equal([`"jquery"`]);
            });

            it("should get when doesn't exist", () => {
                const project = new Project({ useVirtualFileSystem: true });
                expect(project.getAmbientModules().length).to.equal(0);
            });
        });

        describe(nameof<Project>(p => p.getAmbientModule), () => {
            function doTest(moduleName: string, expectedName: string | undefined) {
                const project = getProject();
                const ambientModule = project.getAmbientModule(moduleName);
                expect(ambientModule == null ? undefined : ambientModule.getName()).to.equal(expectedName);
            }

            it("should find when using single quotes", () => doTest(`'jquery'`, `"jquery"`));
            it("should find when using double quotes", () => doTest(`"jquery"`, `"jquery"`));
            it("should find when using no quotes", () => doTest("jquery", `"jquery"`));
            it("should not find when does not exist", () => doTest("other-module", undefined));
        });

        describe(nameof<Project>(p => p.getAmbientModuleOrThrow), () => {
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
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("myFile.ts", `function myFunction(param: string) {}`);
            const param = sourceFile.getFunctions()[0].getParameters()[0];
            expect(param.getType().getText()).to.equal("string");
            param.setType("number");
            expect(param.getType().getText()).to.equal("number");
        });
    });

    describe(nameof<Project>(p => p.formatDiagnosticsWithColorAndContext), () => {
        function setup() {
            const project = new Project({ useVirtualFileSystem: true });
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

    describe(nameof<Project>(p => p.getModuleResolutionHost), () => {
        function setup() {
            const project = new Project({ useVirtualFileSystem: true });
            const moduleResolutionHost = project.getModuleResolutionHost();
            return {
                project,
                fileSystem: project.getFileSystem(),
                moduleResolutionHost
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
                "/dir2"
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
                "/dir3"
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
});

function assertHasDirectories(project: Project, dirPaths: string[]) {
    expect(project.getDirectories().map(d => d.getPath()).sort()).to.deep.equal(dirPaths.sort());
}

function assertHasSourceFiles(project: Project, filePaths: string[]) {
    expect(project.getSourceFiles().map(d => d.getFilePath()).sort()).to.deep.equal(filePaths.sort());
}
