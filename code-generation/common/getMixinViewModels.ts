import * as ts from "typescript";
import {ClassViewModel, MixinViewModel} from "./../view-models";
import TsSimpleAst from "./../../src/main";
import {ClassDeclaration, Node, VariableDeclaration, TypeChecker} from "./../../src/main";

export function* getMixinViewModels(classDeclaration: ClassDeclaration): IterableIterator<MixinViewModel> {
    const extendsExpression = classDeclaration.getExtends();
    if (extendsExpression == null)
        return;

    const expr = extendsExpression.getExpression();
    const extendsSymbol = expr.getSymbol()!;
    const extendsType = extendsSymbol.getTypeAtLocation(expr);
    const intersectionTypes = extendsType.getIntersectionTypes();

    if (intersectionTypes.length === 0) {
        // console.log(`Can't get mixin of: ${classDeclaration.getName()}`);
        return;
    }

    for (const intersectionType of intersectionTypes) {
        const aliasSymbol = intersectionType.getAliasSymbol();
        if (aliasSymbol == null || aliasSymbol.getName() !== "Constructor") {
            // console.log(`Can't get intersection type of ${intersectionType.getText()}`);
            continue;
        }

        const aliasTypeArg = intersectionType.getAliasTypeArguments()[0];
        const aliasDeclaration = aliasTypeArg.getSymbol()!.getDeclarations()[0];

        yield {
            name: aliasTypeArg.getText(),
            path: aliasDeclaration.getSourceFile().getFilePath(),
            mixins: getMixinsForExtends(aliasDeclaration)
        };
    }
}

function getMixinsForExtends(declaration: Node) {
    const result: MixinViewModel[] = [];
    if (!declaration.isInterfaceDeclaration())
        return result;

    for (const extend of declaration.getExtends()) {
        const symbolDeclaration = extend.getExpression().getSymbol()!.getAliasedSymbol()!.getDeclarations()[0];
        result.push({
            name: extend.getText(),
            path: symbolDeclaration.getSourceFile().getFilePath(),
            mixins: getMixinsForExtends(symbolDeclaration)
        });
    }

    return result;
}
