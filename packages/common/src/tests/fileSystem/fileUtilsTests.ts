import { expect } from "chai";
import { FileUtils, InMemoryFileSystemHost } from "../../fileSystem";

describe(nameof(FileUtils), () => {
    describe(nameof(FileUtils.getStandardizedAbsolutePath), () => {
        const fileSystem = new InMemoryFileSystemHost();

        it("should get the absolute path when absolute", () => {
            expect(FileUtils.getStandardizedAbsolutePath(fileSystem, "/absolute/path", "/basedir")).to.equal("/absolute/path");
        });

        it("should get the relative path when relative", () => {
            expect(FileUtils.getStandardizedAbsolutePath(fileSystem, "relative/path", "/basedir")).to.equal("/basedir/relative/path");
        });

        it("should get the relative path without dots", () => {
            expect(FileUtils.getStandardizedAbsolutePath(fileSystem, "../relative/path", "/basedir")).to.equal("/relative/path");
        });
    });

    describe(nameof(FileUtils.standardizeSlashes), () => {
        it("should change all back slashes to forward slashes", () => {
            expect(FileUtils.standardizeSlashes("/some/path\\including\\back/spaces")).to.equal("/some/path/including/back/spaces");
        });
    });

    describe(nameof(FileUtils.pathStartsWith), () => {
        it("should return false for a undefined path", () => {
            expect(FileUtils.pathStartsWith(undefined, "test.ts")).to.be.false;
        });

        it("should return false for an empty path", () => {
            expect(FileUtils.pathStartsWith("", "test.ts")).to.be.false;
        });

        it("should return true when both are undefined", () => {
            expect(FileUtils.pathStartsWith(undefined, undefined)).to.be.true;
        });

        it("should return true when both are empty", () => {
            expect(FileUtils.pathStartsWith("", "")).to.be.true;
        });

        it("should return true for the root directory", () => {
            expect(FileUtils.pathStartsWith("/dir", "/")).to.be.true;
        });

        it("should return true for the root directory on windows", () => {
            expect(FileUtils.pathStartsWith("C:/dir", "C:/")).to.be.true;
        });

        it("should return false for empty search", () => {
            expect(FileUtils.pathStartsWith("V:/dir/tests.ts", "")).to.be.false;
        });

        it("should return false for undefined search", () => {
            expect(FileUtils.pathStartsWith("V:/dir/tests.ts", undefined)).to.be.false;
        });

        it("should return false for a file name only", () => {
            expect(FileUtils.pathStartsWith("V:/dir/test.ts", "test.ts")).to.be.false;
        });

        it("should return true when matches start directory without a slash", () => {
            expect(FileUtils.pathStartsWith("V:/dir/test.ts", "V:/dir")).to.be.true;
        });

        it("should return true when matches start directory with a slash", () => {
            expect(FileUtils.pathStartsWith("V:/dir/test.ts", "V:/dir/")).to.be.true;
        });

        it("should return true for a full match", () => {
            expect(FileUtils.pathStartsWith("V:/dir/test.ts", "V:/dir/test.ts")).to.be.true;
        });

        it("should not error when the file path being searched for is longer", () => {
            expect(FileUtils.pathStartsWith("V:/dir/test.ts", "V:/dir/dir/test.ts")).to.be.false;
        });

        it("should return false when the end name doesn't exactly match", () => {
            expect(FileUtils.pathStartsWith("V:/dir/test.ts", "V:/dir/test.t")).to.be.false;
        });
    });

    describe(nameof(FileUtils.pathEndsWith), () => {
        it("should return false for a undefined path", () => {
            expect(FileUtils.pathEndsWith(undefined, "test.ts")).to.be.false;
        });

        it("should return false for an empty path", () => {
            expect(FileUtils.pathEndsWith("", "test.ts")).to.be.false;
        });

        it("should return true when both are undefined", () => {
            expect(FileUtils.pathEndsWith(undefined, undefined)).to.be.true;
        });

        it("should return true when both are empty", () => {
            expect(FileUtils.pathEndsWith("", "")).to.be.true;
        });

        it("should return false for empty search", () => {
            expect(FileUtils.pathEndsWith("V:/dir/tests.ts", "")).to.be.false;
        });

        it("should return false for undefined search", () => {
            expect(FileUtils.pathEndsWith("V:/dir/tests.ts", undefined)).to.be.false;
        });

        it("should return true for a file name only", () => {
            expect(FileUtils.pathEndsWith("V:/dir/test.ts", "test.ts")).to.be.true;
        });

        it("should return true for a file name and dir", () => {
            expect(FileUtils.pathEndsWith("V:/dir/test.ts", "dir/test.ts")).to.be.true;
        });

        it("should return true for a file name and dir with a slash at the front", () => {
            expect(FileUtils.pathEndsWith("V:/dir/test.ts", "/dir/test.ts")).to.be.true;
        });

        it("should return true for a full match", () => {
            expect(FileUtils.pathEndsWith("V:/dir/test.ts", "V:/dir/test.ts")).to.be.true;
        });

        it("should not error when the file path being searched for is longer", () => {
            expect(FileUtils.pathEndsWith("V:/dir/test.ts", "V:/dir/dir/test.ts")).to.be.false;
        });

        it("should return false when the directory name doesn't exactly match", () => {
            expect(FileUtils.pathEndsWith("V:/dir/test.ts", "ir/test.ts")).to.be.false;
        });
    });

    describe(nameof(FileUtils.getParentMostPaths), () => {
        function doTest(paths: string[], expected: string[]) {
            expect(FileUtils.getParentMostPaths(paths).sort()).to.deep.equal(expected.sort());
        }

        it("should get the parent-most paths", () => {
            doTest(["/dir/child", "/dir", "/dir/child/2"], ["/dir"]);
        });

        it("should get the parent-most paths for sub directories", () => {
            doTest(["/dir/child", "/dir/child2"], ["/dir/child", "/dir/child2"]);
        });
    });

    describe(nameof(FileUtils.getRelativePathTo), () => {
        function doTest(from: string, to: string, expected: string) {
            expect(FileUtils.getRelativePathTo(from, to)).to.equal(expected);
        }

        it("should get the relative path when the file is in the parent directory", () => {
            doTest("V:/testing/this/out", "V:/testing/this/to.ts", "../to.ts");
        });

        it("should get the relative path when the file is in a child directory", () => {
            doTest("V:/testing/this", "V:/testing/this/out/to.ts", "out/to.ts");
        });

        it("should get the relative path when the files are in different child directories", () => {
            doTest("V:/testing/this/child1", "V:/testing/this/child2/to.ts", "../child2/to.ts");
        });

        it("should get the relative path when the files are in the same directory", () => {
            doTest("V:/testing/this/out", "V:/testing/this/out/to.ts", "to.ts");
        });

        it("should get the relative path when the files are the same", () => {
            doTest("V:/testing/this/out", "V:/testing/this/out/to.ts", "to.ts");
        });
    });

    describe(nameof(FileUtils.getExtension), () => {
        function doTest(path: string, expected: string) {
            expect(FileUtils.getExtension(path)).to.equal(expected);
        }

        // copying behaviour from https://nodejs.org/api/path.html#path_path_extname_path

        it("should return a dot for a file that ends with a dot", () => {
            doTest("path/file.", ".");
        });

        it("should return only the last extension for a file name with multiple dots", () => {
            doTest("path/file.coffee.md", ".md");
        });

        it("should return an empty string when there's no dot in the file name", () => {
            doTest("path/file", "");
        });

        it("should return an empty string when the dot is at the start of the file name", () => {
            doTest("path/.file", "");
        });

        it("should return an empty string when there's no dot in the file name and a dot in the directory path", () => {
            doTest("path.something/file", "");
        });

        it("should return the extension for a .ts file", () => {
            doTest("path/file.ts", ".ts");
        });

        it("should return the extension for a .d.ts file", () => {
            doTest("path/file.d.ts", ".d.ts");
        });

        it("should return the extension for a .d.ts file that's upper case", () => {
            doTest("path/file.D.TS", ".D.TS");
        });

        it("should return the extension for a .js.map file", () => {
            doTest("path/file.js.map", ".js.map");
        });

        it("should return the extension for a .js.map file that's upper case", () => {
            doTest("path/file.JS.MAP", ".JS.MAP");
        });
    });
});
