import { expect } from "chai";
import { CombinedCodeActions } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(CombinedCodeActions), () => {
    describe(nameof<CombinedCodeActions>(a => a.applyChanges), () => {
        it("should apply the combined code actions", () => {
            const { sourceFile, project } = getInfoFromText("export class T extends Node {}", { filePath: "/file.ts" });
            const languageService = project.getLanguageService();
            project.createSourceFile("/Node.ts", "export class Node { prop: string; }");

            const combinedCodeFix = languageService.getCombinedCodeFix(sourceFile, "fixMissingImport");
            combinedCodeFix.applyChanges();
            combinedCodeFix.applyChanges(); // should do nothing if called twice

            expect(sourceFile.getFullText()).to.equal(`import { Node } from "./Node";\n\nexport class T extends Node {}`);
        });
    });
});
