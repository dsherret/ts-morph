import {expect} from "chai";
import {getCompilerOptionsFromTsConfig, FileUtils} from "./../../utils";
import * as errors from "./../../errors";
import * as testHelpers from "./../testHelpers";

describe(nameof(getCompilerOptionsFromTsConfig), () => {
    it("should throw an error when the path doesn't exist", () => {
        const host = testHelpers.getFileSystemHostWithFiles([]);
        expect(() => getCompilerOptionsFromTsConfig("tsconfig.json", host))
            .to.throw(errors.FileNotFoundError, `File not found: ${FileUtils.getStandardizedAbsolutePath("tsconfig.json")}`);
    });

    it("should throw an error when the file doesn't parse", () => {
        const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: "*&($%0583$#@%" }]);
        expect(() => getCompilerOptionsFromTsConfig("tsconfig.json", host)).to.throw(Error);
    });

    it("should get the compiler options plus the defaults when providing some", () => {
        const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
        const compilerOptions = getCompilerOptionsFromTsConfig("tsconfig.json", host);
        expect(compilerOptions).to.deep.equal({ rootDir: "test", target: 1 });
    });
});
