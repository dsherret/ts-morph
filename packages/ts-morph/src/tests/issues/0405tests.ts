import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #405", () => {
    it("should not error when getting properties from type", () => {
        const { project } = getInfoFromText("", { includeLibDts: true });
        const fileSystem = project.getFileSystem();

        fileSystem.writeFileSync("/node_modules/@types/jquery/index.d.ts", `
declare module 'jquery' {
    export = jQuery;
}

declare const jQuery: JQueryStatic;

interface JQueryStatic {
    test: string;
}
`);
        fileSystem.writeFileSync("/node_modules/@types/jquery/package.json", `{ "name": "@types/jquery", "version": "1.0.0", "typeScriptVersion": "2.3" }`);

        const sourceFile1 = project.createSourceFile("/file1.js", `import $ from "jquery";`);
        const sourceFile2 = project.createSourceFile("/file2.js", "");
        sourceFile1.move("/file1.ts");
        expect(() => sourceFile2.move("/file2.ts")).to.not.throw();
    });
});
