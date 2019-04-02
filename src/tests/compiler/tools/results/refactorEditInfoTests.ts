import { expect } from "chai";
import { RefactorEditInfo } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(RefactorEditInfo), () => {
    describe(nameof<RefactorEditInfo>(a => a.applyChanges), () => {
        it("should apply the refactor edits on all files", () => {

//             const { sourceFile, project } = getInfoFromText<FunctionDeclaration>("export function f(a: number, b: string[]) { }", {filePath: "f.ts"});
//             const languageService = project.getLanguageService();
// const sourceFile2 = project.createSourceFile("a.ts", `import {f} = require("./f"); f(1, "b");`);
// // sourceFile.getFunctionOrThrow("f").convertParamsToDestructuredObject();
// expect(sourceFile.getText()).to.equal(`export function f({ a, b }: { a: number; b: string[]; }) { }`);
// expect(sourceFile2.getText()).to.equal(`import {f} = require("./f"); f(1, "b");`);


            const { sourceFile, project } = getInfoFromText("export function f(a: number, b: string) { }", { filePath: "/f.ts" });
            const languageService = project.getLanguageService();
            const g = project.createSourceFile("/g.ts", "import {f} = require('./f'); f(1, '')");
            const param = sourceFile.getFunctionOrThrow("f").getParameters()[0];
            const edits = languageService.getEditsForRefactor(sourceFile, {}, param,
            "Convert parameters to destructured object", "Convert parameters to destructured object", {})!;
            edits.applyChanges();
            expect(sourceFile.getFullText()).to.equal("export function f({ a, b }: { a: number; b: string; }) { }");
            expect(g.getFullText()).to.equal(``);

        });
    });
});
// const { sourceFile, project } = getInfoFromText<FunctionDeclaration>("export function f(a: number, b: string[]) { }", {filePath: "f.ts"});
// const sourceFile2 = project.createSourceFile("a.ts", `import {f} = require("./f"); f(1, "b");`);
// sourceFile.getFunctionOrThrow("f").convertParamsToDestructuredObject();
// expect(sourceFile.getText()).to.equal(`export function f({ a, b }: { a: number; b: string[]; }) { }`);
// expect(sourceFile2.getText()).to.equal(`import {f} = require("./f"); f(1, "b");`);