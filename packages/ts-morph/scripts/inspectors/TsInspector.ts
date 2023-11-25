import { hasDescendantBaseType } from "../common/mod.ts";
import { Memoize, tsMorph } from "../deps.ts";
import { WrapperFactory } from "./WrapperFactory.ts";

export class TsInspector {
  readonly #wrapperFactory: WrapperFactory;
  readonly #project: tsMorph.Project;

  constructor(wrapperFactory: WrapperFactory, project: tsMorph.Project) {
    this.#wrapperFactory = wrapperFactory;
    this.#project = project;
  }

  @Memoize
  getTsSymbol() {
    const tsMorphCommon = this.#project.getSourceFileOrThrow("src/main.ts").getExportDeclarationOrThrow("@ts-morph/common").getModuleSpecifier()!
      .getSymbolOrThrow();
    return tsMorphCommon.getExportOrThrow("ts").getAliasedSymbolOrThrow();
  }

  @Memoize
  getTsNodes() {
    const tsSymbol = this.getTsSymbol();
    const interfaces: tsMorph.InterfaceDeclaration[] = [];

    for (const exportSymbol of tsSymbol.getExports()) {
      if (exportSymbol.getName() === "Node")
        continue;

      if (hasDescendantBaseType(exportSymbol.getDeclaredType(), checkingType => checkingType.getText().endsWith("Node"))) {
        const declarations = exportSymbol.getDeclarations();
        for (const interfaceDec of declarations.filter(tsMorph.Node.isInterfaceDeclaration))
          interfaces.push(interfaceDec);
      }
    }

    return interfaces.map(i => this.#wrapperFactory.getTsNode(i)).sort((a, b) => a.getName().localeCompare(b.getName(), "en-us-u-kf-upper"));
  }

  getNamesFromKind(kind: number) {
    const kindToNameMappings = this.getKindToNameMappings();
    return [...kindToNameMappings[kind]];
  }

  isTokenKind(kind: number) {
    const lastToken = this.getSyntaxKindNamesAndValues().find(member => member.name === "LastToken")!;
    if (kind > lastToken.value)
      return false;
    const firstToken = this.getSyntaxKindNamesAndValues().find(member => member.name === "FirstToken")!;
    return kind >= firstToken.value;
  }

  @Memoize
  private getKindToNameMappings() {
    const kindToNameMappings: { [kind: number]: string[] } = {};
    for (const { name, value, isAlias } of this.getSyntaxKindNamesAndValues()) {
      if (isAlias)
        continue;
      if (kindToNameMappings[value] == null)
        kindToNameMappings[value] = [];
      kindToNameMappings[value].push(name);
    }

    return kindToNameMappings;
  }

  getSyntaxKindForName(name: string) {
    const result = this.getSyntaxKindNamesAndValues().find(member => member.name === name);
    if (result == null)
      throw new Error(`Not found syntax kind: ${name}`);
    return result.value;
  }

  @Memoize
  getSyntaxKindNamesAndValues() {
    const foundValues = new Set<number>();
    return this.getTsSymbol().getExportOrThrow("SyntaxKind").getExports().map(e => {
      const value = (e.getValueDeclarationOrThrow() as tsMorph.EnumMember).getValue() as number;
      const isAlias = foundValues.has(value);
      foundValues.add(value);
      return {
        name: e.getName(),
        value,
        isAlias,
      };
    });
  }
}
