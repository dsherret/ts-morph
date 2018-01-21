import * as path from "path";
import TsSimpleAst, {NewLineKind} from "./../../src/main";
import {rootFolder} from "./../config";

export function getAst() {
    const ast = new TsSimpleAst({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        addFilesFromTsConfig: false,
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed
        }
    });
    ast.addExistingSourceFiles(path.join(rootFolder, "src/**/*{.d.ts,.ts}"));
    ast.addExistingSourceFile(path.join(rootFolder, "node_modules/typescript/lib/typescript.d.ts"));
    return ast;
}
