import { expect } from "chai";
import { RefactorEditInfo } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(RefactorEditInfo), () => {
    describe(nameof<RefactorEditInfo>(a => a.applyChanges), () => {
        it("should apply the refactor edits on the file", () => {
            const { sourceFile, project } = getInfoFromText("export function f(a: number, b: string) { return `${b} ${a}`}; export const c = f(1, 'a')", { filePath: "/f.ts" });
            const languageService = project.getLanguageService();
            const param = sourceFile.getFunctionOrThrow("f").getParameterOrThrow("a");
            const edits = languageService.getEditsForRefactor(sourceFile, {}, param,
            "Convert parameters to destructured object", "Convert parameters to destructured object", {})!;
            edits.applyChanges();
            expect(sourceFile.getFullText()).to.equal("export function f({ a, b }: { a: number; b: string; }) { return `${b} ${a}`}; export const c = f({ a: 1, b: 'a' })");
        });

        xit("should apply the refactor edits on several files", () => {
        });
    });
});
