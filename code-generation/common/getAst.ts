import * as path from "path";
import * as fs from "fs";
import TsSimpleAst from "./../../src/main";
import {rootFolder} from "./../config";

export function getAst() {
    const ast = new TsSimpleAst({ tsConfigFilePath: path.join(rootFolder, "tsconfig.json") });
    ast.addSourceFiles(path.join(rootFolder, "src/**/*{.d.ts,.ts}"));
    return ast;
}
