/**
 * Code generation: Create Code Block Writer File
 * ----------------------------------------------
 * This creates a file that contains the typings for code-block-writer.
 * ----------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";

export function getCodeBlockWriterStatements(project: tsMorph.Project): tsMorph.StatementStructures[] {
    const sourceFile = project.createSourceFile("dist-declarations/____temp______.ts", "import CodeBlockWriter from 'code-block-writer';");
    const defaultImport = sourceFile.getImportDeclarations()[0].getDefaultImport()!;
    const classDec = defaultImport.getDefinitionNodes()[0] as tsMorph.ClassDeclaration;
    const optionsInterface = classDec.getSourceFile().getInterfaceOrThrow("Options");

    optionsInterface.rename("CodeBlockWriterOptions");

    return [{
        ...classDec.getStructure(),
        hasDeclareKeyword: true,
        isDefaultExport: false,
        isExported: true
    }, {
        ...optionsInterface.getStructure()
    }];
}
