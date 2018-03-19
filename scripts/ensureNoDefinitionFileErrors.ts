/**
 * Code Verification: Ensure no definition file errors
 * ---------------------------------------------------
 * Does what it says. Goes through and find definition file errors.
 *
 * I had to implement this originally because I found the compiler wasn't always giving me emit errors
 * when creating the definition file. Now it's especially useful because it will make sure the final manipulated
 * definition file doesn't have errors.
 * ---------------------------------------------------
 */
import * as path from "path";
import Project, {ts} from "../src/main";
import {getDefinitionProject} from "./common";

const project = getDefinitionProject();

if (project.getSourceFiles().length === 0)
    throw new Error("Could not find any source files.");

const problems = project.getDiagnostics().map(d => {
    let text = "";
    if (d.getSourceFile() != null)
        text += d.getSourceFile()!.getFilePath() + ": ";
    text += d.getMessageText();
    return text;
});

if (problems.length > 0) {
    console.log(problems);
    throw new Error("There were definition file issues!");
}
