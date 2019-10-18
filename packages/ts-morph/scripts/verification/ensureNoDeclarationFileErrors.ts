/**
 * Code Verification: Ensure no declaration file errors
 * ---------------------------------------------------
 * Does what it says. Goes through and find declaration file errors.
 *
 * I had to implement this originally because I found the compiler wasn't always giving me emit errors
 * when creating the declaration file. Now it's especially useful because it will make sure the final manipulated
 * declaration file doesn't have errors.
 * ---------------------------------------------------
 */
import { getDeclarationProject } from "../common";
import { printDiagnostics } from "@ts-morph/scripts";

const project = getDeclarationProject();

if (project.getSourceFiles().length === 0)
    throw new Error("Could not find any source files.");

const diagnostics = project.getPreEmitDiagnostics();

if (diagnostics.length > 0) {
    printDiagnostics(diagnostics);
    console.error("There were declaration file issues!");
    process.exit(1);
}
