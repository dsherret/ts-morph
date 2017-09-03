import * as path from "path";
import * as fs from "fs";
import TsSimpleAst from "./../../src/main";
import {rootFolder} from "./../config";

export function getDefinitionAst() {
    const ast = new TsSimpleAst({ tsConfigFilePath: path.join(rootFolder, "tsconfig.json") });
    ast.addSourceFiles(path.join(rootFolder, "dist/**/*.d.ts"));
    return ast;
}
