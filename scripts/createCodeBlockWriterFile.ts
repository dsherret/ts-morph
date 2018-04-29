/**
 * Code generation: Create Code Block Writer File
 * ----------------------------------------------
 * This creates a file that contains the typings for code-block-writer.
 * ----------------------------------------------
 */
import * as path from "path";
import { ClassDeclaration } from "ts-simple-ast";
import { rootFolder } from "./config";
import { TsSimpleAstInspector } from "./inspectors";
import { cloneClasses, cloneInterfaces } from "./common/cloning";

export function createCodeBlockWriterFile(inspector: TsSimpleAstInspector) {
    const project = inspector.getProject();

    const sourceFile = project.getSourceFileOrThrow(path.join(rootFolder, "src/codeBlockWriter/code-block-writer.ts"));
    sourceFile.removeText();

    createImport();
    createDeclaration();
    createExport();

    function createImport() {
        sourceFile.addImportDeclaration({
            defaultImport: "ImportedCodeBlockWriter",
            moduleSpecifier: "code-block-writer"
        });
    }

    function createDeclaration() {
        const defaultImport = sourceFile.getImportDeclarations()[0].getDefaultImport()!;
        const classDec = defaultImport.getDefinitionNodes()[0] as ClassDeclaration;
        cloneInterfaces(sourceFile, [classDec.getSourceFile().getInterfaceOrThrow("Options")]);
        cloneClasses(sourceFile, [classDec]);
        sourceFile.getClassOrThrow("CodeBlockWriter").setIsExported(false);
        sourceFile.getInterfaceOrThrow("Options").rename("CodeBlockWriterOptions").setIsExported(false);
    }

    function createExport() {
        sourceFile.addStatements(writer => {
            writer.newLine()
                .writeLine("// this is a trick to get the import module defined in the local scope by its name, but have the compiler")
                .writeLine("// understand this as exporting the ambient declaration above (so it works at compile time and run time)")
                .writeLine("// @ts-ignore: Implicit use of this.")
                .writeLine("const tempThis = this as any;")
                .writeLine(`tempThis["CodeBlockWriter"] = ImportedCodeBlockWriter;`)
                .blankLine()
                .write("export { CodeBlockWriter, CodeBlockWriterOptions };");
        });
    }
}
