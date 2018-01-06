import {expect} from "chai";
import {VirtualFileSystemHost} from "./../../../fileSystem";
import {getInfoFromTsConfig, FileUtils} from "./../../../utils";
import * as errors from "./../../../errors";

describe(nameof(getInfoFromTsConfig), () => {
    it("should throw an error when the path doesn't exist", () => {
        const fs = new VirtualFileSystemHost();
        expect(() => getInfoFromTsConfig("tsconfig.json", fs, { shouldGetFilePaths: true })).to.throw(errors.FileNotFoundError, `File not found: /tsconfig.json`);
    });

    it("should get the error when specifying an invalid compiler option", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "FUN" } }`);
        const result = getInfoFromTsConfig("tsconfig.json", fs, { shouldGetFilePaths: true });
        expect(result.errors.length).to.equal(1);
    });

    it("should get the compiler options and get the file paths", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
        const info = getInfoFromTsConfig("tsconfig.json", fs, { shouldGetFilePaths: true });
        expect(info).to.deep.equal({ compilerOptions: { rootDir: "/test", target: 1 }, filePaths: [], errors: [] });
    });

    it("should get the compiler options and not get the file paths", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
        const info = getInfoFromTsConfig("tsconfig.json", fs, { shouldGetFilePaths: false });
        expect(info).to.deep.equal({ compilerOptions: { rootDir: "/test", target: 1 }, errors: [] });
    });

    it("should add the files from tsconfig.json", () => {
        const fs = new VirtualFileSystemHost();
        fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
        fs.writeFileSync("/test/file.ts", "");
        fs.writeFileSync("/test/test2/file2.ts", "");
        const info = getInfoFromTsConfig("tsconfig.json", fs, { shouldGetFilePaths: true });
        expect(info.filePaths!.sort()).to.deep.equal(["/test/file.ts", "/test/test2/file2.ts"].sort());
    });
});
