import {expect} from "chai";
import {CompilerOptionsResolver, FileUtils} from "./../../utils";
import * as errors from "./../../errors";
import * as testHelpers from "./../testHelpers";

describe(nameof(CompilerOptionsResolver), () => {
    describe(nameof<CompilerOptionsResolver>(r => r.getCompilerOptions), () => {
        describe("no constructor", () => {
            it(`should get the default compiler options when not providing anything and no tsconfig exists`, () => {
                const host = testHelpers.getFileSystemHostWithFiles([]);
                const resolver = new CompilerOptionsResolver(host, {});
                const compilerOptions = resolver.getCompilerOptions();

                expect(compilerOptions).to.deep.equal({});
            });

            it(`should not get the compiler options from tsconfig.json when not providing anything and a tsconfig exists`, () => {
                const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
                const resolver = new CompilerOptionsResolver(host, {});
                const compilerOptions = resolver.getCompilerOptions();
                expect(compilerOptions).to.deep.equal({});
            });
        });

        describe("compiler options", () => {
            it(`should get empty compiler options when providing an empty compiler options object`, () => {
                const host = testHelpers.getFileSystemHostWithFiles([]);
                const resolver = new CompilerOptionsResolver(host, { compilerOptions: {} });
                const compilerOptions = resolver.getCompilerOptions();

                expect(compilerOptions).to.deep.equal({});
            });

            it(`should use compiler options when providing a tsconfig path`, () => {
                const host = testHelpers.getFileSystemHostWithFiles([]);
                const resolver = new CompilerOptionsResolver(host, {
                    tsConfigFilePath: "test.txt",
                    compilerOptions: {
                        rootDir: "test",
                        target: 1
                    }
                });
                const compilerOptions = resolver.getCompilerOptions();
                expect(compilerOptions).to.deep.equal({ rootDir: "test", target: 1 });
            });
        });

        describe("tsconfig", () => {
            it("should throw an error when the path doesn't exist", () => {
                const host = testHelpers.getFileSystemHostWithFiles([]);
                const resolver = new CompilerOptionsResolver(host, { tsConfigFilePath: "tsconfig.json" });
                expect(() => resolver.getCompilerOptions())
                    .to.throw(errors.FileNotFoundError, `File not found: ${FileUtils.getStandardizedAbsolutePath("tsconfig.json")}`);
            });

            it("should throw an error when the file doesn't parse", () => {
                const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: "*&($%0583$#@%" }]);
                const resolver = new CompilerOptionsResolver(host, { tsConfigFilePath: "tsconfig.json" });
                expect(() => resolver.getCompilerOptions()).to.throw(Error);
            });

            it("should get the compiler options plus the defaults when providing some", () => {
                const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
                const resolver = new CompilerOptionsResolver(host, { tsConfigFilePath: "tsconfig.json" });
                const compilerOptions = resolver.getCompilerOptions();
                expect(compilerOptions).to.deep.equal({ rootDir: "test", target: 1 });
            });
        });
    });
});
