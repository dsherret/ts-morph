import { InterfaceDeclaration, PropertyAccessExpression, ts, SyntaxKind, TypeGuards } from "ts-morph";
import { Memoize, ArrayUtils } from "../../../src/utils";
import { WrapperFactory } from "../WrapperFactory";

export class Mixin {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: InterfaceDeclaration) {
    }

    getName() {
        return this.node.getName();
    }

    @Memoize
    getMixins() {
        const baseInterfaces = this.node.getBaseDeclarations().filter(d => TypeGuards.isInterfaceDeclaration(d)) as InterfaceDeclaration[];
        return baseInterfaces.map(i => this.wrapperFactory.getMixin(i));
    }

    @Memoize
    getCoveredTsNodePropertyNames(): string[] {
        // this is done just to be fast... there's definitely a more correct way of doing this
        const sourceFile = this.node.getSourceFile();
        const propertyAccessExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);
        const names: string[] = [];

        for (const expr of propertyAccessExpressions) {
            if (expr.getText() !== "this.compilerNode")
                continue;
            const parent = expr.getParentIfKind(SyntaxKind.PropertyAccessExpression);
            if (parent == null)
                throw new Error(`Could not find property access expression parent for: ${expr.getText()} in ${sourceFile.getFilePath()}[${expr.getStartLineNumber()}]`);
            names.push(parent.getName());
        }

        return [...names, ...ArrayUtils.flatten(this.getMixins().map(m => m.getCoveredTsNodePropertyNames()))];
    }
}
