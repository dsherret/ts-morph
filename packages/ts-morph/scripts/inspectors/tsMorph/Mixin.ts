import { tsMorph } from "@ts-morph/scripts";
import { ArrayUtils, Memoize } from "@ts-morph/common";
import { WrapperFactory } from "../WrapperFactory";

export class Mixin {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: tsMorph.InterfaceDeclaration) {
    }

    getName() {
        return this.node.getName();
    }

    @Memoize
    getMixins() {
        const baseInterfaces = this.node.getBaseDeclarations().filter(d => tsMorph.TypeGuards.isInterfaceDeclaration(d)) as tsMorph.InterfaceDeclaration[];
        return baseInterfaces.map(i => this.wrapperFactory.getMixin(i));
    }

    @Memoize
    getCoveredTsNodePropertyNames(): string[] {
        // this is done just to be fast... there's definitely a more correct way of doing this
        const sourceFile = this.node.getSourceFile();
        const propertyAccessExpressions = sourceFile.getDescendantsOfKind(tsMorph.SyntaxKind.PropertyAccessExpression);
        const names: string[] = [];

        for (const expr of propertyAccessExpressions) {
            if (expr.getText() !== "this.compilerNode")
                continue;
            const parent = expr.getParentIfKind(tsMorph.SyntaxKind.PropertyAccessExpression);
            if (parent == null)
                continue;
            names.push(parent.getName());
        }

        return [...names, ...ArrayUtils.flatten(this.getMixins().map(m => m.getCoveredTsNodePropertyNames()))];
    }
}
