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
import * as path from "path";
import Project, { ts } from "ts-simple-ast";
import { getDefinitionProject } from "../common";

const project = getDefinitionProject();

if (project.getSourceFiles().length === 0)
    throw new Error("Could not find any source files.");

const problems = project.getPreEmitDiagnostics().map(d => {
    let text = "";
    if (d.getSourceFile() != null)
        text += `${d.getSourceFile()!.getFilePath()} ${d.getStart()}: `;
    text += d.getMessageText();
    return text;
});

if (problems.length > 0) {
    console.log(problems);
    console.error("There were declaration file issues!");
    process.exit(1);
}
