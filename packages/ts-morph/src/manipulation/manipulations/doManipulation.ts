/* barrel:ignore */
import { SourceFile, Diagnostic } from "../../compiler";
import { Project, ProjectOptions } from "../../Project";
import { errors } from "@ts-morph/common";
import { NodeHandler } from "../nodeHandlers";
import { TextManipulator } from "../textManipulators";

export function doManipulation(sourceFile: SourceFile, textManipulator: TextManipulator, nodeHandler: NodeHandler, newFilePath?: string) {
    sourceFile._firePreModified();
    const newFileText = textManipulator.getNewText(sourceFile.getFullText());
    try {
        const replacementSourceFile = sourceFile._context.compilerFactory.createCompilerSourceFileFromText(
            newFilePath || sourceFile.getFilePath(),
            newFileText,
            sourceFile.getScriptKind()
        );
        nodeHandler.handleNode(sourceFile, replacementSourceFile, replacementSourceFile);
    } catch (err) {
        const diagnostics = getSyntacticDiagnostics(sourceFile, newFileText);
        const errorDetails = err.message + "\n\n"
            + `-- Details --\n`
            + "Path: " + sourceFile.getFilePath() + "\n"
            + "Text: " + JSON.stringify(textManipulator.getTextForError(newFileText)) + "\n"
            + "Stack: " + err.stack;

        if (diagnostics.length > 0) {
            throw new errors.InvalidOperationError(
                "Manipulation error: " + "A syntax error was inserted." + "\n\n"
                    + sourceFile._context.project.formatDiagnosticsWithColorAndContext(diagnostics, { newLineChar: "\n" })
                    + "\n" + errorDetails
            );
        }

        throw new errors.InvalidOperationError("Manipulation error: " + errorDetails);
    }
}

function getSyntacticDiagnostics(sourceFile: SourceFile, newText: string) {
    try {
        // hack to avoid circular references
        const projectOptions: ProjectOptions = { useVirtualFileSystem: true };
        const project = new (sourceFile._context.project.constructor as any)(projectOptions) as Project;
        const newFile = project.createSourceFile(sourceFile.getFilePath(), newText);
        return project.getProgram().getSyntacticDiagnostics(newFile);
    } catch (err) {
        return [] as Diagnostic[];
    }
}
