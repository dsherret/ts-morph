import {expect} from "chai";
import {VirtualFileSystemHost, FileSystemWrapper} from "../../../fileSystem";
import {getPathsFromTsConfigParseResult, getTsConfigParseResult, getCompilerOptionsFromTsConfigParseResult, FileUtils} from "../../../utils";
import * as errors from "../../../errors";

describe(nameof(getPathsFromTsConfigParseResult), () => {
    function getFileAndDirPaths(fileSystem: VirtualFileSystemHost) {
        const fileSystemWrapper = new FileSystemWrapper(fileSystem);
        const tsConfigParseResult = getTsConfigParseResult({
            tsConfigFilePath: "tsconfig.json",
            encoding: "utf-8",
            fileSystemWrapper
        });
        const compilerOptions = getCompilerOptionsFromTsConfigParseResult({
            tsConfigFilePath: "tsconfig.json",
            fileSystemWrapper,
            tsConfigParseResult
        });
        const result = getPathsFromTsConfigParseResult({
            tsConfigFilePath: "tsconfig.json",
            encoding: "utf-8",
            fileSystemWrapper,
            tsConfigParseResult,
            compilerOptions: compilerOptions.options
        });
        return {
            filePaths: result.filePaths.sort(),
            directoryPaths: result.directoryPaths.sort()
        };
    }

    function doTest(fileSystem: VirtualFileSystemHost, expectedPaths: { files: string[]; dirs: string[]; }) {
        expect(getFileAndDirPaths(fileSystem)).to.deep.equal({
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
});
