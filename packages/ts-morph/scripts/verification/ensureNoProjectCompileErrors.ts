/**
 * Code Verification: Ensure no project compile errors
 * ---------------------------------------------------
 * Ensures there are no compile errors in the src directory.
 * ---------------------------------------------------
 */
import { getProject } from "../common/mod.ts";
import { printDiagnostics } from "../deps.ts";

const project = getProject();

if (project.getSourceFiles().length === 0)
  throw new Error("Could not find any source files.");

const diagnostics = project.getPreEmitDiagnostics();

if (diagnostics.length > 0) {
  printDiagnostics(diagnostics);
  console.error("There were project compile errors!");
  Deno.exit(1);
}
