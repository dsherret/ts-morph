import {ClassDeclaration, InterfaceDeclaration, Type} from "./../../../src/main";
import {Memoize, ArrayUtils, TypeGuards} from "./../../../src/utils";
import {WrapperFactory} from "./../WrapperFactory";
import {TsNode} from "./../ts";
import {Mixin} from "./Mixin";

export class WrappedNode {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: ClassDeclaration) {
    }

    getName() {
        return this.node.getName();
    }

    getFilePath() {
        return this.node.getSourceFile().getFilePath();
    }

    @Memoize
    getBase() {
        const base = this.node.getBaseClass();
        return base == null ? undefined : this.wrapperFactory.getWrapperNode(base);
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
    getAllMixins() {
        // todo: remove?
        return ArrayUtils.from(getAllMixins(this));

        function* getAllMixins(wrappedNode: WrappedNode): IterableIterator<Mixin> {
            for (const mixin of wrappedNode.getMixins())
                yield mixin;
            const baseWrappedNode = wrappedNode.getBase();
            if (baseWrappedNode != null)
                yield* getAllMixins(baseWrappedNode);
        }
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
