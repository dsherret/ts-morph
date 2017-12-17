import {expect} from "chai";
import * as os from "os";
import {FileUtils} from "./../../utils";
import {getFileSystemHostWithFiles} from "./../testHelpers";

describe(nameof(FileUtils), () => {
    describe(nameof(FileUtils.ensureDirectoryExistsSync), () => {
        it("should ensure the specified directory exists and the parent directories", () => {
            const host = getFileSystemHostWithFiles([], ["/some"]);
            FileUtils.ensureDirectoryExistsSync(host, FileUtils.getStandardizedAbsolutePath("/some/dir/path"));
            expect(host.getCreatedDirectories()).to.deep.equal([
                FileUtils.getStandardizedAbsolutePath("/some/dir"),
                FileUtils.getStandardizedAbsolutePath("/some/dir/path")
            ]);
        });
    });

    describe(nameof(FileUtils.ensureDirectoryExists), () => {
        it("should ensure the specified directory exists and the parent directories", async () => {
            const host = getFileSystemHostWithFiles([], ["/some"]);
            await FileUtils.ensureDirectoryExists(host, FileUtils.getStandardizedAbsolutePath("/some/dir/path"));
            expect(host.getCreatedDirectories()).to.deep.equal([
                FileUtils.getStandardizedAbsolutePath("/some/dir"),
                FileUtils.getStandardizedAbsolutePath("/some/dir/path")
            ]);
        });
    });

    describe(nameof(FileUtils.getAbsoluteOrRelativePathFromPath), () => {
        const isWindows = os.platform() === "win32";

        // too lazy to abstract this out because I'm pretty sure it works... my machine will get the windows tests and
        // the CI linux machine will get the other tests
        if (isWindows) {
            // uses forward slashes in result because that's what the ts compiler does
            it("should get the absolute path when absolute on windows", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("C:\\absolute\\path", "C:\\basedir")).to.equal("C:/absolute/path");
            });

            it("should get the relative path when relative on windows", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("relative\\path", "C:\\basedir")).to.equal("C:/basedir/relative/path");
            });

            it("should get the relative path without dots on windows", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("..\\relative\\path", "C:\\basedir")).to.equal("C:/relative/path");
            });
        }
        else {
            it("should get the absolute path when absolute on linux", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("/absolute/path", "/basedir")).to.equal("/absolute/path");
            });

            it("should get the relative path when relative on linux", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("relative/path", "/basedir")).to.equal("/basedir/relative/path");
            });

            it("should get the relative path without dots on linux", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("../relative/path", "/basedir")).to.equal("/relative/path");
            });
        }
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
});
