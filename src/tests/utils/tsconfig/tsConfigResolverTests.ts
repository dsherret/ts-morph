﻿import { expect } from "chai";
import * as errors from "../../../errors";
import { FileSystemHost, FileSystemWrapper, VirtualFileSystemHost } from "../../../fileSystem";
import { TsConfigResolver } from "../../../utils";
import * as testHelpers from "../../testHelpers";

describe(nameof(TsConfigResolver), () => {
    function getResolver(fileSystem: FileSystemHost) {
        const fileSystemWrapper = new FileSystemWrapper(fileSystem);
        return new TsConfigResolver(fileSystemWrapper, "/tsconfig.json", "utf-8");
    }

    describe(nameof<TsConfigResolver>(r => r.getCompilerOptions), () => {
        function getCompilerOptions(fileSystem: FileSystemHost) {
            return getResolver(fileSystem).getCompilerOptions();
        }

        it("should throw an error when the path doesn't exist", () => {
            const host = testHelpers.getFileSystemHostWithFiles([]);
            expect(() => getCompilerOptions(host)).to.throw(errors.FileNotFoundError, `File not found: /tsconfig.json`);
        });

        it("should throw an error when the file doesn't parse", () => {
            const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: "*&($%0583$#@%" }]);
            expect(() => getCompilerOptions(host)).to.throw(Error);
        });

        it("should get the compiler options plus the defaults when providing some", () => {
            const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
            expect(getCompilerOptions(host)).to.deep.equal({ rootDir: "/test", target: 1 });
        });

        it("should return an undefined target when it specifies something else", () => {
            const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "target": "FUN" } }` }]);
            expect(getCompilerOptions(host)).to.deep.equal({ target: undefined });
        });

        it("should get compiler options when using extends", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "es5" }, "extends": "./base" }`);
            fs.writeFileSync("base.json", `{ "compilerOptions": { "rootDir": "/test" } }`);
            expect(getCompilerOptions(fs)).to.deep.equal({ rootDir: "/test", target: 1 });
        });
    });

    describe(nameof<TsConfigResolver>(r => r.getErrors), () => {
        function getErrors(fileSystem: FileSystemHost) {
            return getResolver(fileSystem).getErrors();
        }

        it("should get no errors when there are none", () => {
            const host = testHelpers.getFileSystemHostWithFiles([{
                filePath: "tsconfig.json",
                text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`
            }, {
                filePath: "main.ts", text: ""
            }]);
            expect(getErrors(host)).to.deep.equal([]);
        });

        it("should get the error when specifying an invalid compiler option", () => {
            const host = testHelpers.getFileSystemHostWithFiles([{
                filePath: "tsconfig.json", text: `{ "compilerOptions": { "target": "FUN" } }`
            }, {
                filePath: "main.ts", text: ""
            }]);
            expect(getErrors(host).length).to.equal(1);
        });
    });

    describe(nameof<TsConfigResolver>(r => r.getPaths), () => {
        function getPaths(fileSystem: FileSystemHost) {
            return getResolver(fileSystem).getPaths();
        }

        function doTest(fileSystem: FileSystemHost, expectedPaths: { files: string[]; dirs: string[]; }) {
            expect(getPaths(fileSystem)).to.deep.equal({
                filePaths: expectedPaths.files.sort(),
                directoryPaths: expectedPaths.dirs.sort()
            });
        }

        it("should get the file paths when there are none", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            doTest(fs, {
                files: [],
                dirs: ["/test"]
            });
        });

        it("should add the files from tsconfig.json when there are no options", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            doTest(fs, {
                files: ["/otherFile.ts", "/test/file.ts"],
                dirs: ["/", "/test"]
            });
        });

        it("should add the files from tsconfig.json, but exclude the outDir", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "outDir": "test2" } }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test2/file2.ts", "");
            doTest(fs, {
                files: ["/otherFile.ts", "/test/file.ts"],
                dirs: ["/", "/test"]
            });
        });

        it("should add the files from tsconfig.json, but exclude the specified exclude", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "exclude": ["test2"] }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test2/file2.ts", "");
            doTest(fs, {
                files: ["/otherFile.ts", "/test/file.ts"],
                dirs: ["/", "/test"]
            });
        });

        it("should add the files from tsconfig.json, but only include the specified include", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "include": ["test2"] }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test2/file2.ts", "");
            doTest(fs, {
                files: ["/test2/file2.ts"],
                dirs: ["/test2"]
            });
        });

        it("should add the files from tsconfig.json when using rootDir", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test" } }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            doTest(fs, {
                files: ["/test/file.ts", "/test/test2/file2.ts"],
                dirs: ["/test", "/test/test2"]
            });
        });

        it("should add the files from tsconfig.json when using rootDirs", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDirs": ["/test/test1", "/test/test2"] } }`);
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test1/file1.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            fs.writeFileSync("/test/test2/sub/file3.ts", "");
            doTest(fs, {
                files: ["/test/test1/file1.ts", "/test/test2/file2.ts", "/test/test2/sub/file3.ts"],
                dirs: ["/test/test1", "/test/test2", "/test/test2/sub"]
            });
        });

        it("should add the files from tsconfig.json when using rootDir and rootDirs", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "/test/test1", "rootDirs": ["/test/test2"] } }`);
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test1/file1.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            doTest(fs, {
                files: ["/test/test1/file1.ts", "/test/test2/file2.ts"],
                dirs: ["/test/test1", "/test/test2"]
            });
        });

        it("should correctly parse file paths relative to rootDirs", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{
              "compilerOptions": {"rootDirs": ["/test/test1", "/test/test2"] },
              "files": [ "./file1.ts", "./file2.ts" ]
            }`);
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test1/file1.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            doTest(fs, {
                files: ["/test/test1/file1.ts", "/test/test2/file2.ts"],
                dirs: []
            });
        });

        it("should add the files from tsconfig.json when using extends", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { }, "extends": "./base" }`);
            fs.writeFileSync("base.json", `{ "compilerOptions": { "rootDir": "/test" } }`);
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test2/file2.ts", "");
            doTest(fs, {
                files: ["/test/file.ts"],
                dirs: ["/test"]
            });
        });
    });
});
