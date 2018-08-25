import { SourceFile, SyntaxKind } from "ts-simple-ast";

export function removeImportTypes(file: SourceFile) {
    for (const type of file.getDescendantsOfKind(SyntaxKind.ImportType)) {
        type.replaceWithText(type.getText().replace(/import\([^\)]+\)\./, ""));
    }
}
