import { expect } from "chai";
import * as errors from "../../../errors";
import { FileSystemHost } from "../../../fileSystem";
import { CompilerOptions } from "../../../typescript";
import { getCompilerOptionsFromTsConfig } from "../../../utils";
import * as testHelpers from "../../testHelpers";

// Remember, need this function because it's public

describe(nameof(getCompilerOptionsFromTsConfig), () => {
    it("should throw an error when the path doesn't exist", () => {
        const host = testHelpers.getFileSystemHostWithFiles([]);
        expect(() => getCompilerOptionsFromTsConfig("tsconfig.json", { fileSystem: host }))
            .to.throw(errors.FileNotFoundError, `File not found: /tsconfig.json`);
    });

    it("should throw an error when the file doesn't parse", () => {
        const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: "*&($%0583$#@%" }]);
        expect(() => getCompilerOptionsFromTsConfig("tsconfig.json", { fileSystem: host })).to.throw(Error);
    });

    function doTest(host: FileSystemHost, expected: { errorCount: number, options: CompilerOptions }) {
        const compilerOptionsResult = getCompilerOptionsFromTsConfig("tsconfig.json", { fileSystem: host });
        expect(compilerOptionsResult.options).to.deep.equal(expected.options);
        expect(compilerOptionsResult.errors.length).to.equal(expected.errorCount);
    }

    it("should get the compiler options plus the defaults when providing some", () => {
        const host = testHelpers.getFileSystemHostWithFiles([{
            filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`
        }, {
            filePath: "main.ts", text: ""
        }]);
        doTest(host, { options: { rootDir: "/test", target: 1 }, errorCount: 0 });
    });

    it("should get the error when specifying an invalid compiler option", () => {
        const host = testHelpers.getFileSystemHostWithFiles([{
            filePath: "tsconfig.json", text: `{ "compilerOptions": { "target": "FUN" } }`
        }, {
            filePath: "main.ts", text: ""
        }]);
        doTest(host, { options: { target: undefined }, errorCount: 1 });
    });

    it("should get compiler options when using extends", () => {
        const host = testHelpers.getFileSystemHostWithFiles([{
            filePath: "tsconfig.json", text: `{ "compilerOptions": { "target": "es5" }, "extends": "./base" }`
        }, {
            filePath: "base.json", text: `{ "compilerOptions": { "rootDir": "/test" } }`
        }, {
            filePath: "main.ts", text: ""
        }]);
        doTest(host, { options: { target: 1, rootDir: "/test" }, errorCount: 0 });
    });
});
