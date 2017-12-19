import {expect} from "chai";
import {SourceFile} from "./../../compiler";
import * as errors from "./../../errors";
import {TsSimpleAst} from "./../../TsSimpleAst";
import {SourceFileStructure} from "./../../structures";
import {Directory} from "./../../fileSystem";
import {FileUtils} from "./../../utils";
import {getFileSystemHostWithFiles} from "./../testHelpers";

describe(nameof(Directory), () => {
    interface TreeNode {
        directory: Directory;
        sourceFiles?: SourceFile[];
        children?: TreeNode[];
    }

    function getAst(initialFiles: { filePath: string; text: string; }[] = [], initialDirectories: string[] = []) {
        const ast = new TsSimpleAst(undefined, getFileSystemHostWithFiles(initialFiles, initialDirectories));
        return ast;
    }

    function testDirectoryTree(dir: Directory, tree: TreeNode, parent?: Directory) {
        expect(getDirPath(dir)).to.equal(getDirPath(tree.directory), "dir");
        expect(getDirPath(dir.getParent())).to.equal(getDirPath(parent), `parent dir of ${getDirPath(dir)}`);
        expect(dir.getDirectories().map(d => d.getPath())).to.deep.equal((tree.children || []).map(c => c.directory.getPath()), "child directories");
        expect(dir.getSourceFiles().map(s => s.getFilePath())).to.deep.equal((tree.sourceFiles || []).map(s => s.getFilePath()), "source files");
        for (const child of (tree.children || []))
            testDirectoryTree(child.directory, child, dir);

        function getDirPath(directory: Directory | undefined) {
            return directory == null ? undefined : directory.getPath();
        }
    }

    describe(nameof<Directory>(d => d.getPath), () => {
        function doTest(filePath: string, expectedDirPath: string) {
            const ast = getAst();
            const sourceFile = ast.createSourceFile(filePath);
            const directory = sourceFile.getDirectory();
            expect(directory.getPath()).to.equal(FileUtils.getStandardizedAbsolutePath(expectedDirPath));
        }

        it("should get the directory path when just creating a file with no directory", () => {
            doTest("file.ts", "");
        });

        it("should get the directory path in the root directory", () => {
            doTest("./file.ts", "./");
        });
    });

    describe("ancestor/descendant tests", () => {
        const ast = getAst();
        const root = ast.createDirectory("");
        const child = ast.createDirectory("child");
        const childChild = ast.createDirectory("child/child");
        const otherChild = ast.createDirectory("otherChild");
        const rootSourceFile = ast.createSourceFile("file.ts");

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
        it("should not have a parent if no parent exists", () => {
            const ast = getAst();
            const sourceFile = ast.createSourceFile("directory/file.ts");
            expect(sourceFile.getDirectory().getParent()).to.be.undefined;
        });

        it("should get the files in the alphabetical order", () => {
            const ast = getAst();
            const directory = ast.createDirectory("");
            directory.createSourceFile("D.ts");
            directory.createSourceFile("b.ts");
            directory.createSourceFile("a.ts");
            directory.createSourceFile("C.ts");
            expect(directory.getSourceFiles().map(s => s.getBaseName())).to.deep.equal(["a.ts", "b.ts", "C.ts", "D.ts"]);
        });

        it("should get the directories in alphabetical order", () => {
            const ast = getAst();
            const directory = ast.createDirectory("");
            directory.createDirectory("D");
            directory.createDirectory("b");
            directory.createDirectory("a");
            directory.createDirectory("C");
            expect(directory.getDirectories().map(s => s.getBaseName())).to.deep.equal(["a", "b", "C", "D"]);
        });

        it("should have a parent when a file exists in an ancestor folder", () => {
            const ast = getAst();
            const sourceFile = ast.createSourceFile("file.ts");
            const lowerSourceFile = ast.createSourceFile("dir1/dir2/file.ts");

            testDirectoryTree(sourceFile.getDirectory(), {
                directory: sourceFile.getDirectory(),
                sourceFiles: [sourceFile],
                children: [{
                    directory: ast.getDirectoryOrThrow("dir1"),
                    children: [{
                        directory: ast.getDirectoryOrThrow("dir1/dir2"),
                        sourceFiles: [lowerSourceFile]
                    }]
                }]
            });
        });

        it("should get the child directories", () => {
            const ast = getAst();
            const file1 = ast.createSourceFile("file1.ts");
            const file2 = ast.createSourceFile("dir1/file2.ts");
            const file3 = ast.createSourceFile("dir2/file3.ts");

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
            const ast = getAst();
            const file2 = ast.createSourceFile("dir1/file2.ts");
            const file3 = ast.createSourceFile("dir2/file3.ts");
            const file1 = ast.createSourceFile("file1.ts");

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
            const ast = getAst();
            const file1 = ast.createSourceFile("V:/file1.ts");
            const file2 = ast.createSourceFile("V:/file2.ts");
            const file3 = ast.createSourceFile("V:/dir1/file2.ts");

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

    describe(nameof<Directory>(d => d.getParentOrThrow), () => {
        const ast = getAst();
        const sourceFile = ast.createSourceFile("/file.ts");
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
            const ast = getAst();
            const sourceFiles = [
                ast.createSourceFile("someDir/inSomeFile/more/test.ts"),
                ast.createSourceFile("someDir/otherDir/deeper/test.ts"),
                ast.createSourceFile("someDir/test.ts"),
                ast.createSourceFile("someDir/childDir/deeper/test.ts"),
                ast.createSourceFile("final.ts")
            ];

            const finalFile = ast.getSourceFileOrThrow("final.ts");
            expect(finalFile.getDirectory().getDescendantSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(sourceFiles.map(s => s.getFilePath()).sort());
        });
    });

    describe(nameof<Directory>(d => d.createSourceFile), () => {
        function doTest(input: string | SourceFileStructure | undefined, expectedText: string) {
            const ast = getAst();
            const directory = ast.createDirectory("dir");
            let sourceFile: SourceFile;
            if (typeof input === "undefined")
                sourceFile = directory.createSourceFile("sourceFile.ts");
            else if (typeof input === "string")
                sourceFile = directory.createSourceFile("sourceFile.ts", input);
            else
                sourceFile = directory.createSourceFile("sourceFile.ts", input);
            expect(directory.getSourceFiles()).to.deep.equal([sourceFile]);
            expect(sourceFile.getFilePath()).to.equal(FileUtils.getStandardizedAbsolutePath("dir/sourceFile.ts"));
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should create a source file in the directory when specifying no text or structure", () => {
            doTest(undefined, "");
        });

        it("should create a source file in the directory when specifying text", () => {
            const code = "const t = 34;";
            doTest(code, code);
        });

        it("should create a source file in the directory when specifying a structure", () => {
            doTest({ enums: [{ name: "MyEnum" }] }, "enum MyEnum {\n}\n");
        });

        it("should throw an exception if creating a source file at an existing path on the disk", () => {
            const ast = getAst([{ filePath: "file.ts", text: "" }], [""]);
            const directory = ast.addExistingDirectory("");
            expect(() => directory.createSourceFile("file.ts", "")).to.throw(errors.InvalidOperationError);
        });
    });

    describe(nameof<Directory>(d => d.addExistingSourceFile), () => {
        it("should throw an exception if adding a source file at a non-existent path", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const directory = ast.createDirectory("dir");
            expect(() => {
                directory .addExistingSourceFile("non-existent-file.ts");
            }).to.throw(errors.FileNotFoundError, `File not found: ${FileUtils.getStandardizedAbsolutePath("dir/non-existent-file.ts")}`);
        });

        it("should add a source file that exists", () => {
            const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir"]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const directory = ast.addExistingDirectory("dir");
            const sourceFile = directory.addExistingSourceFile("file.ts");
            expect(sourceFile).to.not.be.undefined;
        });
    });

    describe(nameof<Directory>(d => d.createDirectory), () => {
        const ast = getAst([], ["", "childDir"]);
        const directory = ast.createDirectory("some/path");
        directory.createDirectory("child");
        directory.createDirectory("../../dir/other/deep/path");
        directory.createDirectory("../../dir/other");

        it("should have created the directories in the first area", () => {
            testDirectoryTree(ast.getDirectoryOrThrow("some/path"), {
                directory: ast.getDirectoryOrThrow("some/path"),
                children: [{
                    directory: ast.getDirectoryOrThrow("some/path/child")
                }]
            });
        });

        it("should have created the directories in the second area", () => {
            testDirectoryTree(ast.getDirectoryOrThrow("dir/other"), {
                directory: ast.getDirectoryOrThrow("dir/other"),
                children: [{
                    directory: ast.getDirectoryOrThrow("dir/other/deep"),
                    children: [{
                        directory: ast.getDirectoryOrThrow("dir/other/deep/path")
                    }]
                }]
            });
        });

        it("should throw when a directory already exists at the specified path", () => {
            expect(() => directory.createDirectory("child")).to.throw(errors.InvalidOperationError);
        });

        it("should throw when a directory already exists on the file system at the specified path", () => {
            expect(() => ast.addExistingDirectory("").createDirectory("childDir")).to.throw(errors.InvalidOperationError);
        });
    });

    describe(nameof<Directory>(d => d.addExistingDirectory), () => {
        it("should throw when the directory doesn't exist", () => {
            const fileSystem = getFileSystemHostWithFiles([], ["dir"]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const directory = ast.addExistingDirectory("dir");
            expect(() => directory.addExistingDirectory("someDir")).to.throw(errors.DirectoryNotFoundError);
        });

        it("should add a directory relative to the specified directory", () => {
            const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir", "dir2", "dir/child"]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const directory = ast.addExistingDirectory("dir");
            expect(directory.addExistingDirectory("child")).to.equal(ast.getDirectoryOrThrow("dir/child"));
            expect(directory.addExistingDirectory("../dir2")).to.equal(ast.getDirectoryOrThrow("dir2"));
        });
    });

    describe(nameof<Directory>(d => d.getDirectory), () => {
        const ast = new TsSimpleAst();
        const directory = ast.createDirectory("dir");
        const child1 = directory.createDirectory("child1");
        const child2 = directory.createDirectory("child2");

        it("should get the directory based on the name", () => {
            expect(directory.getDirectory("child2")!.getPath()).to.equal(child2.getPath());
        });

        it("should get the directory based on a condition", () => {
            expect(directory.getDirectory(d => FileUtils.getBaseName(d.getPath()) === "child2")!.getPath()).to.equal(child2.getPath());
        });

        it("should not get the directory when it doesn't exist", () => {
            expect(directory.getDirectory("child3")).to.be.undefined;
        });
    });

    describe(nameof<Directory>(d => d.getDirectoryOrThrow), () => {
        const ast = new TsSimpleAst();
        const directory = ast.createDirectory("dir");
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
        const ast = new TsSimpleAst();
        const directory = ast.createDirectory("dir");
        const child1 = directory.createSourceFile("child1.ts");
        const child2 = directory.createSourceFile("child2.ts");

        it("should get based on the name", () => {
            expect(directory.getSourceFile("child2.ts")!.getFilePath()).to.equal(child2.getFilePath());
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
        const ast = new TsSimpleAst();
        const directory = ast.createDirectory("dir");
        const child1 = directory.createSourceFile("child1.ts");
        const child2 = directory.createSourceFile("child2.ts");

        it("should get based on the name", () => {
            expect(directory.getSourceFileOrThrow("child2.ts").getFilePath()).to.equal(child2.getFilePath());
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

    describe(nameof<Directory>(d => d.delete), () => {
        it("should delete the file and remove all its descendants", async () => {
            const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir"]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const directory = ast.addExistingDirectory("dir");
            const childDir = directory.createDirectory("childDir");
            const sourceFile = directory.addExistingSourceFile("file.ts");
            const otherSourceFile = ast.createSourceFile("otherFile.ts");

            await directory.delete();
            expect(directory._wasRemoved()).to.be.true;
            expect(childDir._wasRemoved()).to.be.true;
            expect(sourceFile.wasForgotten()).to.be.true;
            expect(otherSourceFile.wasForgotten()).to.be.false;
            expect(fileSystem.getDeleteLog()).to.deep.equal([{ path: FileUtils.getStandardizedAbsolutePath("dir") }]);
        });
    });

    describe(nameof<Directory>(d => d.deleteSync), () => {
        it("should delete the file and remove all its descendants synchronously", () => {
            const fileSystem = getFileSystemHostWithFiles([{ filePath: "dir/file.ts", text: "" }], ["dir"]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const directory = ast.addExistingDirectory("dir");
            const childDir = directory.createDirectory("childDir");
            const sourceFile = directory.addExistingSourceFile("file.ts");
            const otherSourceFile = ast.createSourceFile("otherFile.ts");

            directory.deleteSync();
            expect(directory._wasRemoved()).to.be.true;
            expect(childDir._wasRemoved()).to.be.true;
            expect(sourceFile.wasForgotten()).to.be.true;
            expect(otherSourceFile.wasForgotten()).to.be.false;
            expect(fileSystem.getDeleteLog()).to.deep.equal([{ path: FileUtils.getStandardizedAbsolutePath("dir") }]);
        });
    });

    describe(nameof<Directory>(d => d.remove), () => {
        it("should remove the file and all its descendants", () => {
            const ast = new TsSimpleAst();
            const directory = ast.createDirectory("dir");
            const childDir = directory.createDirectory("childDir");
            const sourceFile = directory.createSourceFile("file.ts");
            const otherSourceFile = ast.createSourceFile("otherFile.ts");

            directory.remove();
            expect(directory._wasRemoved()).to.be.true;
            expect(() => directory.getPath()).to.throw();
            expect(childDir._wasRemoved()).to.be.true;
            expect(sourceFile.wasForgotten()).to.be.true;
            expect(otherSourceFile.wasForgotten()).to.be.false;
        });
    });
});
