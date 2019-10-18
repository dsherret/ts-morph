import { InterfaceDeclaration, SyntaxKind, TypeGuards } from "ts-morph";
import { ArrayUtils, Memoize } from "@ts-morph/common";
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
                continue;
            names.push(parent.getName());
        }

        return [...names, ...ArrayUtils.flatten(this.getMixins().map(m => m.getCoveredTsNodePropertyNames()))];
    }
}
