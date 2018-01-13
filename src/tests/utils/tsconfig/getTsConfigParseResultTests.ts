import {expect} from "chai";
import {VirtualFileSystemHost} from "./../../../fileSystem";
import {getTsConfigParseResult, FileUtils} from "./../../../utils";
import * as errors from "./../../../errors";

describe(nameof(getTsConfigParseResult), () => {
    it("should throw an error when the path doesn't exist", () => {
        const fs = new VirtualFileSystemHost();
        expect(() => getTsConfigParseResult("tsconfig.json", fs)).to.throw(errors.FileNotFoundError, `File not found: /tsconfig.json`);
    });
});
