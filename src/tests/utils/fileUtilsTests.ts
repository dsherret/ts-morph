import * as assert from "assert";
import {expect} from "chai";
import * as os from "os";
import {FileUtils} from "./../../utils";

describe(nameof(FileUtils), () => {
    describe(nameof(FileUtils.getAbsoluteOrRelativePathFromPath), () => {
        const isWindows = os.platform() === "win32";

        // too lazy to abstract this out because I'm pretty sure it works... my machine will get the windows tests and
        // the CI linux machine will get the other tests
        if (isWindows) {
            it("should get the absolute path when absolute on windows", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("C:\\absolute\\path", "C:\\basedir")).to.equal("C:\\absolute\\path");
            });

            it("should get the relative path when relative on windows", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("relative\\path", "C:\\basedir")).to.equal("C:\\basedir\\relative\\path");
            });

            it("should get the relative path without dots on windows", () => {
                expect(FileUtils.getAbsoluteOrRelativePathFromPath("..\\relative\\path", "C:\\basedir")).to.equal("C:\\relative\\path");
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

    describe(nameof(FileUtils.filePathMatches), () => {
        // todo: use expect instead of assert
        it("should return false for a null path", () => {
            assert.equal(FileUtils.filePathMatches(null, "test.ts"), false);
        });

        it("should return false for an empty path", () => {
            assert.equal(FileUtils.filePathMatches("", "test.ts"), false);
        });

        it("should return true when both are null", () => {
            assert.equal(FileUtils.filePathMatches(null, null), true);
        });

        it("should return true when both are empty", () => {
            assert.equal(FileUtils.filePathMatches("", ""), true);
        });

        it("should return false for empty search", () => {
            assert.equal(FileUtils.filePathMatches("V:/dir/tests.ts", ""), false);
        });

        it("should return false for null search", () => {
            assert.equal(FileUtils.filePathMatches("V:/dir/tests.ts", null), false);
        });

        it("should return true for a file name only", () => {
            assert.equal(FileUtils.filePathMatches("V:/dir/test.ts", "test.ts"), true);
        });

        it("should return true for a file name and dir", () => {
            assert.equal(FileUtils.filePathMatches("V:/dir/test.ts", "dir/test.ts"), true);
        });

        it("should return true for a file name and dir with a slash at the front", () => {
            assert.equal(FileUtils.filePathMatches("V:/dir/test.ts", "/dir/test.ts"), true);
        });

        it("should return true for a full match", () => {
            assert.equal(FileUtils.filePathMatches("V:/dir/test.ts", "V:/dir/test.ts"), true);
        });

        it("should not error when the file path being searched for is longer", () => {
            assert.equal(FileUtils.filePathMatches("V:/dir/test.ts", "V:/dir/dir/test.ts"), false);
        });

        it("should return false when the directory name doesn't exactly match", () => {
            assert.equal(FileUtils.filePathMatches("V:/dir/test.ts", "ir/test.ts"), false);
        });
    });
});
