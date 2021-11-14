import { Memoize, tsMorph } from "../../../../scripts/mod.ts";
import { hasDescendantNodeType } from "../../common/mod.ts";
import { TsNode } from "../ts/mod.ts";
import { WrapperFactory } from "../WrapperFactory.ts";
import { Mixin } from "./Mixin.ts";

export class WrappedNode {
  constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: tsMorph.ClassDeclaration) {
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
  getType(): tsMorph.Type {
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
    for (const intersectionType of baseTypes.map(t => t.getIntersectionTypes()).flat()) {
      const interfaces = intersectionType.getSymbolOrThrow().getDeclarations()
        .filter(d => tsMorph.Node.isInterfaceDeclaration(d)) as tsMorph.InterfaceDeclaration[];
      mixins.push(...interfaces.map(i => this.wrapperFactory.getMixin(i)));
    }
    return mixins;
  }

  @Memoize
  getAssociatedTsNodes(): TsNode[] {
    const node = this.node;

    return getFromExtends().map(n => {
      if (!tsMorph.Node.isInterfaceDeclaration(n) && !tsMorph.Node.isClassDeclaration(n))
        throw new Error(`(${node.getName()}): Unexpected node kind: ${n.getKindName()}`);
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
      const nodeType = possibleTypes.find(t => hasDescendantNodeType(t));
      if (nodeType == null)
        return undefined;
      const typeArgs = nodeType.getTypeArguments();
      if (typeArgs.length === 0)
        return undefined;
      const type = typeArgs[0];
      return type.isTypeParameter() ? type.getDefault() : type;
    }

    function getFromType(type: tsMorph.Type | undefined) {
      if (type == null)
        return [];
      const symbol = type.getSymbol();
      if (symbol == null)
        return [];
      return symbol.getDeclarations();
    }
  }
}
