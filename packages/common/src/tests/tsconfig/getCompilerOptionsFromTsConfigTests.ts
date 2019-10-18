import { expect } from "chai";
import { errors } from "../../errors";
import { FileSystemHost, InMemoryFileSystemHost } from "../../fileSystem";
import { getCompilerOptionsFromTsConfig } from "../../tsconfig";
import { CompilerOptions } from "../../typescript";

// Remember, need this function because it's public

describe(nameof(getCompilerOptionsFromTsConfig), () => {
    it("should throw an error when the path doesn't exist", () => {
        const fileSystem = new InMemoryFileSystemHost();
        expect(() => getCompilerOptionsFromTsConfig("tsconfig.json", { fileSystem }))
            .to.throw(errors.FileNotFoundError, `File not found: /tsconfig.json`);
    });

    it("should throw an error when the file doesn't parse", () => {
        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", "*&($%0583$#@%");
        expect(() => getCompilerOptionsFromTsConfig("tsconfig.json", { fileSystem })).to.throw(Error);
    });

    function doTest(host: FileSystemHost, expected: { errorCount: number; options: CompilerOptions; }) {
        const compilerOptionsResult = getCompilerOptionsFromTsConfig("tsconfig.json", { fileSystem: host });
        expect(compilerOptionsResult.options).to.deep.equal(expected.options);
        expect(compilerOptionsResult.errors.length).to.equal(expected.errorCount);
    }

    it("should get the compiler options plus the defaults when providing some", () => {
        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
        fileSystem.writeFileSync("main.ts", "");
        doTest(fileSystem, { options: { rootDir: "/test", target: 1, configFilePath: "/tsconfig.json" }, errorCount: 0 });
    });

    it("should get the error when specifying an invalid compiler option", () => {
        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "FUN" } }`);
        fileSystem.writeFileSync("main.ts", "");
        doTest(fileSystem, { options: { target: undefined, configFilePath: "/tsconfig.json" }, errorCount: 1 });
    });

    it("should get compiler options when using extends", () => {
        const fileSystem = new InMemoryFileSystemHost();
        fileSystem.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "es5" }, "extends": "./base" }`);
        fileSystem.writeFileSync("base.json", `{ "compilerOptions": { "rootDir": "/test" } }`);
        fileSystem.writeFileSync("main.ts", "");
        doTest(fileSystem, { options: { target: 1, rootDir: "/test", configFilePath: "/tsconfig.json" }, errorCount: 0 });
    });
});
