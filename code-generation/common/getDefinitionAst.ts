import * as path from "path";
import * as fs from "fs";
import TsSimpleAst, {NewLineKind} from "./../../src/main";
import {rootFolder} from "./../config";

export function getDefinitionAst() {
    const ast = new TsSimpleAst({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed
        }
    });
    ast.addSourceFiles(path.join(rootFolder, "dist/**/*.d.ts"));
    return ast;
}
