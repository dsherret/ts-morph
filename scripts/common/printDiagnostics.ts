import { Diagnostic } from "ts-simple-ast";

export function printDiagnostics(diagnostics: Diagnostic[]) {
    for (const diagnostic of diagnostics)
        console.log(`[${diagnostic.getSourceFile()!.getFilePath()}:${diagnostic.getLineNumber()}]: ${diagnostic.getMessageText()}`);
}
