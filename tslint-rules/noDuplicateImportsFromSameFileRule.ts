import * as ts from "typescript";
import * as Lint from "tslint/lib/lint";

export class Rule extends Lint.Rules.AbstractRule {
    static FAILURE_STRING = "duplicate imports from same file forbidden";

    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoDuplicateImportsFromSameFileWalker(sourceFile, this.getOptions()));
    }
}

class NoDuplicateImportsFromSameFileWalker extends Lint.RuleWalker {
    private fileImportsByFileName: { [fileName: string]: { [importName: string]: boolean } } = {};

    visitImportDeclaration(node: ts.ImportDeclaration) {
        const sourceFile = node.parent as ts.SourceFile;
        const fileImports = this.getFileImports(sourceFile.fileName);
        const importPath = (node.moduleSpecifier as any).text as string;

        if (fileImports[importPath] != null) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        else {
            fileImports[importPath] = true;
        }

        super.visitImportDeclaration(node);
    }

    private getFileImports(fileName: string) {
        this.fileImportsByFileName[fileName] = this.fileImportsByFileName[fileName] || {};
        return this.fileImportsByFileName[fileName];
    }
}