import {InterfaceViewModel} from "./../view-models";
import TsSimpleAst from "./../../src/main";
import {ClassDeclaration} from "./../../src/main";

export function* getStructureViewModels(ast: TsSimpleAst): IterableIterator<InterfaceViewModel> {
    console.log(ast.getDiagnostics().map(m => m.getMessageText()));
    const compilerSourceFiles = ast.getSourceFiles().filter(f => f.getFilePath().indexOf("src/structures") >= 0);
    const interfaces = compilerSourceFiles.map(f => f.getInterfaces()).reduce((a, b) => a.concat(b), []);

    for (const i of interfaces) {
        yield {
            name: i.getName(),
            extends: i.getExtends().map(e => e.getExpression().getSymbol()!.getName()),
            path: i.getSourceFile().getFilePath()
        };
    }
}
