import TsSimpleAst from "./../../src/main";
import {FillOnlyFunctionViewModel} from "./../view-models";

export function getFillOnlyFunctionViewModels(ast: TsSimpleAst): FillOnlyFunctionViewModel[] {
    const sourceFile = ast.getSourceFile("fillOnlyFunctions.ts")!;
    return sourceFile.getFunctions().map(f => ({
        className: f.getParameters()[0].getType().getSymbol()!.getName(),
        functionName: f.getName()
    }));
}
