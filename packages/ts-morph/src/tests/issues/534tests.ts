import { InMemoryFileSystemHost } from "@ts-morph/common";
import { expect } from "chai";
import { Project } from "../../Project";
describe("tests for issue #534", () => {
    it("should use the tsconfig.json file path for type reference directive resolution", () => {
        const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });
        fileSystem.mkdirSync("/dir");
        fileSystem.mkdirSync("/dir/node_modules");
        fileSystem.mkdirSync("/dir/node_modules/@types");
        fileSystem.mkdirSync("/dir/node_modules/@types/my-package");
        fileSystem.writeFileSync("/dir/node_modules/@types/my-package/package.json", `
{
    "name": "my-package",
    "version": "0.0.1",
    "main": "index.js",
    "typings": "index.d.ts",
    "typescript": { "definition": "index.d.ts" }
}`);
        fileSystem.writeFileSync("/dir/node_modules/@types/my-package/index.d.ts", `
declare namespace MyPackage {
    interface MyPackageStatic {
        myExport: {};
    }
}
declare const myPackage: MyPackage.MyPackageStatic;
declare module "my-package" {
    export = myPackage;
}
`);
        fileSystem.mkdirSync("/dir/src");
        fileSystem.writeFileSync("/dir/src/index.ts", `
import { myExport } from "my-package";
`);
        fileSystem.writeFileSync("/dir/tsconfig.json", `{
    "compilerOptions": {
        "strict": true,
        "module": "commonjs",
        "target": "es5",
        "noLib": true,
        "rootDir": "./src",
        "types": ["my-package"]
    }
}`);
        const project = new Project({
            fileSystem,
            tsConfigFilePath: "/dir/tsconfig.json"
        });

        const diagnostics = project.getPreEmitDiagnostics().filter(d => d.getCode() !== 2318);
        const diagnosticMessages = diagnostics.map(d => d.getMessageText());

        expect(diagnosticMessages).to.deep.equal([]);
    });
});
