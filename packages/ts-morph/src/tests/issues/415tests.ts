import { ScriptTarget } from "@ts-morph/common";
import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";
describe("tests for issue #415", () => {
    it("should work when using type roots and types in a folder outside the root dir", () => {
        const { project } = getInfoFromText("", {
            includeLibDts: true,
            compilerOptions: {
                target: ScriptTarget.ES5,
                rootDir: "src",
                typeRoots: ["typings"]
            }
        });
        const fileSystem = project.getFileSystem();

        fileSystem.writeFileSync("/typings/jquery/index.d.ts", `
declare module 'jquery' {
    export = jQuery;
}

declare const jQuery: JQueryStatic;

interface JQueryStatic {
    test: string;
}
`);

        const sourceFile = project.createSourceFile("/src/index.ts", `import * as $ from "jquery"; const myVar = $;`);
        const varDec = sourceFile.getVariableDeclarationOrThrow("myVar");

        expect(varDec.getType().getText()).to.equal("JQueryStatic");
    });
});
