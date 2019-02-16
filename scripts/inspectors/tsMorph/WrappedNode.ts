import { ClassDeclaration, InterfaceDeclaration, Type, TypeGuards } from "ts-morph";
import { Memoize, ArrayUtils } from "../../../src/utils";
import { hasDescendantNodeType } from "../../common";
import { WrapperFactory } from "../WrapperFactory";
import { TsNode } from "../ts";
import { Mixin } from "./Mixin";

export class WrappedNode {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: ClassDeclaration) {
    }

    getName() {
        return this.node.getNameOrThrow();
    }

    getFilePath() {
        return this.node.getSourceFile().getFilePath();
    }

    getStartLineNumber() {
        return this.node.getStartLineNumber();
    }

    hasMethod(name: string) {
        return this.node.getMethod(name) != null;
    }

    @Memoize
    hasParent() {
        return this.wrapperFactory.getWrappedNodes().some(n => n.getBase() === this);
    }

    @Memoize
    getType(): Type {
        return this.node.getType();
    }

    @Memoize
    getBases(): WrappedNode[] {
        const base = this.getBase();
        if (base == null)
            return [];
        return [base, ...base.getBases()];
    }

    @Memoize
    getBase() {
        const base = this.node.getBaseClass();
        return base == null ? undefined : this.wrapperFactory.getWrappedNode(base);
    }

    @Memoize
    getMixins() {
        const mixins: Mixin[] = [];
        const baseTypes = this.node.getBaseTypes();
        for (const intersectionType of ArrayUtils.flatten(baseTypes.map(t => t.getIntersectionTypes()))) {
            const interfaces = intersectionType.getSymbolOrThrow().getDeclarations().filter(d => TypeGuards.isInterfaceDeclaration(d)) as InterfaceDeclaration[];
            mixins.push(...interfaces.map(i => this.wrapperFactory.getMixin(i)));
        }
        return mixins;
    }

    @Memoize
    getAssociatedTsNodes(): TsNode[] {
        const node = this.node;

        return getFromExtends().map(n => {
            if (!TypeGuards.isInterfaceDeclaration(n))
                throw new Error(`Unexpected node kind: ${n.getKindName()}`);
            return this.wrapperFactory.getTsNode(n);
        });

        function getFromExtends() {
            const type = getCompilerType();
            return type == null ? [] : getFromType(type);
        }

        function getCompilerType() {
            const extendsExpr = node.getExtends();
            if (extendsExpr == null)
                return undefined;
            const extendsType = extendsExpr.getType();
            const possibleTypes = extendsType.isIntersection() ? extendsType.getIntersectionTypes() : [extendsType];
            const nodeType = ArrayUtils.find(possibleTypes, t => hasDescendantNodeType(t));
            if (nodeType == null)
                return undefined;
            const typeArgs = nodeType.getTypeArguments();
            if (typeArgs.length === 0)
                return undefined;
            const type = typeArgs[0];
            return type.isTypeParameter() ? type.getDefault() : type;
        }

        function getFromType(type: Type | undefined) {
            if (type == null)
                return [];
            const symbol = type.getSymbol();
            if (symbol == null)
                return [];
            return symbol.getDeclarations();
        }
    }
}
