import {expect} from "chai";
import {VirtualFileSystemHost} from "./../../fileSystem";
import {FileUtils} from "./../../utils";
import {getFileSystemHostWithFiles} from "./../testHelpers";

describe(nameof(FileUtils), () => {
    describe(nameof(FileUtils.ensureDirectoryExistsSync), () => {
        it("should ensure the specified directory exists and the parent directories", () => {
            const host = getFileSystemHostWithFiles([], ["/some"]);
            FileUtils.ensureDirectoryExistsSync(host, "/some/dir/path");
            expect(host.getCreatedDirectories()).to.deep.equal([
                "/some/dir",
                "/some/dir/path"
            ]);
        });
    });

    describe(nameof(FileUtils.ensureDirectoryExists), () => {
        it("should ensure the specified directory exists and the parent directories", async () => {
            const host = getFileSystemHostWithFiles([], ["/some"]);
            await FileUtils.ensureDirectoryExists(host, "/some/dir/path");
            expect(host.getCreatedDirectories()).to.deep.equal([
                "/some/dir",
                "/some/dir/path"
            ]);
        });
    });

    describe(nameof(FileUtils.getStandardizedAbsolutePath), () => {
        const fileSystem = new VirtualFileSystemHost();

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

    describe(nameof(FileUtils.filePathMatches), () => {
        it("should return false for a null path", () => {
            expect(FileUtils.filePathMatches(null, "test.ts")).to.be.false;
        });

        it("should return false for an empty path", () => {
            expect(FileUtils.filePathMatches("", "test.ts")).to.be.false;
        });

        it("should return true when both are null", () => {
            expect(FileUtils.filePathMatches(null, null)).to.be.true;
        });

        it("should return true when both are empty", () => {
            expect(FileUtils.filePathMatches("", "")).to.be.true;
        });

        it("should return false for empty search", () => {
            expect(FileUtils.filePathMatches("V:/dir/tests.ts", "")).to.be.false;
        });

        it("should return false for null search", () => {
            expect(FileUtils.filePathMatches("V:/dir/tests.ts", null)).to.be.false;
        });

        it("should return true for a file name only", () => {
            expect(FileUtils.filePathMatches("V:/dir/test.ts", "test.ts")).to.be.true;
        });

        it("should return true for a file name and dir", () => {
            expect(FileUtils.filePathMatches("V:/dir/test.ts", "dir/test.ts")).to.be.true;
        });

        it("should return true for a file name and dir with a slash at the front", () => {
            expect(FileUtils.filePathMatches("V:/dir/test.ts", "/dir/test.ts")).to.be.true;
        });

        it("should return true for a full match", () => {
            expect(FileUtils.filePathMatches("V:/dir/test.ts", "V:/dir/test.ts")).to.be.true;
        });

        it("should not error when the file path being searched for is longer", () => {
            expect(FileUtils.filePathMatches("V:/dir/test.ts", "V:/dir/dir/test.ts")).to.be.false;
        });

        it("should return false when the directory name doesn't exactly match", () => {
            expect(FileUtils.filePathMatches("V:/dir/test.ts", "ir/test.ts")).to.be.false;
        });
    });

    describe(nameof(FileUtils.getRelativePathTo), () => {
        function doTest(from: string, to: string, expected: string) {
            expect(FileUtils.getRelativePathTo(from, to)).to.equal(expected);
        }

        it("should get the relative path when the file is in the parent directory", () => {
            doTest("V:/testing/this/out/from.ts", "V:/testing/this/to.ts", "../to.ts");
        });

        it("should get the relative path when the file is in a child directory", () => {
            doTest("V:/testing/this/from.ts", "V:/testing/this/out/to.ts", "out/to.ts");
        });

        it("should get the relative path when the files are in different child directories", () => {
            doTest("V:/testing/this/child1/from.ts", "V:/testing/this/child2/to.ts", "../child2/to.ts");
        });

        it("should get the relative path when the files are in the same directory", () => {
            doTest("V:/testing/this/out/from.ts", "V:/testing/this/out/to.ts", "to.ts");
        });

        it("should get the relative path when the files are the same", () => {
            doTest("V:/testing/this/out/to.ts", "V:/testing/this/out/to.ts", "to.ts");
        });
    });
});
