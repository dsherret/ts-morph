import { EOL } from "os";
import { expect } from "chai";
import { Project, ProjectOptions } from "../Project";
import { InMemoryFileSystemHost, ts } from "@ts-morph/common";

describe(nameof(Project), () => {
    describe("constructor", () => {
        it("should add the files from tsconfig.json by default with the target in the tsconfig.json", () => {
            const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });
            fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fileSystem.writeFileSync("/otherFile.ts", "");
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json", fileSystem });
            expect(project.getSourceFiles().map(s => s.fileName).sort()).to.deep.equal(["/test/file.ts", "/test/test2/file2.ts"].sort());
            expect(project.getSourceFiles().map(s => s.languageVersion)).to.deep.equal([ts.ScriptTarget.ES5, ts.ScriptTarget.ES5]);
        });

        it("should add the files from tsconfig.json by default and also take into account the passed in compiler options", () => {
            const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });
            fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES5" } }`);
            fileSystem.writeFileSync("/otherFile.ts", "");
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json", compilerOptions: { rootDir: "/test/test2" }, fileSystem });
            expect(project.getSourceFiles().map(s => s.fileName).sort()).to.deep.equal(["/test/test2/file2.ts"].sort());
        });

        it("should not add the files from tsconfig.json when specifying not to", () => {
            const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });
            fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json", addFilesFromTsConfig: false, fileSystem });
            expect(project.getSourceFiles().map(s => s.fileName).sort()).to.deep.equal([]);
        });

        it("should resolve dependencies by default", () => {
            const { project, initialFiles, resolvedFiles, nodeModuleFiles } = fileDependencyResolutionSetup();
            expect(project.getSourceFiles().map(s => s.fileName)).to.deep.equal([...initialFiles, ...resolvedFiles, ...nodeModuleFiles]);
        });

        describe("skipFileDependencyResolution", () => {
            it("should not skip dependency resolution when false", () => {
                const { project, initialFiles, resolvedFiles, nodeModuleFiles } = fileDependencyResolutionSetup({ skipFileDependencyResolution: false });
                expect(project.getSourceFiles().map(s => s.fileName)).to.deep.equal([...initialFiles, ...resolvedFiles, ...nodeModuleFiles]);
            });

            it("should skip dependency resolution when specified", () => {
                const { project, initialFiles } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });
                expect(project.getSourceFiles().map(s => s.fileName)).to.deep.equal(initialFiles);
            });
        });

        describe("custom module resolution", () => {
            it("should not throw if getting the compiler options not within a method", () => {
                expect(() => new Project({
                    useInMemoryFileSystem: true,
                    resolutionHost: (_, getCompilerOptions) => {
                        // this should be allowed now
                        expect(getCompilerOptions()).to.deep.equal({ allowJs: true });
                        return {};
                    },
                    compilerOptions: {
                        allowJs: true
                    }
                })).to.not.throw();
            });

            it("should not throw if using the module resolution host not within a method", () => {
                expect(() => new Project({
                    useInMemoryFileSystem: true,
                    resolutionHost: moduleResolutionHost => {
                        // this is now allowed here, but used to not be
                        moduleResolutionHost.fileExists("./test.ts");
                        return {};
                    }
                })).to.not.throw();
            });

            function setup() {
                // this is deno style module resolution
                const project = new Project({
                    useInMemoryFileSystem: true,
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
                return { testFile, mainFile, typeChecker: project.createProgram().getTypeChecker(), languageService: project.getLanguageService() };
            }

            it("should resolve the module", () => {
                const { mainFile, typeChecker } = setup();
                const moduleSpecifier = (mainFile.statements[0] as ts.ImportDeclaration).moduleSpecifier;
                const symbol = typeChecker.getSymbolAtLocation(moduleSpecifier);
                expect(symbol).to.not.be.undefined;
                expect(symbol!.getName()).to.equal(`"/Test"`);
            });

            it("should support when renaming with the language service", () => {
                // this test indicates that the language service was passed the custom module resolution
                const { mainFile, testFile, languageService } = setup();
                const results = languageService.findRenameLocations(testFile.fileName, (testFile.statements[0] as ts.ClassDeclaration).name!.getStart(), false,
                    false);
                expect(results!.map(r => r.fileName).sort()).to.deep.equal([
                    "/Test.ts",
                    "/main.ts",
                    "/main.ts"
                ]);
            });
        });

        describe("custom type reference directive resolution", () => {
            function setup() {
                const fileSystem = new InMemoryFileSystemHost();
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
                const initializer = (mainFile.statements[0] as ts.VariableStatement).declarationList.declarations[0].initializer as ts.NewExpression;
                const testIdentifier = initializer.expression as ts.Identifier;
                return { project, mainFile, testFilePath, testIdentifier };
            }

            it("should support custom resolution", () => {
                const { project, testIdentifier, mainFile, testFilePath } = setup();
                const languageService = project.getLanguageService();
                const result = languageService.getDefinitionAtPosition(mainFile.fileName, testIdentifier.getStart(mainFile))!;
                expect(result.length).to.equal(1);
                expect(result[0].fileName).to.equal(testFilePath);
            });

            it("should support when renaming with the language service", () => {
                // todo: this should be investigated in the future as this test doesn't fail when the custom type reference directive resolution
                // is not provided to the language service.
                const { testIdentifier, mainFile, project, testFilePath } = setup();
                const languageService = project.getLanguageService();
                const result = languageService.findRenameLocations(mainFile.fileName, testIdentifier.getStart(mainFile), false, false)!;
                expect(result.length).to.equal(2);
                expect(result.map(r => r.fileName).sort()).to.deep.equal([
                    mainFile.fileName,
                    testFilePath
                ]);
            });
        });

        describe(nameof<ProjectOptions>(o => o.skipLoadingLibFiles), () => {
            it("should not skip loading lib files when empty", () => {
                const project = new Project({ useInMemoryFileSystem: true });
                const result = project.fileSystem.readDirSync("/node_modules/typescript/lib");
                expect(result.some(r => r.includes("lib.d.ts"))).to.be.true;
            });

            it("should not skip loading lib files when true", () => {
                const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true });
                expect(project.fileSystem.directoryExistsSync("/node_modules")).to.be.false;
            });

            it("should throw when providing skipLoadingLibFiles without using n in-memory file system", () => {
                expect(() => new Project({ skipLoadingLibFiles: true }))
                    .to.throw("The skipLoadingLibFiles option can only be true when useInMemoryFileSystem is true.");
            });
        });
    });

    describe(nameof<Project>(p => p.createSourceFile), () => {
        it("should create the specified source files", () => {
            const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true });
            const sourceFiles = [
                project.createSourceFile("/test.ts", "class Test {}"),
                project.createSourceFile("/test2.ts", "export class Other {}")
            ].sort();

            assertProjectHasSourceFiles(project, sourceFiles);
        });
    });

    describe(nameof<Project>(p => p.removeSourceFile), () => {
        it("should remove the specified source files by source file object", () => {
            const { project } = setup();
            const sourceFiles = [
                project.createSourceFile("/test.ts", "class Test {}"),
                project.createSourceFile("/test2.ts", "export class Other {}")
            ].sort();
            project.createProgram();
            project.removeSourceFile(sourceFiles[1]);
            assertProjectHasSourceFiles(project, [sourceFiles[0]]);
        });

        it("should remove the specified source files by file name", () => {
            const { project } = setup();
            const sourceFiles = [
                project.createSourceFile("/test.ts", "class Test {}"),
                project.createSourceFile("/test2.ts", "export class Other {}")
            ].sort();
            project.removeSourceFile(sourceFiles[0].fileName);
            assertProjectHasSourceFiles(project, [sourceFiles[1]]);
        });
    });

    describe(nameof<Project>(p => p.updateSourceFile), () => {
        it("should update a source file", () => {
            const { project } = setup();
            project.createSourceFile("/test.ts", "class Test {}");
            const newSourceFile = project.updateSourceFile("/test.ts", "class Other {}");
            assertProjectHasSourceFiles(project, [newSourceFile]);
        });

        it("should create the source file if it doesn't exist", () => {
            const { project } = setup();
            const newSourceFile = project.updateSourceFile("/test.ts", "class Test {}");
            assertProjectHasSourceFiles(project, [newSourceFile]);
        });

        it("should update a source file by source file object", () => {
            const { project } = setup();
            project.createSourceFile("/test.ts", "class Test {}");
            const newSourceFile = ts.createLanguageServiceSourceFile("/test.ts", ts.ScriptSnapshot.fromString("class Other {}"), ts.ScriptTarget.Latest, "1",
                true);
            project.updateSourceFile(newSourceFile);
            expect((newSourceFile as any).version).to.equal("2");
            assertProjectHasSourceFiles(project, [newSourceFile]);
        });

        it("should update a source file by source file object", () => {
            const { project } = setup();
            project.createSourceFile("/test.ts", "class Test {}");
            const newSourceFile = ts.createSourceFile("/test.ts", "class Other {}", ts.ScriptTarget.Latest);
            expect((newSourceFile as any).version).to.be.undefined;
            expect((newSourceFile as any).scriptSnapshot).to.be.undefined;
            project.updateSourceFile(newSourceFile);
            expect((newSourceFile as any).version).to.equal("0");
            expect((newSourceFile as any).scriptSnapshot.getText()).to.equal(newSourceFile.text);
            assertProjectHasSourceFiles(project, [newSourceFile]);
        });
    });

    describe(nameof<Project>(p => p.addSourceFileAtPath), () => {
        it("should add files that exist", () => {
            const { project } = setup();
            project.fileSystem.writeFileSync("/file1.ts", "class Test {}");
            project.fileSystem.writeFileSync("/file2.ts", "class Test {}");
            assertProjectHasSourceFiles(project, []);
            const file1 = project.addSourceFileAtPath("/file1.ts");
            const file2 = project.addSourceFileAtPath("file2.ts", { scriptKind: ts.ScriptKind.TSX });

            assertProjectHasSourceFiles(project, [file1, file2]);
            expect((file2 as any).scriptKind).to.equal(ts.ScriptKind.TSX);
        });

        it("should throw if a file doesn't exist", () => {
            const { project } = setup();
            expect(() => project.addSourceFileAtPath("file1.ts")).to.throw("File not found: /file1.ts");
        });
    });

    describe(nameof<Project>(p => p.addSourceFileAtPathIfExists), () => {
        it("should add files that exist", () => {
            const { project } = setup();
            project.fileSystem.writeFileSync("/file1.ts", "class Test {}");
            project.fileSystem.writeFileSync("/file2.ts", "class Test {}");
            assertProjectHasSourceFiles(project, []);
            const file1 = project.addSourceFileAtPathIfExists("/file1.ts");
            const file2 = project.addSourceFileAtPathIfExists("file2.ts", { scriptKind: ts.ScriptKind.TSX });

            assertProjectHasSourceFiles(project, [file1!, file2!]);
            expect((file2 as any).scriptKind).to.equal(ts.ScriptKind.TSX);
        });

        it("should return undefined if it doesn't exist", () => {
            const { project } = setup();
            expect(project.addSourceFileAtPathIfExists("file1.ts")).to.be.undefined;
        });
    });

    describe(nameof<Project>(project => project.addSourceFilesFromTsConfig), () => {
        it("should throw if the tsconfig doesn't exist", () => {
            const fileSystem = new InMemoryFileSystemHost();
            const project = new Project({ fileSystem });
            expect(() => project.addSourceFilesFromTsConfig("tsconfig.json")).to.throw("File not found: /tsconfig.json");
        });

        it("should add the files from tsconfig.json", () => {
            const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });
            fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" }, "exclude": ["/test/exclude"] }`);
            fileSystem.writeFileSync("/otherFile.ts", "");
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            fileSystem.writeFileSync("/test/exclude/file.ts", "");
            const project = new Project({ fileSystem });
            expect(project.getSourceFiles()).to.deep.equal([]);
            const returnedFiles = project.addSourceFilesFromTsConfig("tsconfig.json");
            const expectedFiles = ["/test/file.ts", "/test/test2/file2.ts"].sort();
            expect(project.getSourceFiles().map(s => s.fileName).sort()).to.deep.equal(expectedFiles);
            expect(returnedFiles.map(s => s.fileName).sort()).to.deep.equal(expectedFiles);
            // uses the compiler options of the project
            expect(project.getSourceFiles().map(s => s.languageVersion)).to.deep.equal([ts.ScriptTarget.Latest, ts.ScriptTarget.Latest]);
        });
    });

    describe(nameof<Project>(p => p.addSourceFilesByPaths), () => {
        it("should add the source files based on a file glob", () => {
            const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });
            fileSystem.writeFileSync("/otherFile.ts", "");
            fileSystem.writeFileSync("/test/file.ts", "");
            fileSystem.writeFileSync("/test/test2/file2.ts", "");
            fileSystem.writeFileSync("/test/other/file.ts", "");
            const project = new Project({ fileSystem });
            expect(project.getSourceFiles()).to.deep.equal([]);
            const returnedFiles = project.addSourceFilesByPaths("/test/**/*.ts");
            const expectedFiles = ["/test/file.ts", "/test/test2/file2.ts", "/test/other/file.ts"].sort();
            expect(project.getSourceFiles().map(s => s.fileName).sort()).to.deep.equal(expectedFiles);
            expect(returnedFiles.map(s => s.fileName).sort()).to.deep.equal(expectedFiles);
        });
    });

    describe(nameof<Project>(p => p.resolveSourceFileDependencies), () => {
        it("should resolve file dependencies once specified and include those in the node_modules folder", () => {
            const { project, initialFiles, resolvedFiles, nodeModuleFiles } = fileDependencyResolutionSetup({ skipFileDependencyResolution: true });
            expect(project.getSourceFiles().map(s => s.fileName)).to.deep.equal([...initialFiles]);
            project.resolveSourceFileDependencies();
            assertProjectHasSourceFilePaths(project, [...initialFiles, ...resolvedFiles, ...nodeModuleFiles]);
        });
    });

    function fileDependencyResolutionSetup(options: ProjectOptions = {}) {
        const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });

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

    describe(nameof<Project>(p => p.formatDiagnosticsWithColorAndContext), () => {
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
            const text = project.formatDiagnosticsWithColorAndContext(ts.getPreEmitDiagnostics(project.createProgram()));
            if (EOL === "\n")
                testForLineFeed(text);
            if (EOL === "\r\n")
                testForCarriageReturnLineFeed(text);
        });

        it("should use line feeds when passed in", () => {
            const project = setup();
            const text = project.formatDiagnosticsWithColorAndContext(ts.getPreEmitDiagnostics(project.createProgram()), { newLineChar: "\n" });
            testForLineFeed(text);
        });

        it("should use carriage return line feeds when passed in", () => {
            const project = setup();
            const text = project.formatDiagnosticsWithColorAndContext(ts.getPreEmitDiagnostics(project.createProgram()), { newLineChar: "\r\n" });
            testForCarriageReturnLineFeed(text);
        });
    });

    describe(nameof<Project>(p => p.getModuleResolutionHost), () => {
        function setup() {
            const project = new Project({ useInMemoryFileSystem: true });
            const moduleResolutionHost = project.getModuleResolutionHost();
            return {
                project,
                fileSystem: project.fileSystem,
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
            project.createSourceFile("/dir/test.ts", "class Test {}");
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
                "/node_modules"
            ]);
        });

        it("should read the directories in a folder combining that with directores that exist in the project", () => {
            const { moduleResolutionHost, fileSystem, project } = setup();
            fileSystem.mkdirSync("/dir1");
            fileSystem.mkdirSync("/dir2");
            project.createSourceFile("/dir3/test.ts");
            expect(moduleResolutionHost.getDirectories!("/")).to.deep.equal([
                "/dir1",
                "/dir2",
                "/dir3",
                "/node_modules"
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

    describe(nameof<Project>(p => p.createProgram), () => {
        it("should create a program and get a type checker", () => {
            const { project } = setup();
            const sourceFile = project.createSourceFile("./test.ts", "export const t = 5;");
            const program = project.createProgram();
            const typeChecker = program.getTypeChecker();
            const symbol = typeChecker.getSymbolAtLocation(sourceFile)!;
            const tExport = symbol.exports!.get(ts.escapeLeadingUnderscores("t"))!;
            expect(tExport.getName()).to.equal("t");
        });
    });

    describe(nameof<Project>(p => p.getLanguageService), () => {
        it("should create a language service", () => {
            const { project } = setup();
            const languageSerivce = project.getLanguageService(); // define it first
            const sourceFile = project.createSourceFile("./test.ts", "const t = 5;");
            const declaration = (sourceFile.statements[0] as ts.VariableStatement).declarationList.declarations[0];
            const result = languageSerivce.findRenameLocations(sourceFile.fileName, declaration.getStart(), false, false)!;
            expect(result.length).to.equal(1);
            expect(result[0].textSpan.start).to.equal(6);
            expect(result[0].textSpan.length).to.equal(1);
        });

        it("should return the same reference each time", () => {
            const { project } = setup();
            expect(project.getLanguageService()).to.equal(project.getLanguageService());
        });
    });

    describe(nameof<Project>(project => project.getSourceFile), () => {
        it("should get the first match based on the directory structure", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("file.ts")!.fileName).to.equal(expectedFile.fileName);
        });

        it("should get the first match based on the directory structure when specifying a dot slash", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("./file.ts")!.fileName).to.equal(expectedFile.fileName);
        });

        it("should get the first match based on the directory structure when using ../", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const expectedFile = project.createSourceFile("dir/file.ts");
            project.createSourceFile("file.ts");
            expect(project.getSourceFile("dir/../dir/file.ts")!.fileName).to.equal(expectedFile.fileName);
        });

        it("should get the first match based on a file name", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            project.createSourceFile("file.ts");
            const expectedFile = project.createSourceFile("dir/file2.ts");
            expect(project.getSourceFile("file2.ts")!.fileName).to.equal(expectedFile.fileName);
        });

        it("should get when specifying an absolute path", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("/file.ts")!.fileName).to.equal(expectedFile.fileName);
        });

        it("should get the first match based on the directory structure when swapping the order of what was created first", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const expectedFile = project.createSourceFile("file.ts");
            project.createSourceFile("dir/file.ts");
            expect(project.getSourceFile("file.ts")!.fileName).to.equal(expectedFile.fileName);
        });
    });

    describe(nameof<Project>(project => project.getSourceFileOrThrow), () => {
        it("should throw when it can't find the source file based on a provided file name", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            expect(() => project.getSourceFileOrThrow("fileName.ts")).to.throw(
                "Could not find source file in project with the provided file name: fileName.ts"
            );
        });

        it("should throw when it can't find the source file based on a provided relative path", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            // this should show the absolute path in the error message
            expect(() => project.getSourceFileOrThrow("src/fileName.ts")).to.throw(
                "Could not find source file in project at the provided path: /src/fileName.ts"
            );
        });

        it("should throw when it can't find the source file based on a provided absolute path", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            expect(() => project.getSourceFileOrThrow("/fileName.ts")).to.throw(
                "Could not find source file in project at the provided path: /fileName.ts"
            );
        });

        it("should throw when it can't find the source file based on a provided condition", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            expect(() => project.getSourceFileOrThrow(() => false)).to.throw(
                "Could not find source file in project based on the provided condition."
            );
        });

        it("should not throw when it finds the file", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            project.createSourceFile("myFile.ts", "");
            expect(project.getSourceFileOrThrow("myFile.ts").fileName).to.contain("myFile.ts");
        });
    });

    function setup() {
        const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true });
        return { project };
    }

    function assertProjectHasSourceFiles(project: Project, sourceFiles: ts.SourceFile[]) {
        expect(project.getSourceFiles().map(s => s.fileName).sort()).to.deep.equal(sourceFiles.map(s => s.fileName).sort());
        expect(project.createProgram().getSourceFiles().map(s => s.fileName).sort()).to.deep.equal(sourceFiles.map(s => s.fileName).sort());
    }

    function assertProjectHasSourceFilePaths(project: Project, sourceFilePaths: string[]) {
        expect(project.getSourceFiles().map(s => s.fileName).sort()).to.deep.equal(sourceFilePaths.sort());
        expect(project.createProgram().getSourceFiles().map(s => s.fileName).sort()).to.deep.equal(sourceFilePaths.sort());
    }
});
