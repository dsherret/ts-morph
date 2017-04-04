import * as assert from "assert";
import {FileUtils} from "./../../utils";

describe("FileUtils", () => {
    describe("#filePathMatches()", () => {
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
