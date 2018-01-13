import {expect} from "chai";
import {VirtualFileSystemHost} from "./../../../fileSystem";
import {getFilePathsFromTsConfigParseResult, getTsConfigParseResult, getCompilerOptionsFromTsConfigParseResult, FileUtils} from "./../../../utils";
import * as errors from "./../../../errors";

describe(nameof(getFilePathsFromTsConfigParseResult), () => {
    function getFilePaths(fileSystem: VirtualFileSystemHost) {
        const parseResult = getTsConfigParseResult("tsconfig.json", fileSystem);
        const compilerOptions = getCompilerOptionsFromTsConfigParseResult("tsconfig.json", fileSystem, parseResult);
        return getFilePathsFromTsConfigParseResult("tsconfig.json", fileSystem, parseResult, compilerOptions.options);
    }

    function doTest(fileSystem: VirtualFileSystemHost, expectedPaths: string[]) {
        expect(getFilePaths(fileSystem).sort()).to.deep.equal(expectedPaths.sort());
    }

    it("should get the file paths when there are none", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
        doTest(fs, []);
    });

    it("should add the files from tsconfig.json, but exclude the outDir", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "outDir": "test2" } }`);
        fs.writeFileSync("/otherFile.ts", "");
        fs.writeFileSync("/test/file.ts", "");
        fs.writeFileSync("/test2/file2.ts", "");
        doTest(fs, ["/otherFile.ts", "/test/file.ts"]);
    });

    it("should add the files from tsconfig.json, but exclude the specified exclude", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "exclude": ["test2"] }`);
        fs.writeFileSync("/otherFile.ts", "");
        fs.writeFileSync("/test/file.ts", "");
        fs.writeFileSync("/test2/file2.ts", "");
        doTest(fs, ["/otherFile.ts", "/test/file.ts"]);
    });

    it("should add the files from tsconfig.json, but only include the specified include", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "include": ["test2"] }`);
        fs.writeFileSync("/otherFile.ts", "");
        fs.writeFileSync("/test/file.ts", "");
        fs.writeFileSync("/test2/file2.ts", "");
        doTest(fs, ["/test2/file2.ts"]);
    });

    it("should add the files from tsconfig.json when using rootDir", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test" } }`);
        fs.writeFileSync("/otherFile.ts", "");
        fs.writeFileSync("/test/file.ts", "");
        fs.writeFileSync("/test/test2/file2.ts", "");
        doTest(fs, ["/test/file.ts", "/test/test2/file2.ts"]);
    });

    it("should add the files from tsconfig.json when using rootDirs", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDirs": ["/test/test1", "/test/test2"] } }`);
        fs.writeFileSync("/test/file.ts", "");
        fs.writeFileSync("/test/test1/file1.ts", "");
        fs.writeFileSync("/test/test2/file2.ts", "");
        doTest(fs, ["/test/test1/file1.ts", "/test/test2/file2.ts"]);
    });

    it("should add the files from tsconfig.json when using rootDir and rootDirs", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "/test/test1", "rootDirs": ["/test/test2"] } }`);
        fs.writeFileSync("/test/file.ts", "");
        fs.writeFileSync("/test/test1/file1.ts", "");
        fs.writeFileSync("/test/test2/file2.ts", "");
        doTest(fs, ["/test/test1/file1.ts", "/test/test2/file2.ts"]);
    });
});
