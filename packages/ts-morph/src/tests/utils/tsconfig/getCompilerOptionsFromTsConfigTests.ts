import { CompilerOptions, errors, FileSystemHost } from "@ts-morph/common";
import { expect } from "chai";
import { getCompilerOptionsFromTsConfig } from "../../../utils";
import * as testHelpers from "../../testHelpers";

// Remember, need this function because it's public

describe("getCompilerOptionsFromTsConfig", () => {
    // only do a basic test because this is already tested in the shared package

    function doTest(host: FileSystemHost, expected: { errorCount: number; options: CompilerOptions; }) {
        const compilerOptionsResult = getCompilerOptionsFromTsConfig("tsconfig.json", { fileSystem: host });
        expect(compilerOptionsResult.options).to.deep.equal(expected.options);
        expect(compilerOptionsResult.errors.length).to.equal(expected.errorCount);
    }

    it("should get the error when specifying an invalid compiler option", () => {
        const host = testHelpers.getFileSystemHostWithFiles([{
            filePath: "tsconfig.json",
            text: `{ "compilerOptions": { "target": "FUN" } }`,
        }, {
            filePath: "main.ts",
            text: "",
        }]);
        doTest(host, { options: { target: undefined, configFilePath: "/tsconfig.json" }, errorCount: 1 });
    });
});
