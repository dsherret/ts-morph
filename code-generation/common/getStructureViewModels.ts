import * as ts from "typescript";
import {InterfaceViewModel} from "./../view-models";
import TsSimpleAst, {ClassDeclaration, InterfaceDeclaration} from "./../../src/main";

export function* getStructureViewModels(ast: TsSimpleAst): IterableIterator<InterfaceViewModel> {
    const diagnostics = ast.getDiagnostics().map(m => m.getMessageText());
    if (diagnostics.length > 0)
        console.log(diagnostics);

    const compilerSourceFiles = ast.getSourceFiles().filter(f => f.getFilePath().indexOf("src/structures") >= 0);
    const interfaces = compilerSourceFiles.map(f => f.getInterfaces()).reduce((a, b) => a.concat(b), []);

    for (const i of interfaces) {
        yield getInterfaceViewModel(i);
    }
}

function getInterfaceViewModel(interfaceDec: InterfaceDeclaration): InterfaceViewModel {
    return {
        name: interfaceDec.getName(),
        extends: interfaceDec.getExtends()
            .map(e => {
                const symbol = e.getExpression().getSymbol()!;
                return symbol.isAlias() ? symbol.getAliasedSymbol() : symbol;
            })
            .map(s => getInterfaceViewModel(s!.getDeclarations()[0] as InterfaceDeclaration)),
        path: interfaceDec.getSourceFile().getFilePath()
    };
}
