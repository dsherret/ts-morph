/* barrel:ignore */
import { StandardizedFilePath } from "@ts-morph/common";
import { SourceFile, Diagnostic } from "../../compiler";
import { Project, ProjectOptions } from "../../Project";
import { NodeHandler } from "../nodeHandlers";
import { TextManipulator } from "../textManipulators";
import { ManipulationError } from "./ManipulationError";

export function doManipulation(sourceFile: SourceFile, textManipulator: TextManipulator, nodeHandler: NodeHandler, newFilePath?: StandardizedFilePath) {
    sourceFile._firePreModified();
    const oldFileText = sourceFile.getFullText();
    const newFileText = textManipulator.getNewText(oldFileText);
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
            throwError(
                "Manipulation error: " + "A syntax error was inserted." + "\n\n"
                    + sourceFile._context.project.formatDiagnosticsWithColorAndContext(diagnostics, { newLineChar: "\n" })
                    + "\n" + errorDetails
            );
        }

        throwError("Manipulation error: " + errorDetails);

        function throwError(message: string): never {
            throw new ManipulationError(
                sourceFile.getFilePath(),
                oldFileText,
                newFileText,
                message
            );
        }
    }
}

function getSyntacticDiagnostics(sourceFile: SourceFile, newText: string) {
    try {
        // hack to avoid circular references
        const projectOptions: ProjectOptions = { useInMemoryFileSystem: true };
        const project = new (sourceFile._context.project.constructor as any)(projectOptions) as Project;
        const newFile = project.createSourceFile(sourceFile.getFilePath(), newText);
        return project.getProgram().getSyntacticDiagnostics(newFile);
    } catch (err) {
        return [] as Diagnostic[];
    }
}
