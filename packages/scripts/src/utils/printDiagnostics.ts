import { EOL } from "os";
import { Diagnostic, ts } from "ts-morph";

/** Prints the provided diagnostics with colour and context. */
export function printDiagnostics(diagnostics: Diagnostic[]) {
    console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics.map(d => d.compilerObject), {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => EOL
    }));
}
