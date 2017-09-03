import * as path from "path";
import * as ts from "typescript";
import TsSimpleAst from "./../src/main";
import {getDefinitionAst} from "./common";

const ast = getDefinitionAst();

if (ast.getSourceFiles().length === 0)
    throw new Error("Could not find any source files.");

const problems = ast.getDiagnostics().map(d => {
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
