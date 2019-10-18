import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { RefactorEditInfo } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(RefactorEditInfo), () => {
    describe(nameof<RefactorEditInfo>(a => a.applyChanges), () => {
        it("should apply the refactor 'Move to a new file'", () => {
            const {
                sourceFile,
                project
            } = getInfoFromText("function z(a: number, b: string) { return `${b} ${a}`; }\nexport const c = z(1, 'a')", { filePath: "/f.ts" });
            const languageService = project.getLanguageService();
            expect(project.getSourceFile("z.ts")).to.be.undefined;
            const node = sourceFile.getStatements()[0];
            const edits = languageService.getEditsForRefactor(sourceFile, {}, node, "Move to a new file", "Move to a new file", {})!;
            edits.applyChanges();
            expect(sourceFile.getFullText()).to.equal("import { z } from \"./z\";\n\nexport const c = z(1, 'a')");
            expect(project.getSourceFileOrThrow("z.ts").getFullText().trim()).to.equal("export function z(a: number, b: string) { return `${b} ${a}`; }");
        });

        it("should apply refactor 'Remove braces from arrow function'", () => {
            const { sourceFile, project } = getInfoFromText("const b = 1; const f = (a:any) => { return 1 }", { filePath: "/f.ts" });
            const languageService = project.getLanguageService();
            const node = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.EqualsGreaterThanToken);
            const edits = languageService.getEditsForRefactor(
                sourceFile,
                {},
                node,
                "Add or remove braces in an arrow function",
                "Remove braces from arrow function",
                {}
            )!;
            edits.applyChanges();
            expect(sourceFile.getFullText()).to.equal("const b = 1; const f = (a:any) => 1");
        });

        it("should apply refactor 'Convert named imports to namespace import'", () => {
            const { sourceFile, project } = getInfoFromText("import {a} from 'a'; export const c = a(1) + a(2)", { filePath: "/f.ts" });
            const languageService = project.getLanguageService();
            const node = sourceFile.getImportDeclarations()[0];
            const edits = languageService.getEditsForRefactor(sourceFile, {}, node, "Convert import", "Convert named imports to namespace import", {})!;
            edits.applyChanges();
            expect(sourceFile.getFullText()).to.equal("import * as a_1 from 'a'; export const c = a_1.a(1) + a_1.a(2)");
        });
    });
});
