import { expect } from "chai";
import { VirtualFileSystemHost, FileSystemWrapper } from "../../../fileSystem";
import { getTsConfigParseResult, FileUtils } from "../../../utils";
import * as errors from "../../../errors";

describe(nameof(getTsConfigParseResult), () => {
    it("should throw an error when the path doesn't exist", () => {
        const fileSystemWrapper = new FileSystemWrapper(new VirtualFileSystemHost());
        expect(() => getTsConfigParseResult({
            tsConfigFilePath: "tsconfig.json",
            encoding: "utf-8",
            fileSystemWrapper
        })).to.throw(errors.FileNotFoundError, `File not found: /tsconfig.json`);
    });
});
