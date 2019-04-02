import { expect } from "chai";
import { RefactorEditInfo } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(RefactorEditInfo), () => {
    describe(nameof<RefactorEditInfo>(a => a.applyChanges), () => {
        it("should apply the refactor edits", () => {
            const { sourceFile, project } = getInfoFromText("export function f(a: number, b: string) {}", { filePath: "/f.ts" });
            const languageService = project.getLanguageService();
            project.createSourceFile("/g.ts", "import {f} from './f'; export const c = f(1, '')");

            const refactorEdits = languageService.getCombinedCodeFix(sourceFile, "fixMissingImport");

            expect(sourceFile.getFullText()).to.equal(`import { Node } from "./Node";\n\nexport class T extends Node {}`);
        });
    });
});
