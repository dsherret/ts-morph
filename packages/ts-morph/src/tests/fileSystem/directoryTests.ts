import { expect } from "chai";
import { SourceFile } from "../../compiler";
import { errors, FileUtils, FileSystemHost, CompilerOptions, ModuleResolutionKind, ScriptTarget, ScriptKind } from "@ts-morph/common";
import { Directory, DirectoryCopyOptions, DirectoryEmitResult, DirectoryMoveOptions } from "../../fileSystem";
import { Project } from "../../Project";
import { SourceFileStructure, StructureKind, OptionalKind } from "../../structures";
import { WriterFunction } from "../../types";
import { CustomFileSystemProps, getFileSystemHostWithFiles, testDirectoryTree } from "../testHelpers";

describe(nameof(Directory), () => {
    function getProject(initialFiles: { filePath: string; text: string; }[] = [], initialDirectories: string[] = []) {
        const project = new Project({ useInMemoryFileSystem: true });
        for (const dir of initialDirectories)
            project.createDirectory(dir);
        for (const file of initialFiles)
            project.createSourceFile(file.filePath, file.text);
        return project;
    }

    describe(nameof<Directory>(d => d.getPath), () => {
        function doTest(filePath: string, expectedDirPath: string) {
            const project = getProject();
            const sourceFile = project.createSourceFile(filePath);
            const directory = sourceFile.getDirectory();
            expect(directory.getPath()).to.equal(expectedDirPath);
        }

        it("should get the directory path when just creating a file with no directory", () => {
            doTest("test/file.ts", "/test");
        });

        it("should get the directory path in the root directory", () => {
            doTest("/file.ts", "/");
        });
    });

    describe(nameof<Directory>(d => d.getDirectories), () => {
        it("should return directories regardless of whether they are in the project", () => {
            const project = getProject();
            const dir = project.createDirectory("dir");
            const subDir = dir.createDirectory("subDir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
            expect(dir.getDirectories().map(d => d.getPath())).to.deep.equal(["/dir/subDir"]);
        });
    });

    describe(nameof<Directory>(d => d.getSourceFiles), () => {
        it("should return source files regardless of whether they are in the project", () => {
            const project = getProject();
            const dir = project.createDirectory("dir");
            const file = dir.createSourceFile("file.ts");
            project._context.inProjectCoordinator.setSourceFileNotInProject(file);
            expect(dir.getSourceFiles().map(f => f.getFilePath())).to.deep.equal(["/dir/file.ts"]);
        });
    });

    describe("ancestor/descendant tests", () => {
        const project = getProject();
        const root = project.addDirectoryAtPath("");
        const child = project.createDirectory("child");
        const childChild = project.createDirectory("child/child");
        const otherChild = project.createDirectory("otherChild");
        const rootSourceFile = project.createSourceFile("file.ts");

        describe(nameof<Directory>(d => d.isAncestorOf), () => {
            function doTest(ancestor: Directory, descendant: Directory | SourceFile, expectedValue: boolean) {
                expect(ancestor.isAncestorOf(descendant)).to.equal(expectedValue);
            }

            it("should be an ancestor when is parent", () => {
                doTest(root, child, true);
            });

            it("should be an ancestor when is ancestor", () => {
                doTest(root, childChild, true);
            });

            it("should not be when a sibling", () => {
                doTest(child, otherChild, false);
            });

            it("should not be when a child", () => {
                doTest(child, root, false);
            });

            it("should be when a parent dir of a source file", () => {
                doTest(root, rootSourceFile, true);
            });
        });

        describe(nameof<Directory>(d => d.isDescendantOf), () => {
            function doTest(descendant: Directory, ancestor: Directory, expectedValue: boolean) {
                expect(descendant.isDescendantOf(ancestor)).to.equal(expectedValue);
            }

            it("should be a descendant when is child", () => {
                doTest(child, root, true);
            });

            it("should be a descendant when is descendant", () => {
                doTest(childChild, root, true);
            });

            it("should not be when a sibling", () => {
                doTest(otherChild, child, false);
            });

            it("should not be when a parent", () => {
                doTest(root, child, false);
            });
        });
    });

    describe("getting parent, child directories, and source files in directory", () => {
        it("should not have a parent loaded initially, but should then load it on request", () => {
            const project = getProject();
            const sourceFile = project.createSourceFile("directory/file.ts");
            const directory = sourceFile.getDirectory();
            expect(directory._hasLoadedParent()).to.be.false;
            expect(directory.getParent()).to.not.be.undefined;
            expect(directory._hasLoadedParent()).to.be.true;
        });

        it("should get the files in the alphabetical order", () => {
            const project = getProject();
            const directory = project.addDirectoryAtPath("");
            directory.createSourceFile("D.ts");
            directory.createSourceFile("b.ts");
            directory.createSourceFile("a.ts");
            directory.createSourceFile("C.ts");
            expect(directory.getSourceFiles().map(s => s.getBaseName())).to.deep.equal(["a.ts", "b.ts", "C.ts", "D.ts"]);
        });

        it("should get the directories in alphabetical order", () => {
            const project = getProject();
            const directory = project.addDirectoryAtPath("");
            directory.createDirectory("D");
            directory.createDirectory("b");
            directory.createDirectory("a");
            directory.createDirectory("C");
            expect(directory.getDirectories().map(s => s.getBaseName())).to.deep.equal(["a", "b", "C", "D"]);
        });

        it("should have a parent when a file exists in an ancestor folder", () => {
            const project = getProject();
            const sourceFile = project.createSourceFile("file.ts");
            const lowerSourceFile = project.createSourceFile("dir1/dir2/file.ts");

            testDirectoryTree(sourceFile.getDirectory(), {
                directory: sourceFile.getDirectory(),
                sourceFiles: [sourceFile],
                children: [{
                    directory: project.getDirectoryOrThrow("dir1"),
                    children: [{
                        directory: project.getDirectoryOrThrow("dir1/dir2"),
                        sourceFiles: [lowerSourceFile]
                    }]
                }]
            });
        });

        it("should get the child directories", () => {
            const project = getProject();
            const file1 = project.createSourceFile("file1.ts");
            const file2 = project.createSourceFile("dir1/file2.ts");
            const file3 = project.createSourceFile("dir2/file3.ts");

            testDirectoryTree(file1.getDirectory(), {
                directory: file1.getDirectory(),
                sourceFiles: [file1],
                children: [{
                    directory: file2.getDirectory(),
                    sourceFiles: [file2]
                }, {
                    directory: file3.getDirectory(),
                    sourceFiles: [file3]
                }]
            });
        });

        it("should have the correct child directories after creating a file in a parent directory of multiple directories", () => {
            const project = getProject();
            const file2 = project.createSourceFile("dir1/file2.ts");
            const file3 = project.createSourceFile("dir2/file3.ts");
            const file1 = project.createSourceFile("file1.ts");

            testDirectoryTree(file1.getDirectory(), {
                directory: file1.getDirectory(),
                sourceFiles: [file1],
                children: [{
                    directory: file2.getDirectory(),
                    sourceFiles: [file2]
                }, {
                    directory: file3.getDirectory(),
                    sourceFiles: [file3]
                }]
            });
        });

        it("should get the directories at the root level", () => {
            const project = getProject();
            const file1 = project.createSourceFile("V:/file1.ts");
            const file2 = project.createSourceFile("V:/file2.ts");
            const file3 = project.createSourceFile("V:/dir1/file2.ts");

            testDirectoryTree(file1.getDirectory(), {
                directory: file1.getDirectory(),
                sourceFiles: [file1, file2],
                children: [{
                    directory: file3.getDirectory(),
                    sourceFiles: [file3]
                }]
            });
        });
    });

    describe(nameof<Directory>(d => d.getParent), () => {
        const project = getProject();
        const sourceFile = project.createSourceFile("/dir/file.ts");
        const dir = sourceFile.getDirectory();

        it("should get the parent when there's a parent", () => {
            expect(dir.getParent()!.getPath()).to.equal("/");
        });

        it("should be undefined for the root directory", () => {
            expect(dir.getParentOrThrow().getParent()).to.be.undefined;
        });
    });

    describe(nameof<Directory>(d => d.getParentOrThrow), () => {
        const project = getProject();
        const sourceFile = project.createSourceFile("/file.ts");
        const rootDir = sourceFile.getDirectory();
        const dir = rootDir.createDirectory("dir");

        it("should get the parent when there's a parent", () => {
            expect(dir.getParentOrThrow().getPath()).to.equal(rootDir.getPath());
        });

        it("should throw when there's no parent", () => {
            expect(() => rootDir.getParentOrThrow()).to.throw();
        });
    });

    describe(nameof<Directory>(d => d.getDescendantSourceFiles), () => {
        it("should get all the descendant source files", () => {
            const project = getProject();
            const sourceFiles = [
                project.createSourceFile("someDir/inSomeFile/more/test.ts"),
                project.createSourceFile("someDir/otherDir/deeper/test.ts"),
                project.createSourceFile("someDir/test.ts"),
                project.createSourceFile("someDir/childDir/deeper/test.ts"),
                project.createSourceFile("final.ts")
            ];

            const finalFile = project.getSourceFileOrThrow("final.ts");
            expect(finalFile.getDirectory().getDescendantSourceFiles().map(s => s.getFilePath()).sort())
                .to.deep.equal(sourceFiles.map(s => s.getFilePath()).sort());
        });
    });

    describe(nameof<Directory>(d => d.getDescendantDirectories), () => {
        it("should get all the descendant directories", () => {
            const project = getProject();
            const rootDir = project.addDirectoryAtPath("");
            const directories = [
                rootDir.createDirectory("someDir"),
                rootDir.createDirectory("someDir/inSomeFile"),
                rootDir.createDirectory("someDir/inSomeFile/more"),
                rootDir.createDirectory("someDir/otherDir"),
                rootDir.createDirectory("someDir/otherDir/deeper"),
                rootDir.createDirectory("someDir/test"),
                rootDir.createDirectory("someDir/childDir")
            ];

            expect(rootDir.getDescendantDirectories().map(d => d.getPath()).sort()).to.deep.equal(directories.map(d => d.getPath()).sort());
        });
    });

    describe(nameof<Directory>(d => d.createSourceFile), () => {
        function doTest(input: string | OptionalKind<SourceFileStructure> | WriterFunction | undefined, expectedText: string) {
            const project = getProject();
            const directory = project.createDirectory("dir");
            let sourceFile: SourceFile;
            if (typeof input === "undefined")
                sourceFile = directory.createSourceFile("sourceFile.ts");
            else if (typeof input === "string")
                sourceFile = directory.createSourceFile("sourceFile.ts", input);
            else
                sourceFile = directory.createSourceFile("sourceFile.ts", input);
            expect(directory.getSourceFiles()).to.deep.equal([sourceFile]);
            expect(sourceFile.getFilePath()).to.equal("/dir/sourceFile.ts");
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.Latest);
        }

        it("should create a source file in the directory when specifying no text or structure", () => {
            doTest(undefined, "");
        });

        it("should create a source file in the directory when specifying text", () => {
            const code = "const t = 34;";
            doTest(code, code);
        });

        it("should create a source file in the directory when specifying a writer function", () => {
            doTest(writer => writer.writeLine("enum MyEnum {}"), "enum MyEnum {}\n");
        });

        it("should create a source file in the directory when specifying a structure", () => {
            doTest({ statements: [{ kind: StructureKind.Enum, name: "MyEnum" }] }, "enum MyEnum {\n}\n");
        });

        it("should throw an exception if creating a source file at an existing path on the disk", () => {
            const project = getProject([{ filePath: "/file.ts", text: "" }]);
            const directory = project.addDirectoryAtPath("/");
            expect(() => directory.createSourceFile("file.ts", "")).to.throw(errors.InvalidOperationError);
        });

        it("should not throw an exception if creating a source file at an existing path on the disk and providing the overwrite option", () => {
            const project = getProject([{ filePath: "/file.ts", text: "" }]);
            const directory = project.addDirectoryAtPath("/");
            const fileText = "class Identifier {}";
            const file = directory.createSourceFile("file.ts", fileText, { overwrite: true });
            expect(file.getFullText()).to.equal(fileText);
        });

        it("should add the created source file to the project when the directory is in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            const sourceFile = dir.createSourceFile("file.ts");
            expect(sourceFile._isInProject()).to.be.true;
        });

        it("should not add the created source file to the project when the directory is not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const sourceFile = dir.createSourceFile("file.ts");
            expect(sourceFile._isInProject()).to.be.false;
        });

        it("should not add the created source file to the project when the directory is not in the project and adding to a dir in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const sourceFile = dir.createSourceFile("/file.ts");
            expect(sourceFile._isInProject()).to.be.false;
        });

        it("should be able to specify a script kind", () => {
            // people should not be using markdown files in here... adding tests anyway...
            const directory = new Project({ useInMemoryFileSystem: true }).createDirectory("/dir");
            const sourceFile = directory.createSourceFile("MyFile.md", "# Header", { scriptKind: ScriptKind.External });
            expect(sourceFile.getScriptKind()).to.equal(ScriptKind.External);

            // should work after manipulation
            sourceFile.replaceWithText("# New Header");
            expect(sourceFile.getScriptKind()).to.equal(ScriptKind.External);
        });
    });

    describe(nameof<Directory>(d => d.addSourceFileAtPathIfExists), () => {
        it("should return undefined if adding a source file at a non-existent path", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ fileSystem });
            const directory = project.createDirectory("dir");
            expect(directory.addSourceFileAtPathIfExists("non-existent-file.ts")).to.be.undefined;
        });

        it("should add a source file that exists", () => {
            const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir"]);
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            const sourceFile = directory.addSourceFileAtPathIfExists("file.ts");
            expect(sourceFile).to.not.be.undefined;
            expect(sourceFile!.getLanguageVersion()).to.equal(ScriptTarget.Latest);
        });
    });

    describe(nameof<Directory>(d => d.addSourceFileAtPath), () => {
        it("should throw an exception if adding a source file at a non-existent path", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ fileSystem });
            const directory = project.createDirectory("dir");
            expect(() => {
                directory.addSourceFileAtPath("non-existent-file.ts");
            }).to.throw(errors.FileNotFoundError, `File not found: /dir/non-existent-file.ts`);
        });

        it("should add a source file that exists", () => {
            const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir"]);
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            const sourceFile = directory.addSourceFileAtPath("file.ts");
            expect(sourceFile).to.not.be.undefined;
            expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.Latest);
        });
    });

    describe(nameof<Directory>(d => d.addSourceFilesAtPaths), () => {
        const fileSystem = getFileSystemHostWithFiles([{ filePath: "otherDir/file.ts", text: "" }, { filePath: "dir/dir1/dir1/file.ts", text: "" }],
            ["dir", "dir/dir1", "dir/dir2", "dir/dir1/dir1", "otherDir"]);

        it("should add source files by a relative file glob", () => {
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            const sourceFiles = directory.addSourceFilesAtPaths("**/*.ts");
            expect(sourceFiles.map(s => s.getFilePath())).to.deep.equal(["/dir/dir1/dir1/file.ts"]);
        });

        it("should add source files by multiple file globs", () => {
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            const sourceFiles = directory.addSourceFilesAtPaths(["**/*.ts", "../**/*.ts"]);
            expect(sourceFiles.map(s => s.getFilePath())).to.deep.equal(["/dir/dir1/dir1/file.ts", "/otherDir/file.ts"]);
        });

        it("should add source files by an absolute file glob", () => {
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            const sourceFiles = directory.addSourceFilesAtPaths("/otherDir/**/*.ts");
            expect(sourceFiles.map(s => s.getFilePath())).to.deep.equal(["/otherDir/file.ts"]);
        });
    });

    describe(nameof<Directory>(d => d.createDirectory), () => {
        describe("common", () => {
            const project = getProject([], ["childDir"]);
            const directory = project.createDirectory("some/path");
            directory.createDirectory("child");
            directory.createDirectory("../../dir/other/deep/path");
            directory.createDirectory("../../dir/other");

            it("should have created the directories in the first area", () => {
                testDirectoryTree(project.getDirectoryOrThrow("some/path"), {
                    directory: project.getDirectoryOrThrow("some/path"),
                    children: [{
                        directory: project.getDirectoryOrThrow("some/path/child")
                    }]
                });
            });

            it("should have created the directories in the second area", () => {
                testDirectoryTree(project.getDirectoryOrThrow("dir/other"), {
                    directory: project.getDirectoryOrThrow("dir/other"),
                    children: [{
                        directory: project.getDirectoryOrThrow("dir/other/deep"),
                        children: [{
                            directory: project.getDirectoryOrThrow("dir/other/deep/path")
                        }]
                    }]
                });
            });

            it("should not throw when a directory already exists at the specified path", () => {
                expect(() => directory.createDirectory("child")).to.not.throw();
            });

            it("should not throw when a directory already exists on the file system at the specified path", () => {
                expect(() => project.addDirectoryAtPath("/").createDirectory("childDir")).to.not.throw();
            });
        });

        it("should make the created directory in the project when the current directory is", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            const subDir = dir.createDirectory("subDir");
            expect(subDir._isInProject()).to.be.true;
        });

        it("should not make the created directory in the project when the current directory is not", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const subDir = dir.createDirectory("subDir");
            expect(subDir._isInProject()).to.be.false;
        });

        it("should not make the directory in the project when specifying an existing directory not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            const subDir = dir.createDirectory("subDir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            expect(subDir._isInProject()).to.be.false;
            dir.createDirectory("subDir");
            expect(subDir._isInProject()).to.be.false;
        });

        it("should not make the directory in the project when creating a directory in a directory within the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const otherDir = dir.createDirectory("/otherDir");
            expect(otherDir._isInProject()).to.be.false;
        });
    });

    describe(nameof<Directory>(d => d.addDirectoryAtPathIfExists), () => {
        it("should return undefined when the directory doesn't exist", () => {
            const fileSystem = getFileSystemHostWithFiles([], ["dir"]);
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            expect(directory.addDirectoryAtPathIfExists("someDir")).to.be.undefined;
        });

        it("should add a directory relative to the specified directory", () => {
            const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir", "dir2", "dir/child"]);
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            expect(directory.addDirectoryAtPathIfExists("child")).to.equal(project.getDirectoryOrThrow("dir/child"));
            expect(directory.addDirectoryAtPathIfExists("../dir2")).to.equal(project.getDirectoryOrThrow("dir2"));

            testDirectoryTree(directory.getParentOrThrow(), {
                directory: directory.getParentOrThrow(),
                children: [{
                    directory,
                    children: [{ directory: project.getDirectoryOrThrow("dir/child") }]
                }, {
                    directory: project.getDirectoryOrThrow("dir2")
                }]
            });
        });

        it("should add a directory and all its descendant directories when specifying the recursive option", () => {
            const directories = ["/", "dir", "dir/child1", "dir/child2", "dir/child1/grandChild1"];
            const project = new Project({ useInMemoryFileSystem: true });
            directories.forEach(d => project.getFileSystem().mkdirSync(d));
            const rootDir = project.addDirectoryAtPath("/");
            expect(rootDir.addDirectoryAtPathIfExists("dir", { recursive: true })).to.equal(project.getDirectoryOrThrow("dir"));

            testDirectoryTree(project.getDirectoryOrThrow("dir"), {
                directory: project.getDirectoryOrThrow("dir"),
                children: [{
                    directory: project.getDirectoryOrThrow("dir/child1"),
                    children: [{ directory: project.getDirectoryOrThrow("dir/child1/grandChild1") }]
                }, {
                    directory: project.getDirectoryOrThrow("dir/child2")
                }]
            }, project.getDirectoryOrThrow("/"));
        });

        it("should add to project when current dir is in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            dir.createDirectory("subDir").forget();
            const subDir = dir.addDirectoryAtPathIfExists("subDir")!;
            expect(subDir._isInProject()).to.be.true;
        });

        it("should not add to project when current dir is not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            dir.createDirectory("subDir").forget();
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const subDir = dir.addDirectoryAtPathIfExists("subDir")!;
            expect(subDir._isInProject()).to.be.false;
        });

        it("should add to project when current dir is in the project, but the added one isn't", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir.createDirectory("subDir"));
            const subDir = dir.addDirectoryAtPathIfExists("subDir")!;
            expect(subDir._isInProject()).to.be.true;
        });
    });

    describe(nameof<Directory>(d => d.addDirectoryAtPath), () => {
        it("should throw when the directory doesn't exist", () => {
            const fileSystem = getFileSystemHostWithFiles([], ["dir"]);
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            expect(() => directory.addDirectoryAtPath("someDir")).to.throw(errors.DirectoryNotFoundError);
        });

        it("should add a directory relative to the specified directory", () => {
            const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir", "dir2", "dir/child"]);
            const project = new Project({ fileSystem });
            const directory = project.addDirectoryAtPath("dir");
            expect(directory.addDirectoryAtPath("child")).to.equal(project.getDirectoryOrThrow("dir/child"));
            expect(directory.addDirectoryAtPath("../dir2")).to.equal(project.getDirectoryOrThrow("dir2"));
        });

        it("should add a directory and all its descendant directories when specifying the recursive option", () => {
            const directories = ["/", "dir", "dir/child1", "dir/child2", "dir/child1/grandChild1"];
            const project = new Project({ useInMemoryFileSystem: true });
            directories.forEach(d => project.getFileSystem().mkdirSync(d));
            const rootDir = project.addDirectoryAtPath("/");
            expect(rootDir.addDirectoryAtPath("dir", { recursive: true })).to.equal(project.getDirectoryOrThrow("dir"));

            testDirectoryTree(project.getDirectoryOrThrow("dir"), {
                directory: project.getDirectoryOrThrow("dir"),
                children: [{
                    directory: project.getDirectoryOrThrow("dir/child1"),
                    children: [{ directory: project.getDirectoryOrThrow("dir/child1/grandChild1") }]
                }, {
                    directory: project.getDirectoryOrThrow("dir/child2")
                }]
            }, project.getDirectoryOrThrow("/"));
        });

        it("should add to project when current dir is in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            dir.createDirectory("subDir").forget();
            const subDir = dir.addDirectoryAtPath("subDir");
            expect(subDir._isInProject()).to.be.true;
        });

        it("should not add to project when current dir is not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            dir.createDirectory("subDir").forget();
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const subDir = dir.addDirectoryAtPath("subDir");
            expect(subDir._isInProject()).to.be.false;
        });

        it("should add to project when current dir is in the project, but the added one isn't", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir.createDirectory("subDir"));
            const subDir = dir.addDirectoryAtPath("subDir");
            expect(subDir._isInProject()).to.be.true;
        });
    });

    describe(nameof<Directory>(d => d.getDirectory), () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const directory = project.createDirectory("dir");
        const child1 = directory.createDirectory("child1");
        const child2 = directory.createDirectory("child2");
        const grandChild1 = child1.createDirectory("grandChild1");

        it("should get the directory based on the name", () => {
            expect(directory.getDirectory("child2")!.getPath()).to.equal(child2.getPath());
        });

        it("should get the directory based on the relative path", () => {
            expect(directory.getDirectory("child1/grandChild1")!.getPath()).to.equal(grandChild1.getPath());
        });

        it("should get the directory based on the absolute path", () => {
            expect(directory.getDirectory(grandChild1.getPath())!.getPath()).to.equal(grandChild1.getPath());
        });

        it("should get the directory based on a condition", () => {
            expect(directory.getDirectory(d => FileUtils.getBaseName(d.getPath()) === "child2")!.getPath()).to.equal(child2.getPath());
        });

        it("should not get the directory when it doesn't exist", () => {
            expect(directory.getDirectory("child3")).to.be.undefined;
        });
    });

    describe(nameof<Directory>(d => d.getDirectoryOrThrow), () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const directory = project.createDirectory("dir");
        const child1 = directory.createDirectory("child1");
        const child2 = directory.createDirectory("child2");

        it("should get the directory based on the name", () => {
            expect(directory.getDirectoryOrThrow("child2").getPath()).to.equal(child2.getPath());
        });

        it("should get the directory based on a condition", () => {
            expect(directory.getDirectoryOrThrow(d => FileUtils.getBaseName(d.getPath()) === "child2").getPath()).to.equal(child2.getPath());
        });

        it("should throw when it doesn't exist", () => {
            expect(() => directory.getDirectoryOrThrow("child3")).to.throw();
        });

        it("should throw when the condition doesn't match", () => {
            expect(() => directory.getDirectoryOrThrow(d => false)).to.throw();
        });
    });

    describe(nameof<Directory>(d => d.getSourceFile), () => {
        const project = getProject();
        const directory = project.createDirectory("dir");
        const existingFile = directory.createSourceFile("existing-file.ts");
        existingFile.saveSync();
        existingFile.forget();
        const child1 = directory.createSourceFile("child1.ts");
        const child2 = directory.createSourceFile("child2.ts");
        const subDir = directory.createDirectory("subDir");
        const child3 = subDir.createSourceFile("child3.ts");

        it("should not return a file that doesn't exist internally", () => {
            expect(directory.getSourceFile("existing-file.ts")).to.be.undefined;
        });

        it("should get based on the name", () => {
            expect(directory.getSourceFile("child2.ts")!.getFilePath()).to.equal(child2.getFilePath());
        });

        it("should get based on the path", () => {
            expect(directory.getSourceFile("subDir/child3.ts")!.getFilePath()).to.equal(child3.getFilePath());
        });

        it("should get based on a condition", () => {
            expect(directory.getSourceFile(f => FileUtils.getBaseName(f.getFilePath()) === "child2.ts")!.getFilePath()).to.equal(child2.getFilePath());
        });

        it("should return undefined when it doesn't exist", () => {
            expect(directory.getSourceFile("child3.ts")).to.be.undefined;
        });

        it("should throw when the condition doesn't match", () => {
            expect(directory.getSourceFile(s => false)).to.be.undefined;
        });
    });

    describe(nameof<Directory>(d => d.getSourceFileOrThrow), () => {
        const project = getProject();
        const directory = project.createDirectory("dir");
        const child1 = directory.createSourceFile("child1.ts");
        const child2 = directory.createSourceFile("child2.ts");
        const subDir = directory.createDirectory("subDir");
        const child3 = subDir.createSourceFile("child3.ts");

        it("should get based on the name", () => {
            expect(directory.getSourceFileOrThrow("child2.ts").getFilePath()).to.equal(child2.getFilePath());
        });

        it("should get based on the path", () => {
            expect(directory.getSourceFileOrThrow("subDir/child3.ts").getFilePath()).to.equal(child3.getFilePath());
        });

        it("should get based on a condition", () => {
            expect(directory.getSourceFileOrThrow(f => FileUtils.getBaseName(f.getFilePath()) === "child2.ts").getFilePath()).to.equal(child2.getFilePath());
        });

        it("should throw when it doesn't exist", () => {
            expect(() => directory.getSourceFileOrThrow("child3.ts")).to.throw();
        });

        it("should throw when the condition doesn't match", () => {
            expect(() => directory.getSourceFileOrThrow(s => false)).to.throw();
        });
    });

    describe(nameof<Directory>(d => d.copy), () => {
        it("should copy a directory to a new directory", () => {
            const project = getProject();
            const mainDir = project.createDirectory("mainDir");
            const dir = mainDir.createDirectory("dir");
            dir.createSourceFile("file.ts");
            dir.createDirectory("dir2").createDirectory("nested").createSourceFile("file2.ts");

            const newDir = dir.copy("../newDir");
            expect(newDir.getPath()).to.equal(FileUtils.pathJoin(mainDir.getPath(), newDir.getBaseName()));
            testDirectoryTree(newDir, {
                directory: newDir,
                sourceFiles: [project.getSourceFileOrThrow("mainDir/newDir/file.ts")],
                children: [{
                    directory: project.getDirectoryOrThrow("mainDir/newDir/dir2"),
                    children: [{
                        directory: project.getDirectoryOrThrow("mainDir/newDir/dir2/nested"),
                        sourceFiles: [project.getSourceFileOrThrow("mainDir/newDir/dir2/nested/file2.ts")]
                    }]
                }]
            }, mainDir);
        });

        it("should copy a directory to an existing directory", () => {
            const project = getProject();
            const mainDir = project.createDirectory("mainDir");
            const dir = mainDir.createDirectory("dir");
            dir.createSourceFile("file.ts");
            dir.createDirectory("child");
            const newDir = mainDir.createDirectory("newDir");
            const copyDir = dir.copy(newDir.getPath());

            expect(copyDir).to.equal(newDir, "returned directory should equal the existing directory");
            testDirectoryTree(copyDir, {
                directory: copyDir,
                sourceFiles: [project.getSourceFileOrThrow("mainDir/newDir/file.ts")],
                children: [{
                    directory: project.getDirectoryOrThrow("mainDir/newDir/child")
                }]
            }, mainDir);
        });

        it("should include the other files in the directory when specifying to", () => {
            const project = getProject([{ filePath: "/dir/file.ts", text: "" }]);
            const fileSystem = project.getFileSystem();
            const dir = project.getDirectoryOrThrow("dir");
            fileSystem.writeFileSync("/dir/otherFile.txt", "test");
            dir.copy("/dir1", { includeUntrackedFiles: false });
            dir.copy("/dir2", {});
            dir.copy("/dir3", { includeUntrackedFiles: true });
            project.saveSync();

            expect(fileSystem.fileExistsSync("/dir1/otherFile.txt")).to.be.false;
            expect(fileSystem.fileExistsSync("/dir2/otherFile.txt")).to.be.true;
            expect(fileSystem.fileExistsSync("/dir3/otherFile.txt")).to.be.true;
            expect(fileSystem.readFileSync("/dir3/otherFile.txt")).to.equal("test");
        });

        it("should not throw when copying a directory to an existing directory on the file system", () => {
            const project = getProject([], ["mainDir/newDir"]);
            const mainDir = project.createDirectory("mainDir");
            const dir = mainDir.createDirectory("dir");
            dir.createSourceFile("file.ts");
            expect(() => dir.copy("../newDir")).to.not.throw();
        });

        it("should throw when copying a directory to an existing directory and a file exists in the other one", () => {
            const project = getProject([]);
            const dir = project.createDirectory("dir");
            dir.createDirectory("subDir").createSourceFile("file.ts");
            dir.createSourceFile("file.ts");
            dir.copy("../newDir");
            expect(() => dir.copy("../newDir")).to.throw();
        });

        it("should not throw when copying a directory to an existing directory with the overwrite option and a file exists in the other one", () => {
            const project = getProject([]);
            const dir = project.createDirectory("dir");
            dir.createSourceFile("file.ts");
            dir.copy("../newDir");
            expect(() => dir.copy("../newDir", { overwrite: true })).to.not.throw();
        });

        it("should correctly update the references when copying", () => {
            const project = getProject();
            const dirFileText = "export default class Identifier {}\nexport * from './subDir/file2';";
            const dirFile = project.createSourceFile("dir/file.ts", dirFileText);
            const dirSubDirFileText = "import Identifier from '../file';\nimport { File2 } from './file2';";
            const dirSubDirFile = project.createSourceFile("dir/subDir/file.ts", dirSubDirFileText);
            const dirSubDirFile2 = project.createSourceFile("dir/subDir/file2.ts", "export class File2 {}");
            const subDir = project.getDirectoryOrThrow("dir/subDir");

            const newDir = subDir.copy("../child/grand");

            // should not have changed the existing files
            expect(dirFile.getFullText()).to.equal(dirFileText);
            expect(dirSubDirFile.getFullText()).to.equal(dirSubDirFileText);

            // should have updated the reference inside
            expect(newDir.getSourceFileOrThrow("file.ts").getFullText()).to.equal("import Identifier from '../../file';\nimport { File2 } from './file2';");
        });

        it("should not throw if saving the directory after copying while not including tracked files", () => {
            const project = getProject([{ filePath: "/dir/file.txt", text: "" }]);
            const dir = project.getDirectoryOrThrow("dir");
            const dir2 = dir.copy("./dir2", { includeUntrackedFiles: false });
            expect(() => dir2.saveSync()).to.not.throw();
        });

        it("should throw if saving the directory after copying while including tracked files", () => {
            const project = getProject([{ filePath: "/dir/file.txt", text: "" }]);
            const dir = project.getDirectoryOrThrow("dir");
            const dir2 = dir.copy("./dir2");
            // not supported for the time being... it's complicated
            expect(() => dir2.saveSync()).to.throw(errors.InvalidOperationError);
        });

        it("should be in the project when copying from a directory in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            const newDir = dir.copy("/otherDir");
            expect(newDir._isInProject()).to.be.true;
        });

        it("should be in the project when copying from a directory in the project to a directory not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            const otherDir = project.createDirectory("/otherDir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(otherDir);
            const newDir = dir.copy("/otherDir");
            expect(newDir._isInProject()).to.be.true;
            expect(otherDir._isInProject()).to.be.true;
        });

        it("should not be in the project when copying from a directory not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const newDir = dir.copy("/otherDir");
            expect(newDir._isInProject()).to.be.false;
        });

        it("should not be in the project when copying from a directory not in the project to a directory not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            project.createDirectory("/dir2");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const newDir = dir.copy("/dir2/dir");
            expect(newDir._isInProject()).to.be.false;
        });

        it("should have descendants not in project when copying from a directory not in the project to overwrite a directory in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            const otherDir = dir.createDirectory("/dir/otherDir");
            otherDir.createDirectory("subDir");
            otherDir.createSourceFile("file.ts");
            project.createDirectory("/otherDir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const newDir = otherDir.copy("/otherDir");

            expect(newDir._isInProject()).to.be.true;
            expect(newDir.getDirectoryOrThrow("subDir")._isInProject()).to.be.false;
            expect(newDir.getSourceFileOrThrow("file.ts")._isInProject()).to.be.false;
            expect(dir._isInProject()).to.be.false;
        });
    });

    describe(nameof<Directory>(dir => dir.copyToDirectory), () => {
        it("should copy when specifying an absolute path", () => {
            const project = getProject();
            const dir = project.createDirectory("dir/temp");
            expect(dir.copyToDirectory("/otherDir").getPath()).to.equal("/otherDir/temp");
        });

        it("should copy when specifying a relative path", () => {
            const project = getProject();
            const dir = project.createDirectory("dir/temp");
            expect(dir.copyToDirectory("../otherDir").getPath()).to.equal("/dir/otherDir/temp");
        });

        it("should copy when specifying a directory", () => {
            const project = getProject();
            const dir = project.createDirectory("dir/temp");
            const otherDir = project.createDirectory("otherDir");
            expect(dir.copyToDirectory(otherDir).getPath()).to.equal("/otherDir/temp");
        });

        it("should copy with overwrite", () => {
            const project = getProject();
            project.createSourceFile("/dir/temp/file.ts");
            project.createSourceFile("/otherDir/temp/file.ts");
            const dir = project.getDirectoryOrThrow("/dir/temp");
            const newDir = dir.copyToDirectory("/otherDir", { overwrite: true });
            expect(newDir.getPath()).to.equal("/otherDir/temp");
        });
    });

    describe(nameof<Directory>(dir => dir.move), () => {
        it("should move all the files and sub directories to a new directory", () => {
            const project = getProject();
            const fileSystem = project.getFileSystem();
            const dirFile = project.createSourceFile("dir/file.ts", "export default class Identifier {}\nexport * from './subDir/file2';");
            const dirSubDirFile = project.createSourceFile("dir/subDir/file.ts", "import Identifier from '../file';\nimport { File2 } from './file2';");
            const dirSubDirFile2 = project.createSourceFile("dir/subDir/file2.ts", "export class File2 {}");
            const subDir = project.getDirectoryOrThrow("dir/subDir");

            project.saveSync();
            subDir.move("../child/grand");

            expect(dirFile.getFilePath()).to.equal("/dir/file.ts");
            expect(dirSubDirFile.getFilePath()).to.equal("/dir/child/grand/file.ts");
            expect(dirSubDirFile2.getFilePath()).to.equal("/dir/child/grand/file2.ts");

            testDirectoryTree(project.getDirectoryOrThrow("dir"), {
                directory: project.getDirectoryOrThrow("dir"),
                sourceFiles: [dirFile],
                children: [{
                    directory: project.getDirectoryOrThrow("dir/child"),
                    children: [{
                        directory: subDir,
                        sourceFiles: [dirSubDirFile, dirSubDirFile2]
                    }]
                }]
            });

            expect(dirFile.getFullText()).to.equal("export default class Identifier {}\nexport * from './child/grand/file2';");
            expect(dirSubDirFile.getFullText()).to.equal("import Identifier from '../../file';\nimport { File2 } from './file2';");
            testStructure(true);
            project.saveSync();
            testStructure(false);

            function testStructure(isBeforeSave: boolean) {
                expect(fileSystem.directoryExistsSync("/dir/subDir")).to.equal(isBeforeSave, "/dir/subDir");
                expect(fileSystem.fileExistsSync("/dir/subDir/file.ts")).to.equal(isBeforeSave, "/dir/subDir/file.ts");
                expect(fileSystem.fileExistsSync("/dir/subDir/file2.ts")).to.equal(isBeforeSave, "/dir/subDir/file2.ts");
                expect(fileSystem.directoryExistsSync("/dir/child")).to.equal(!isBeforeSave, "/dir/child");
                expect(fileSystem.directoryExistsSync("/dir/child/grand")).to.equal(!isBeforeSave, "/dir/child/grand");
                expect(fileSystem.fileExistsSync("/dir/child/grand/file.ts")).to.equal(!isBeforeSave, "/dir/child/grand/file.ts");
                expect(fileSystem.fileExistsSync("/dir/child/grand/file2.ts")).to.equal(!isBeforeSave, "/dir/child/grand/file2.ts");
            }
        });

        it("should merge two directories", () => {
            const project = getProject();
            const file1 = project.createSourceFile("dir/file1.ts", "");
            const file2 = project.createSourceFile("dir2/file2.ts", "");
            const originalDir = file1.getDirectory();
            const dir = file2.getDirectory().move("./dir");

            testDirectoryTree(dir, {
                directory: dir,
                sourceFiles: [file1, file2]
            });

            expect(originalDir.wasForgotten()).to.be.true;
            expect(file1.getDirectory()).to.equal(file2.getDirectory());
        });

        it("should throw when merging a directory and the same file exists inside", () => {
            const project = getProject();
            project.createSourceFile("dir/file.ts", "");
            project.createSourceFile("dir2/file.ts", "");
            expect(() => project.getDirectoryOrThrow("dir2").move("./dir")).to.throw(errors.InvalidOperationError);
        });

        it("should not throw when merging a directory and the same file exists inside and the overwrite option is provided", () => {
            const project = getProject();
            const originalFile = project.createSourceFile("dir/file.ts", "");
            const originalDir = originalFile.getDirectory();
            const newFile = project.createSourceFile("dir2/file.ts", "");
            const newDir = newFile.getDirectory();
            expect(() => newDir.move("./dir", { overwrite: true })).to.not.throw();
            // unfortunate, but there's no way to update the originalFile and dir reference to the new one in JS
            expect(originalFile.wasForgotten()).to.be.true;
            expect(originalDir.wasForgotten()).to.be.true;
            expect(newFile.wasForgotten()).to.be.false;
            expect(newDir.wasForgotten()).to.be.false;
        });

        it("should update the root dirs", () => {
            const project = getProject();
            const dirFile = project.createSourceFile("dir/file.ts", "");
            dirFile.getDirectory().move("./dir2");
            expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal(["/dir2"]);
        });

        it("should be in the project when moving from a directory in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            const newDir = dir.move("/otherDir");
            expect(newDir._isInProject()).to.be.true;
        });

        it("should be in the project when copying from a directory in the project to a directory not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            const otherDir = project.createDirectory("/otherDir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(otherDir);
            const newDir = dir.move("/otherDir", { overwrite: true });
            expect(newDir._isInProject()).to.be.true;
        });

        it("should not be in the project when moving from a directory not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const newDir = dir.move("/otherDir");
            expect(newDir._isInProject()).to.be.false;
        });

        it("should not be in the project when moving from a directory not in the project to a directory not in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            project.createDirectory("/dir2");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const newDir = dir.move("/dir2/dir");
            expect(newDir._isInProject()).to.be.false;
        });

        it("should have descendants not in project when moving from a directory not in the project to overwrite a directory in the project", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const dir = project.createDirectory("/dir");
            const otherDir = dir.createDirectory("/dir/otherDir");
            otherDir.createDirectory("subDir");
            otherDir.createSourceFile("file.ts");
            project.createDirectory("/otherDir");
            project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(dir);
            const newDir = otherDir.move("/otherDir", { overwrite: true });

            expect(newDir._isInProject()).to.be.true;
            expect(newDir.getDirectoryOrThrow("subDir")._isInProject()).to.be.false;
            expect(newDir.getSourceFileOrThrow("file.ts")._isInProject()).to.be.false;
            expect(dir._isInProject()).to.be.false;
        });
    });

    describe(nameof<Directory>(dir => dir.moveToDirectory), () => {
        it("should move when specifying an absolute path", () => {
            const project = getProject();
            const dir = project.createDirectory("dir/temp");
            dir.moveToDirectory("/otherDir");
            expect(dir.getPath()).to.equal("/otherDir/temp");
        });

        it("should move when specifying a relative path", () => {
            const project = getProject();
            const dir = project.createDirectory("dir/temp");
            dir.moveToDirectory("../otherDir");
            expect(dir.getPath()).to.equal("/dir/otherDir/temp");
        });

        it("should move when specifying a directory", () => {
            const project = getProject();
            const dir = project.createDirectory("dir/temp");
            const otherDir = project.createDirectory("otherDir");
            dir.moveToDirectory(otherDir);
            expect(dir.getPath()).to.equal("/otherDir/temp");
        });

        it("should move with overwrite", () => {
            const project = getProject();
            project.createSourceFile("/dir/temp/file.ts");
            project.createSourceFile("/otherDir/temp/file.ts");
            const dir = project.getDirectoryOrThrow("/dir/temp");
            dir.moveToDirectory("/otherDir", { overwrite: true });
            expect(dir.getPath()).to.equal("/otherDir/temp");
        });
    });

    describe(nameof<Directory>(d => d.delete), () => {
        it("should delete the directory and remove all its descendants", () => {
            const fileSystem = getFileSystemHostWithFiles([], []);
            const project = new Project({ fileSystem });
            const directory = project.createDirectory("dir");
            const childDir = directory.createDirectory("childDir");
            const sourceFile = directory.createSourceFile("file.ts");
            const otherSourceFile = project.createSourceFile("otherFile.ts");

            directory.delete();
            expect(fileSystem.getDeleteLog()).to.deep.equal([]);
            expect(directory.wasForgotten()).to.be.true;
            expect(childDir.wasForgotten()).to.be.true;
            expect(sourceFile.wasForgotten()).to.be.true;
            expect(otherSourceFile.wasForgotten()).to.be.false;
            project.saveSync();
            expect(fileSystem.getDeleteLog().map(d => d.path).sort()).to.deep.equal(["/dir/childDir", "/dir/file.ts", "/dir"].sort());
        });

        it("mixing delete and delete immediately", async () => {
            const fileSystem = getFileSystemHostWithFiles([], []);
            const project = new Project({ fileSystem });
            const directory = project.createDirectory("dir");
            const childDir = directory.createDirectory("childDir");
            const sourceFile = directory.createSourceFile("sourceFile.ts");

            childDir.delete();
            sourceFile.delete();
            await directory.deleteImmediately();
            expect(fileSystem.getDeleteLog()).to.deep.equal([{ path: "/dir" }]);
            project.saveSync();
            // should not add the child directory and source file here...
            expect(fileSystem.getDeleteLog()).to.deep.equal([{ path: "/dir" }]);
        });

        it("should delete the directory's previous items when recreating the directory before a save", () => {
            const fileSystem = getFileSystemHostWithFiles([], []);
            const project = new Project({ fileSystem });
            const filePaths = ["/dir/subDir/file.ts", "/dir/file.ts"];
            for (const filePath of filePaths)
                project.createSourceFile(filePath);
            const directory = project.getDirectoryOrThrow("dir");

            project.saveSync();
            directory.delete();
            project.createDirectory("dir");
            project.saveSync();
            expect(fileSystem.getDeleteLog().map(d => d.path).sort()).to.deep.equal([...filePaths, "/dir", "/dir/subDir"].sort());
        });
    });

    describe(nameof<Directory>(d => d.clear), () => {
        it("should clear the directory by removing all its descendants", () => {
            const fileSystem = getFileSystemHostWithFiles([], []);
            const project = new Project({ fileSystem });
            const directory = project.createDirectory("dir");
            const childDir = directory.createDirectory("childDir");
            const sourceFile = directory.createSourceFile("file.ts");
            const otherSourceFile = project.createSourceFile("otherFile.ts");

            directory.clear();
            expect(fileSystem.getDeleteLog()).to.deep.equal([]);
            expect(directory.wasForgotten()).to.be.false;
            expect(childDir.wasForgotten()).to.be.true;
            expect(sourceFile.wasForgotten()).to.be.true;
            expect(otherSourceFile.wasForgotten()).to.be.false;
            fileSystem.clearCreatedDirectories();
            fileSystem.clearDeleteLog();
            project.saveSync();
            expect(fileSystem.getDeleteLog().map(d => d.path).sort()).to.deep.equal(["/dir/childDir", "/dir/file.ts", "/dir"].sort());
            expect(fileSystem.getCreatedDirectories().sort()).to.deep.equal(["/dir"].sort());
        });

        it("mixing clear and clear immediately", async () => {
            const fileSystem = getFileSystemHostWithFiles([], []);
            const project = new Project({ fileSystem });
            const directory = project.createDirectory("dir");
            const childDir = directory.createDirectory("childDir");
            const sourceFile = directory.createSourceFile("sourceFile.ts");

            fileSystem.clearCreatedDirectories();
            childDir.clear();
            sourceFile.delete();
            await directory.clearImmediately();
            expect(fileSystem.getDeleteLog()).to.deep.equal([{ path: "/dir" }]);
            project.saveSync();
            // should not add the child directory and source file here...
            expect(fileSystem.getDeleteLog()).to.deep.equal([{ path: "/dir" }]);
            expect(fileSystem.getCreatedDirectories()).to.deep.equal(["/dir"]);
        });
    });

    describe(nameof<Directory>(d => d.copyImmediately), () => {
        function doTests(
            copyImmediately: (
                directory: Directory,
                toPath: string,
                options: DirectoryCopyOptions | undefined,
                doChecks: (err?: any) => void
            ) => void
        ) {
            it("should copy the entire directory to the new directory", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }]);
                project.saveSync();
                const fileSystem = project.getFileSystem();
                const directory = project.getDirectoryOrThrow("dir");
                directory.createSourceFile("file.ts");
                fileSystem.writeFileSync("/dir/test.txt", "");

                copyImmediately(directory, "/newDir", undefined, () => {
                    expect(directory.getPath()).to.equal("/dir");
                    expect(fileSystem.directoryExistsSync("/dir")).to.be.true;
                    expect(fileSystem.fileExistsSync("/dir/test.ts")).to.be.true;
                    expect(fileSystem.fileExistsSync("/dir/test.txt")).to.be.true;
                    expect(fileSystem.fileExistsSync("/dir/file.ts")).to.be.false;
                    expect(fileSystem.fileExistsSync("/newDir/test.ts")).to.be.true;
                    expect(fileSystem.fileExistsSync("/newDir/test.txt")).to.be.true;
                    expect(fileSystem.fileExistsSync("/newDir/file.ts")).to.be.true;
                    expect(project.getDirectory("/dir")).to.not.be.undefined;
                });
            });

            it("should only copy files in the project when setting includeUntrackedFiles to false", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }]);
                project.saveSync();
                const fileSystem = project.getFileSystem();
                const directory = project.getDirectoryOrThrow("dir");
                directory.createSourceFile("file.ts");
                fileSystem.writeFileSync("/dir/test.txt", "");

                copyImmediately(directory, "/newDir", { includeUntrackedFiles: false }, () => {
                    expect(directory.getPath()).to.equal("/dir");
                    expect(fileSystem.directoryExistsSync("/dir")).to.be.true;
                    expect(fileSystem.fileExistsSync("/dir/test.ts")).to.be.true;
                    expect(fileSystem.fileExistsSync("/dir/test.txt")).to.be.true;
                    expect(fileSystem.fileExistsSync("/dir/file.ts")).to.be.false;
                    expect(fileSystem.fileExistsSync("/newDir/test.ts")).to.be.true;
                    expect(fileSystem.fileExistsSync("/newDir/test.txt")).to.be.false;
                    expect(fileSystem.fileExistsSync("/newDir/file.ts")).to.be.true;
                    expect(project.getDirectory("/dir")).to.not.be.undefined;
                });
            });

            it("should propagate the file deletes when setting includeUntrackedFiles to true", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }, { filePath: "/dir/fileToDelete.ts", text: "" }]);
                project.saveSync();
                const fileSystem = project.getFileSystem();
                const directory = project.getDirectoryOrThrow("dir");
                directory.getSourceFileOrThrow("fileToDelete.ts").delete();

                copyImmediately(directory, "/newDir", { includeUntrackedFiles: true }, () => {
                    expect(fileSystem.fileExistsSync("/dir/fileToDelete.ts")).to.be.false;
                    expect(fileSystem.fileExistsSync("/newDir/fileToDelete.ts")).to.be.false;
                });
            });

            it("should save the directory if copying to the same directory", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }]);
                const fileSystem = project.getFileSystem();
                const directory = project.getDirectoryOrThrow("dir");

                copyImmediately(directory, "/dir", undefined, () => {
                    expect(fileSystem.directoryExistsSync("/dir")).to.be.true;
                    expect(fileSystem.fileExistsSync("/dir/test.ts")).to.be.true;
                });
            });

            it("should throw when the other directory contains the same file", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }, { filePath: "/newDir/test.ts", text: "" }]);
                project.saveSync();
                const directory = project.getDirectoryOrThrow("dir");

                copyImmediately(directory, "/newDir", undefined, err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should not throw when the other directory contains the same file and the overwrite option is provided", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }, { filePath: "/newDir/test.ts", text: "" }]);
                project.saveSync();
                const directory = project.getDirectoryOrThrow("dir");

                copyImmediately(directory, "/newDir", { overwrite: true }, err => {
                    expect(err).to.be.undefined;
                });
            });

            describe("should only throw if the directory has inbound external operations and includeTrackedFiles is true", () => {
                function doTest(value: boolean) {
                    const project = getProject([{ filePath: "/dir/test.ts", text: "" }]);
                    project.saveSync();
                    const dir = project.getDirectoryOrThrow("/dir");
                    const newDir = project.createDirectory("/newDir");

                    newDir.move("/dir");

                    copyImmediately(newDir, "/otherDir", { includeUntrackedFiles: value }, err => {
                        if (value)
                            expect(err).to.be.instanceof(errors.InvalidOperationError);
                        else
                            expect(err).to.be.undefined;
                    });
                }

                it("true", () => doTest(true));
                it("false", () => doTest(false));
            });

            describe("should only throw if the directory has external operations and includeTrackedFiles is true", () => {
                function doTest(value: boolean) {
                    const project = getProject([{ filePath: "/dir/test.ts", text: "" }, { filePath: "/newDir/test.ts", text: "" }]);
                    project.saveSync();
                    const dir = project.getDirectoryOrThrow("dir");

                    dir.move("/someDir");

                    copyImmediately(dir, "/otherDir", { includeUntrackedFiles: value }, err => {
                        if (value)
                            expect(err).to.be.instanceof(errors.InvalidOperationError);
                        else
                            expect(err).to.be.undefined;
                    });
                }

                it("true", () => doTest(true));
                it("false", () => doTest(false));
            });
        }

        describe("async", () => {
            doTests(async (directory, toPath, options, doChecks) => {
                let thrownErr: any;
                try {
                    await directory.copyImmediately(toPath, options);
                } catch (err) {
                    thrownErr = err;
                }
                doChecks(thrownErr);
            });
        });

        describe("sync", () => {
            doTests((directory, toPath, options, doChecks) => {
                let thrownErr: any;
                try {
                    directory.copyImmediatelySync(toPath, options);
                } catch (err) {
                    thrownErr = err;
                }
                doChecks(thrownErr);
            });
        });
    });

    describe(nameof<Directory>(d => d.moveImmediately), () => {
        function doTests(
            moveImmediately: (
                directory: Directory,
                toPath: string,
                options: DirectoryMoveOptions | undefined,
                doChecks: (err?: any) => void
            ) => void
        ) {
            it("should move the directory to the new directory", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }]);
                project.saveSync();
                const fileSystem = project.getFileSystem();
                const directory = project.getDirectoryOrThrow("dir");
                directory.createSourceFile("file.ts");

                moveImmediately(directory, "/newDir", undefined, () => {
                    expect(directory.getPath()).to.equal("/newDir");
                    expect(fileSystem.directoryExistsSync("/dir")).to.be.false;
                    expect(fileSystem.fileExistsSync("/newDir/test.ts")).to.be.true;
                    expect(fileSystem.fileExistsSync("/newDir/file.ts")).to.be.true;
                    expect(project.getDirectory("/dir")).to.be.undefined;
                });
            });

            it("should save the directory if moving to the same directory", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }]);
                const fileSystem = project.getFileSystem();
                const directory = project.getDirectoryOrThrow("dir");

                moveImmediately(directory, "/dir", undefined, () => {
                    expect(fileSystem.directoryExistsSync("/dir")).to.be.true;
                    expect(fileSystem.fileExistsSync("/dir/test.ts")).to.be.true;
                });
            });

            it("should throw when the other directory contains the same file", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }, { filePath: "/newDir/test.ts", text: "" }]);
                project.saveSync();
                const directory = project.getDirectoryOrThrow("dir");

                moveImmediately(directory, "/newDir", undefined, err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should not throw when the other directory contains the same file and the overwrite option is provided", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }, { filePath: "/newDir/test.ts", text: "" }]);
                project.saveSync();
                const directory = project.getDirectoryOrThrow("dir");

                moveImmediately(directory, "/newDir", { overwrite: true }, err => {
                    expect(err).to.be.undefined;
                });
            });

            it("should throw if the directory has inbound external operations", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }]);
                project.saveSync();
                const dir = project.getDirectoryOrThrow("/dir");
                const newDir = project.createDirectory("/newDir");

                newDir.move("/dir");

                moveImmediately(dir, "/otherDir", undefined, err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });

            it("should throw if the directory has external operations", () => {
                const project = getProject([{ filePath: "/dir/test.ts", text: "" }, { filePath: "/newDir/test.ts", text: "" }]);
                project.saveSync();
                const dir = project.getDirectoryOrThrow("dir");

                dir.move("/someDir");

                moveImmediately(dir, "/otherDir", undefined, err => {
                    expect(err).to.be.instanceof(errors.InvalidOperationError);
                });
            });
        }

        describe("async", () => {
            doTests(async (directory, toPath, options, doChecks) => {
                let thrownErr: any;
                try {
                    await directory.moveImmediately(toPath, options);
                } catch (err) {
                    thrownErr = err;
                }
                doChecks(thrownErr);
            });
        });

        describe("sync", () => {
            doTests((directory, toPath, options, doChecks) => {
                let thrownErr: any;
                try {
                    directory.moveImmediatelySync(toPath, options);
                } catch (err) {
                    thrownErr = err;
                }
                doChecks(thrownErr);
            });
        });
    });

    describe(nameof<Directory>(d => d.deleteImmediately), () => {
        function doTests(deleteImmediately: (directory: Directory, doChecks: () => void) => void) {
            it("should delete the file and remove all its descendants", async () => {
                const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir"]);
                const project = new Project({ fileSystem });
                const directory = project.addDirectoryAtPath("dir");
                const childDir = directory.createDirectory("childDir");
                const sourceFile = directory.addSourceFileAtPath("file.ts");
                const otherSourceFile = project.createSourceFile("otherFile.ts");

                deleteImmediately(directory, () => {
                    expect(directory.wasForgotten()).to.be.true;
                    expect(childDir.wasForgotten()).to.be.true;
                    expect(sourceFile.wasForgotten()).to.be.true;
                    expect(otherSourceFile.wasForgotten()).to.be.false;
                    expect(fileSystem.getDeleteLog()).to.deep.equal([{ path: "/dir" }]);
                });
            });
        }

        describe("async", () => {
            doTests(async (directory, doChecks) => {
                await directory.deleteImmediately();
                doChecks();
            });
        });

        describe("sync", () => {
            doTests((directory, doChecks) => {
                directory.deleteImmediatelySync();
                doChecks();
            });
        });
    });

    describe(nameof<Directory>(d => d.clearImmediately), () => {
        function doTests(clearImmediately: (directory: Directory, doChecks: () => void) => void) {
            it("should delete the file and remove all its descendants", async () => {
                const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }]);
                const project = new Project({ fileSystem });
                const directory = project.createDirectory("dir");
                const childDir = directory.createDirectory("childDir");
                const sourceFile = directory.addSourceFileAtPath("file.ts");
                const otherSourceFile = project.createSourceFile("otherFile.ts");

                fileSystem.clearCreatedDirectories();

                clearImmediately(directory, () => {
                    expect(directory.wasForgotten()).to.be.false;
                    expect(childDir.wasForgotten()).to.be.true;
                    expect(sourceFile.wasForgotten()).to.be.true;
                    expect(otherSourceFile.wasForgotten()).to.be.false;
                    expect(fileSystem.getDeleteLog()).to.deep.equal([{ path: "/dir" }]);
                    expect(fileSystem.getCreatedDirectories()).to.deep.equal(["/dir"]);
                });
            });
        }

        describe("async", () => {
            doTests(async (directory, doChecks) => {
                await directory.clearImmediately();
                doChecks();
            });
        });

        describe("sync", () => {
            doTests((directory, doChecks) => {
                directory.clearImmediatelySync();
                doChecks();
            });
        });
    });

    describe(nameof<Directory>(d => d.forget), () => {
        it("should forget the directory and all its descendants", () => {
            const project = getProject();
            const directory = project.createDirectory("dir");
            const childDir = directory.createDirectory("childDir");
            const sourceFile = directory.createSourceFile("file.ts");
            const otherSourceFile = project.createSourceFile("otherFile.ts");

            directory.forget();
            expect(directory.wasForgotten()).to.be.true;
            expect(() => directory.getPath()).to.throw();
            expect(childDir.wasForgotten()).to.be.true;
            expect(sourceFile.wasForgotten()).to.be.true;
            expect(otherSourceFile.wasForgotten()).to.be.false;
            expect(() => directory.forget()).to.not.throw();
        });
    });

    describe(nameof<Directory>(dir => dir.save), () => {
        it("should save all the unsaved source files asynchronously", async () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ fileSystem });
            const otherFile = project.createSourceFile("file.ts");
            const dir = project.createDirectory("dir");
            dir.createSourceFile("file1.ts", "").saveSync();
            dir.createSourceFile("file2.ts", "");
            dir.createSourceFile("child/file3.ts", "");
            await dir.save();

            expect(dir.getDescendantSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
            expect(otherFile.isSaved()).to.be.false;
            expect(fileSystem.getWriteLog().length).to.equal(3);
            expect(fileSystem.getCreatedDirectories().length).to.equal(2);
        });
    });

    describe(nameof<Directory>(dir => dir.saveSync), () => {
        it("should save all the unsaved source files synchronously", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ fileSystem });
            const otherFile = project.createSourceFile("file.ts");
            const dir = project.createDirectory("dir");
            dir.createSourceFile("file1.ts", "").saveSync();
            dir.createSourceFile("file2.ts", "");
            dir.createSourceFile("child/file3.ts", "");
            dir.saveSync();

            expect(dir.getDescendantSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
            expect(otherFile.isSaved()).to.be.false;
            expect(fileSystem.getWriteLog().length).to.equal(3);
            expect(fileSystem.getCreatedDirectories().length).to.equal(2);
        });
    });

    describe(nameof<Directory>(dir => dir.emit), () => {
        function setup(compilerOptions: CompilerOptions) {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions, fileSystem });
            const directory = project.createDirectory("dir");

            directory.createSourceFile("file1.ts", "const t = '';");
            directory.createDirectory("subDir").createSourceFile("file2.ts");

            return { directory, fileSystem };
        }

        function runChecks(fileSystem: FileSystemHost & CustomFileSystemProps, result: DirectoryEmitResult, outDir: string, declarationDir: string) {
            const writeLog = fileSystem.getWriteLog();

            expect(result.getOutputFilePaths().sort()).to.deep.equal(writeLog.map(l => l.filePath).sort());
            expect(writeLog.map(l => l.filePath).sort()).to.deep.equal([
                outDir + "/file1.js.map",
                outDir + "/file1.js",
                declarationDir + "/file1.d.ts",
                outDir + "/subDir/file2.js.map",
                outDir + "/subDir/file2.js",
                declarationDir + "/subDir/file2.d.ts"
            ].sort());
        }

        it("should emit correctly when not specifying anything", async () => {
            const { directory, fileSystem } = setup({ target: ScriptTarget.ES5, outDir: "dist", declaration: true, sourceMap: true });
            const result = await directory.emit();
            runChecks(fileSystem, result, "/dist", "/dist");
        });

        it("should emit correctly when specifying a different out dir and no declaration dir in compiler options", async () => {
            const { directory, fileSystem } = setup({ target: ScriptTarget.ES5, outDir: "dist", declaration: true, sourceMap: true });
            const result = await directory.emit({ outDir: "../newOutDir" });
            runChecks(fileSystem, result, "/newOutDir", "/newOutDir");
        });

        it("should emit correctly when specifying a different out dir and a declaration dir in compiler options", async () => {
            const { directory, fileSystem } = setup({ target: ScriptTarget.ES5, outDir: "dist", declarationDir: "dec", declaration: true, sourceMap: true });
            const result = await directory.emit({ outDir: "../newOutDir" });
            runChecks(fileSystem, result, "/newOutDir", "/dec");
        });

        it("should emit correctly when specifying a different declaration dir", async () => {
            const { directory, fileSystem } = setup({ target: ScriptTarget.ES5, outDir: "dist", declarationDir: "dec", declaration: true, sourceMap: true });
            const result = await directory.emit({ declarationDir: "newDeclarationDir" });
            runChecks(fileSystem, result, "/dist", "/dir/newDeclarationDir");
        });

        it("should emit correctly when specifying a different out and declaration dir", async () => {
            const { directory, fileSystem } = setup({ target: ScriptTarget.ES5, outDir: "dist", declarationDir: "dec", declaration: true, sourceMap: true });
            const result = await directory.emit({ outDir: "", declarationDir: "newDeclarationDir" });
            runChecks(fileSystem, result, "/dir", "/dir/newDeclarationDir");
        });

        it("should emit correctly when specifying to only emit declaration files", async () => {
            const { directory, fileSystem } = setup({ target: ScriptTarget.ES5, outDir: "dist", declarationDir: "dec", declaration: true, sourceMap: true });
            const result = await directory.emit({ outDir: "", declarationDir: "newDeclarationDir", emitOnlyDtsFiles: true });

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dir/newDeclarationDir/file1.d.ts");
            expect(writeLog[1].filePath).to.equal("/dir/newDeclarationDir/subDir/file2.d.ts");
            expect(writeLog.length).to.equal(2);
        });

        it("should get a list of files it didn't emit", async () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions: { declaration: true }, fileSystem });
            const directory = project.createDirectory("dir");
            const subDir = directory.createDirectory("sub");
            subDir.createSourceFile("file1.ts", "export class Parent extends Child {}");
            subDir.createSourceFile("file2.ts", "");
            const result = await directory.emit();
            expect(result.getSkippedFilePaths()).to.deep.equal(["/dir/sub/file1.ts"]);

            const writeLog = fileSystem.getWriteLog();
            expect(result.getOutputFilePaths()).to.deep.equal(writeLog.map(l => l.filePath));
            expect(writeLog[0].filePath).to.equal("/dir/sub/file2.js");
            expect(writeLog[1].filePath).to.equal("/dir/sub/file2.d.ts");
            expect(writeLog.length).to.equal(2);
        });
    });

    describe(nameof<Directory>(dir => dir.emitSync), () => {
        function setup(compilerOptions: CompilerOptions) {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions, fileSystem });
            const directory = project.createDirectory("dir");

            directory.createSourceFile("file1.ts", "const t = '';");
            directory.createDirectory("subDir").createSourceFile("file2.ts");

            return { directory, fileSystem };
        }

        function runChecks(fileSystem: FileSystemHost & CustomFileSystemProps, result: DirectoryEmitResult, outDir: string, declarationDir: string) {
            const writeLog = fileSystem.getWriteLog();

            expect(result.getOutputFilePaths()).to.deep.equal(writeLog.map(l => l.filePath));
            expect(writeLog[0].filePath).to.equal(outDir + "/file1.js.map");
            expect(writeLog[1].filePath).to.equal(outDir + "/file1.js");
            expect(writeLog[1].fileText).to.equal("var t = '';\n//# sourceMappingURL=file1.js.map");
            expect(writeLog[2].filePath).to.equal(declarationDir + "/file1.d.ts");
            expect(writeLog[3].filePath).to.equal(outDir + "/subDir/file2.js.map");
            expect(writeLog[4].filePath).to.equal(outDir + "/subDir/file2.js");
            expect(writeLog[5].filePath).to.equal(declarationDir + "/subDir/file2.d.ts");
            expect(writeLog.length).to.equal(6);
        }

        it("should emit correctly when not specifying anything", () => {
            const { directory, fileSystem } = setup({ target: ScriptTarget.ES5, outDir: "dist", declaration: true, sourceMap: true });
            const result = directory.emitSync();
            runChecks(fileSystem, result, "/dist", "/dist");
        });

        it("should get the absolute path in the output file name", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions: { declaration: false }, fileSystem });
            const directory = project.createDirectory("dir");
            const subDir = directory.createDirectory("sub");
            const subDir2 = directory.createDirectory("sub2");
            subDir.createSourceFile("file1.ts", "");
            const result = subDir.emitSync({ outDir: "../sub2" });

            const writeLog = fileSystem.getWriteLog();
            expect(result.getOutputFilePaths()).to.deep.equal(writeLog.map(l => l.filePath));
            expect(writeLog[0].filePath).to.equal("/dir/sub2/file1.js");
            expect(writeLog.length).to.equal(1);
        });

        it("should get a list of files it didn't emit", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions: { declaration: true }, fileSystem });
            const directory = project.createDirectory("dir");
            const subDir = directory.createDirectory("sub");
            subDir.createSourceFile("file1.ts", "export class Parent extends Child {}");
            subDir.createSourceFile("file2.ts", "");
            const result = directory.emitSync();
            expect(result.getSkippedFilePaths()).to.deep.equal(["/dir/sub/file1.ts"]);

            const writeLog = fileSystem.getWriteLog();
            expect(result.getOutputFilePaths()).to.deep.equal(writeLog.map(l => l.filePath));
            expect(writeLog[0].filePath).to.equal("/dir/sub/file2.js");
            expect(writeLog[1].filePath).to.equal("/dir/sub/file2.d.ts");
            expect(writeLog.length).to.equal(2);
        });
    });

    describe(nameof<Directory>(s => s.getRelativePathTo), () => {
        function doSourceFileTest(from: string, to: string, expected: string) {
            const project = new Project({ useInMemoryFileSystem: true });
            const fromDir = project.createDirectory(from);
            const toFile = project.createSourceFile(to);
            expect(fromDir.getRelativePathTo(toFile)).to.equal(expected);
        }

        // most of these tests are in fileUtilsTests

        it("should get the relative path to a source file in a different directory", () => {
            doSourceFileTest("/dir", "/dir2/to.ts", "../dir2/to.ts");
        });

        function doDirTest(from: string, to: string, expected: string) {
            const project = new Project({ useInMemoryFileSystem: true });
            const fromDir = project.createDirectory(from);
            const toDir = project.createDirectory(to);
            expect(fromDir.getRelativePathTo(toDir)).to.equal(expected);
        }

        it("should get the relative path to a directory", () => {
            doSourceFileTest("/dir", "/dir2/dir3", "../dir2/dir3");
        });
    });

    describe(nameof<Directory>(s => s.getRelativePathAsModuleSpecifierTo), () => {
        function doSourceFileTest(from: string, to: string, expected: string, compilerOptions?: CompilerOptions) {
            const project = new Project({ useInMemoryFileSystem: true, compilerOptions });
            const fromFile = from === "/" ? project.addDirectoryAtPath(from) : project.createDirectory(from);
            const toFile = project.createSourceFile(to);
            expect(fromFile.getRelativePathAsModuleSpecifierTo(toFile)).to.equal(expected);
        }

        it("should get the module specifier to a source file in a different directory", () => {
            doSourceFileTest("/dir", "/dir2/to.ts", "../dir2/to");
        });

        it("should get the module specifier to a source file in the directory", () => {
            doSourceFileTest("/dir", "/dir/to.ts", "./to");
        });

        it("should get the module specifier to a declaration file", () => {
            doSourceFileTest("/dir", "/dir2/to.d.ts", "../dir2/to");
        });

        it("should get the module specifier to a declaration file that doing use a lower case extension", () => {
            doSourceFileTest("/dir", "/dir2/to.D.TS", "../dir2/to");
        });

        it("should use an implicit index when specifying the index file in a different directory", () => {
            doSourceFileTest("/dir", "/dir2/index.ts", "../dir2");
        });

        it("should use an implicit index when specifying the index file in a parent directory", () => {
            doSourceFileTest("/dir/parent", "/dir/index.ts", "../../dir");
        });

        it("should use an implicit index when specifying the index file in a different directory that has different casing", () => {
            doSourceFileTest("/dir", "/dir2/INDEX.ts", "../dir2");
        });

        it("should use an implicit index when specifying the index file of a declaration file in a different directory", () => {
            doSourceFileTest("/dir", "/dir2/index.d.ts", "../dir2");
        });

        it("should use an explicit index when the module resolution strategy is classic", () => {
            doSourceFileTest("/dir", "/dir2/index.d.ts", "../dir2/index", { moduleResolution: ModuleResolutionKind.Classic });
        });

        it("should use an explicit index when something else in the compiler options means the module resolution will be classic", () => {
            doSourceFileTest("/dir", "/dir2/index.d.ts", "../dir2/index", { target: ScriptTarget.ES2015 });
        });

        it("should use an implicit index when specifying the index file in the same directory", () => {
            doSourceFileTest("/dir", "/dir/index.ts", "./index");
        });

        it("should use an implicit index when specifying the index file in the root directory", () => {
            doSourceFileTest("/", "/index.ts", "./index");
        });

        function doDirectoryTest(from: string, to: string, expected: string, compilerOptions?: CompilerOptions) {
            const project = new Project({ useInMemoryFileSystem: true, compilerOptions });
            const fromDir = project.createDirectory(from);
            const toDirectory = from === to ? fromDir : project.createDirectory(to);
            expect(fromDir.getRelativePathAsModuleSpecifierTo(toDirectory)).to.equal(expected);
        }

        it("should get the path to a directory as a module specifier", () => {
            doDirectoryTest("/dir", "/dir/dir2", "./dir2");
        });

        it("should use an explicit index when getting the module specifier to a directory and the module resolution strategy is classic", () => {
            doDirectoryTest("/dir", "/dir2", "../dir2/index", { moduleResolution: ModuleResolutionKind.Classic });
        });

        it("should get the module specifier to the same directory", () => {
            doDirectoryTest("/dir", "/dir", "./index");
        });
    });
});
