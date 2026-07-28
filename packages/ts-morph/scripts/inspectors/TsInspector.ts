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

  /**
   * An export of `@ts-morph/common`, by name.
   *
   * The barrel is reached from source rather than from the built declaration
   * file — see the `paths` mapping in tsconfig.json — and it re-exports through
   * `export *`, which the module symbol's own export list does not flatten. The
   * exported declarations do.
   */
  getCommonExportOrThrow(name: string) {
    const declarations = this.#getCommonExportedDeclarations().get(name);
    if (declarations == null || declarations.length === 0)
      throw new Error(`Expected to find an export named ${name} on @ts-morph/common.`);
    return declarations[0].getSymbolOrThrow();
  }

  @Memoize
  #getCommonExportedDeclarations() {
    return this.#project.getSourceFileOrThrow("src/main.ts")
      .getExportDeclarationOrThrow("@ts-morph/common")
      .getModuleSpecifierSourceFileOrThrow()
      .getExportedDeclarations();
  }

  @Memoize
  getTsSymbol() {
    return this.getCommonExportOrThrow("ts");
  }

  /**
   * A member of the `ts` namespace, by name.
   *
   * Same reason as {@link getCommonExportOrThrow}: the namespace is a module
   * that re-exports, so its symbol's own export list is not the whole surface.
   */
  getTsExportOrThrow(name: string) {
    const declarations = this.#getTsExportedDeclarations().get(name);
    if (declarations == null || declarations.length === 0)
      throw new Error(`Expected to find an export named ${name} on the ts namespace.`);
    return declarations[0].getSymbolOrThrow();
  }

  @Memoize
  #getTsExportedDeclarations() {
    const declaration = this.getTsSymbol().getDeclarations()[0];
    if (!tsMorph.Node.isSourceFile(declaration))
      throw new Error("Expected the ts namespace to resolve to a source file.");
    return declaration.getExportedDeclarations();
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
    return this.getTsExportOrThrow("SyntaxKind").getExports().map(e => {
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
