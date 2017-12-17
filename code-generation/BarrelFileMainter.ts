import * as path from "path";
import * as ts from "typescript";
import Ast, {SourceFile, Directory, TypeGuards} from "./../src/main";

export class BarrelFileMaintainer {
    private readonly ignoreFileRegex = /\/\*\s*barrel:ignore\s*\*\//i;
    private readonly barrelFileName = "index.ts";

    constructor(private readonly ast: Ast) {
    }

    updateDirAndSubDirs(dir: Directory) {
        this.updateDir(dir);
        dir.getDirectories().forEach(d => this.updateDirAndSubDirs(d));
    }

    private updateDir(dir: Directory) {
        let barrelFile = dir.getSourceFile(this.barrelFileName);
        const sourceFiles = dir.getSourceFiles().filter(s => s !== barrelFile && this.isSourceFileForBarrel(s));

        if (sourceFiles.length === 0) {
            if (barrelFile != null)
                this.deleteBarrelFileIfNeccessary(barrelFile);
            return;
        }

        if (barrelFile == null)
            barrelFile = dir.createSourceFile(this.barrelFileName);

        this.removeNamespaceExports(barrelFile);
        this.addNamespaceExports(barrelFile, sourceFiles.map(s => `./${path.basename(s.getFilePath()).replace(/\.(ts|js)$/, "")}`));
        this.updateParentDir(dir);
    }

    private updateParentDir(dir: Directory) {
        const parent = dir.getParent();
        if (parent == null || this.ast.getRootDirectories().indexOf(parent) >= 0)
            return;

        let parentBarrelFile = parent.getSourceFile(this.barrelFileName);
        const wasCreated = parentBarrelFile == null;
        if (parentBarrelFile == null)
            parentBarrelFile = parent.createSourceFile(this.barrelFileName);

        this.addNamespaceExports(parentBarrelFile, [`./${path.basename(dir.getPath())}`]);

        if (wasCreated)
            this.updateParentDir(parent);
    }

    private isSourceFileForBarrel(sourceFile: SourceFile) {
        // ignore files containing /* barrel:ignore */
        if (this.ignoreFileRegex.test(sourceFile.getFullText()))
            return false;

        return hasExports();

        function hasExports() {
            for (const statement of sourceFile.getStatements()) {
                if (statement.getKind() === ts.SyntaxKind.ExportDeclaration || statement.getKind() === ts.SyntaxKind.ExportAssignment)
                    return true;
                if (TypeGuards.isExportableNode(statement) && statement.isExported())
                    return true;
            }

            return false;
        }
    }

    private deleteBarrelFileIfNeccessary(barrelFile: SourceFile) {
        this.removeNamespaceExports(barrelFile);
        if (barrelFile.getStatements().length === 0)
            barrelFile.delete();
    }

    private addNamespaceExports(sourceFile: SourceFile, moduleSpecifiers: string[]) {
        sourceFile.addExports(moduleSpecifiers.map(moduleSpecifier => ({ moduleSpecifier })));
    }

    private removeNamespaceExports(sourceFile: SourceFile) {
        sourceFile.getExports().filter(e => e.isNamespaceExport()).forEach(e => e.remove());
    }
}
