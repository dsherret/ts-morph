import { expect } from "chai";
import { RefactorEditInfo } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(RefactorEditInfo), () => {
    describe(nameof<RefactorEditInfo>(a => a.applyChanges), () => {
        it("should apply the refactor edits", () => {
            const { sourceFile, project } = getInfoFromText("export function f(a: number, b: string) {}", { filePath: "/f.ts" });
            const languageService = project.getLanguageService();
            const g = project.createSourceFile("/g.ts", "import {f} from './f'; export const c = f(1, '')");

            const edits = languageService.getEditsForRefactor(sourceFile, {}, sourceFile.getFunctionOrThrow("f").getParameterOrThrow("a"),
            "Convert parameters to destructured object", "Convert parameters to destructured object", {})!;
            edits.applyChanges();
            expect(sourceFile.getFullText()).to.equal(``);
            expect(g.getFullText()).to.equal(``);

        });
    });
});
