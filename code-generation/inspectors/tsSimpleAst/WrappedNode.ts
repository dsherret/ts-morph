import {ClassDeclaration, Type} from "./../../../src/main";
import {Memoize, ArrayUtils, TypeGuards} from "./../../../src/utils";
import {WrapperFactory} from "./../WrapperFactory";
import {TsNode} from "./../ts";

export class WrappedNode {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: ClassDeclaration) {
    }

    @Memoize
    getName() {
        return this.node.getName();
    }

    @Memoize
    getFilePath() {
        return this.node.getSourceFile().getFilePath();
    }

    @Memoize
    getBase() {
        const base = this.node.getBaseClass();
        return base == null ? undefined : this.wrapperFactory.getWrapperNode(base);
    }

    @Memoize
    getAssociatedTsNodes(): TsNode[] {
        const node = this.node;
        const typeChecker = node.global.typeChecker;

        return ArrayUtils.flatten([getFromExtends(), getFromTypeParam()]).map(n => {
            if (!TypeGuards.isInterfaceDeclaration(n))
                throw new Error(`Unexpected node kind: ${n.getKindName()}`);
            return this.wrapperFactory.getTsNode(n);
        });

        function getFromTypeParam() {
            const typeParams = node.getTypeParameters();
            if (typeParams.length === 0)
                return [];
            const typeParam = typeParams[0];
            const defaultNode = typeParam.getDefaultNode();
            if (defaultNode == null)
                return [];
            return getFromType(typeChecker.getTypeAtLocation(defaultNode));
        }

        function getFromExtends() {
            const extendsExpr = node.getExtends();
            if (extendsExpr == null)
                return [];
            const typeArgs = extendsExpr!.getTypeArguments();
            if (typeArgs.length === 0)
                return [];
            return getFromType(typeChecker.getTypeAtLocation(typeArgs[0]));
        }

        function getFromType(type: Type | undefined) {
            if (type == null || type.isTypeParameter())
                return [];
            const symbol = type.getSymbol();
            if (symbol == null)
                return [];
            return symbol.getDeclarations();
        }
    }
}
