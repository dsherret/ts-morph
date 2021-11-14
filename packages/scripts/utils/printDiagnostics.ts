import { tsMorph } from "../deps.ts";

/** Prints the provided diagnostics with colour and context. */
export function printDiagnostics(diagnostics: tsMorph.Diagnostic[]) {
  console.log(tsMorph.ts.formatDiagnosticsWithColorAndContext(diagnostics.map(d => d.compilerObject), {
    getCurrentDirectory: () => Deno.cwd(),
    getCanonicalFileName: fileName => fileName,
    getNewLine: () => "\n",
  }));
}
