import { expect } from "chai";
import { TransactionalFileSystem, FileSystemHost, InMemoryFileSystemHost } from "../../fileSystem";
import { errors } from "../../errors";
import { TsConfigResolver } from "../../tsconfig";

describe(nameof(TsConfigResolver), () => {
    function getResolver(fileSystem: FileSystemHost) {
        const fileSystemWrapper = new TransactionalFileSystem(fileSystem);
        return new TsConfigResolver(fileSystemWrapper, "/tsconfig.json", "utf-8");
    }

    describe(nameof<TsConfigResolver>(r => r.getCompilerOptions), () => {
        function getCompilerOptions(fileSystem: FileSystemHost) {
            return getResolver(fileSystem).getCompilerOptions();
        }

        it("should throw an error when the path doesn't exist", () => {
            const host = new InMemoryFileSystemHost();
            expect(() => getCompilerOptions(host)).to.throw(errors.FileNotFoundError, `File not found: /tsconfig.json`);
        });

        it("should throw an error when the file doesn't parse", () => {
            const host = new InMemoryFileSystemHost();
            host.writeFileSync("tsconfig.json", "*&($%0583$#@%");
            expect(() => getCompilerOptions(host)).to.throw(Error);
        });

        it("should get the compiler options plus the defaults when providing some", () => {
            const host = new InMemoryFileSystemHost();
            host.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            expect(getCompilerOptions(host)).to.deep.equal({ rootDir: "/test", target: 1, configFilePath: "/tsconfig.json" });
        });

        it("should return an undefined target when it specifies something else", () => {
            const host = new InMemoryFileSystemHost();
            host.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "FUN" } }`);
            expect(getCompilerOptions(host)).to.deep.equal({ target: undefined, configFilePath: "/tsconfig.json" });
        });

        it("should get compiler options when using extends", () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "es5" }, "extends": "./base" }`);
            fs.writeFileSync("base.json", `{ "compilerOptions": { "rootDir": "/test" } }`);
            expect(getCompilerOptions(fs)).to.deep.equal({ rootDir: "/test", target: 1, configFilePath: "/tsconfig.json" });
        });
    });

    describe(nameof<TsConfigResolver>(r => r.getErrors), () => {
        function getErrors(fileSystem: FileSystemHost) {
            return getResolver(fileSystem).getErrors();
        }

        it("should get no errors when there are none", () => {
            const host = new InMemoryFileSystemHost();
            host.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            host.writeFileSync("main.ts", "");
            expect(getErrors(host)).to.deep.equal([]);
        });

        it("should get the error when specifying an invalid compiler option", () => {
            const host = new InMemoryFileSystemHost();
            host.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "FUN" } }`);
            host.writeFileSync("main.ts", "");
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
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            doTest(fs, {
                files: [],
                dirs: ["/test"]
            });
        });

        it("should add the files from tsconfig.json when there are no options", () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            doTest(fs, {
                files: ["/otherFile.ts", "/test/file.ts"],
                dirs: ["/", "/test"]
            });
        });

        it("should add the files from tsconfig.json, but exclude the outDir", () => {
            const fs = new InMemoryFileSystemHost();
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
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "exclude": ["test2"] }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test2/file2.ts", "");
            doTest(fs, {
                files: ["/otherFile.ts", "/test/file.ts"],
                dirs: ["/", "/test"]
            });
        });

        it("should get root dir files when an exclude is also specified", () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{
              "compilerOptions": { "rootDir": "./src" },
              "exclude": [ "./src/file2.ts" ]
            }`);
            fs.writeFileSync("/src/file1.ts", "");
            fs.writeFileSync("/src/file2.ts", "");
            doTest(fs, {
                files: ["/src/file1.ts"],
                dirs: ["/src"]
            });
        });

        it("should add the files from tsconfig.json, but only include the specified include", () => {
            const fs = new InMemoryFileSystemHost();
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
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("/tsconfig.json", `{ "compilerOptions": { "rootDir": "./test" } }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            doTest(fs, {
                files: ["/test/file.ts", "/test/test2/file2.ts"],
                dirs: ["/test", "/test/test2"]
            });
        });

        it("should add the files from tsconfig.json when using rootDirs", () => {
            const fs = new InMemoryFileSystemHost();
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
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "/test/test1", "rootDirs": ["/test/test2"] } }`);
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test1/file1.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            doTest(fs, {
                files: ["/test/test1/file1.ts", "/test/test2/file2.ts"],
                dirs: ["/test/test1", "/test/test2"]
            });
        });

        it(`should get files in the "files" array`, () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{
              "compilerOptions": { },
              "files": [ "./file1.ts", "./file2.ts" ]
            }`);
            fs.writeFileSync("/file1.ts", "");
            fs.writeFileSync("/file2.ts", "");
            fs.writeFileSync("/file3.ts", "");
            doTest(fs, {
                files: ["/file1.ts", "/file2.ts"],
                dirs: [
                    "/"
                ]
            });
        });

        it("should get root dir files when it's also specified as an include", () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{
              "compilerOptions": { "rootDir": "./src" },
              "include": [ "./src" ]
            }`);
            fs.writeFileSync("/src/file1.ts", "");
            fs.writeFileSync("/src/file2.ts", "");
            doTest(fs, {
                files: ["/src/file1.ts", "/src/file2.ts"],
                dirs: ["/src"]
            });
        });

        it(`should parse "files" absolutely`, () => {
            const fs = new InMemoryFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{
              "compilerOptions": {"rootDirs": ["/test/test1", "/test/test2"] },
              "files": [ "./file1.ts", "./file2.ts" ]
            }`);
            // these files will be ignored because they aren't properly specified in "files"
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test1/file1.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            doTest(fs, {
                files: [],
                dirs: ["/test/test1", "/test/test2"]
            });
        });

        it("should add the files from tsconfig.json when using extends", () => {
            const fs = new InMemoryFileSystemHost();
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
