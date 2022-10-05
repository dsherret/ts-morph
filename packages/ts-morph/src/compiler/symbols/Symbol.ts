import { ArrayUtils, errors, SymbolFlags, ts } from "@ts-morph/common";
import { ProjectContext } from "../../ProjectContext";
import { JSDocTagInfo, Node } from "../ast";
import { Type } from "../types";

export class Symbol {
  /** @internal */
  private readonly _context: ProjectContext;
  /** @internal */
  private readonly _compilerSymbol: ts.Symbol;

  /**
   * Gets the underlying compiler symbol.
   */
  get compilerSymbol(): ts.Symbol {
    return this._compilerSymbol;
  }

  /**
   * Initializes a new instance of Symbol.
   * @private
   * @param context - Project context.
   * @param symbol - Compiler symbol.
   */
  constructor(context: ProjectContext, symbol: ts.Symbol) {
    this._context = context;
    this._compilerSymbol = symbol;

    // wrap these immediately, but do not memoize because the underlying symbol might be mutated
    this.getValueDeclaration();
    this.getDeclarations();
  }

  /**
   * Gets the symbol name.
   */
  getName() {
    return this.compilerSymbol.getName();
  }

  /**
   * Gets the escaped name.
   */
  getEscapedName() {
    return this.compilerSymbol.getEscapedName() as string;
  }

  /**
   * Gets the aliased symbol or throws if it doesn't exist.
   */
  getAliasedSymbolOrThrow(message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getAliasedSymbol(), "Expected to find an aliased symbol.");
  }

  /**
   * Follows a single alias to get the immediately aliased symbol or returns undefined if it doesn't exist.
   */
  getImmediatelyAliasedSymbol(): Symbol | undefined {
    return this._context.typeChecker.getImmediatelyAliasedSymbol(this);
  }

  /**
   * Follows a single alias to get the immediately aliased symbol or throws if it doesn't exist.
   */
  getImmediatelyAliasedSymbolOrThrow(message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getImmediatelyAliasedSymbol(), "Expected to find an immediately aliased symbol.");
  }

  /**
   * Gets the aliased symbol or returns undefined if it doesn't exist.
   */
  getAliasedSymbol(): Symbol | undefined {
    return this._context.typeChecker.getAliasedSymbol(this);
  }

  /**
   * Gets the export symbol of the symbol if its a local symbol with a corresponding export symbol. Otherwise returns the current symbol.
   *
   * The following is from the compiler API documentation:
   *
   * For example, at `export type T = number;`:
   *     - `getSymbolAtLocation` at the location `T` will return the exported symbol for `T`.
   *     - But the result of `getSymbolsInScope` will contain the *local* symbol for `T`, not the exported symbol.
   *     - Calling `getExportSymbol` on that local symbol will return the exported symbol.
   */
  getExportSymbol() {
    return this._context.typeChecker.getExportSymbolOfSymbol(this);
  }

  /**
   * Gets if the symbol is an alias.
   */
  isAlias() {
    return (this.getFlags() & SymbolFlags.Alias) === SymbolFlags.Alias;
  }

  /**
   * Gets if the symbol is optional.
   */
  isOptional() {
    return (this.getFlags() & SymbolFlags.Optional) === SymbolFlags.Optional;
  }

  /**
   * Gets the symbol flags.
   */
  getFlags(): SymbolFlags {
    return this.compilerSymbol.getFlags();
  }

  /**
   * Gets if the symbol has the specified flags.
   * @param flags - Flags to check if the symbol has.
   */
  hasFlags(flags: SymbolFlags) {
    return (this.compilerSymbol.flags & flags) === flags;
  }

  /**
   * Gets the value declaration of a symbol or throws if it doesn't exist.
   */
  getValueDeclarationOrThrow(message?: string | (() => string)): Node {
    return errors.throwIfNullOrUndefined(this.getValueDeclaration(), message || (() => `Expected to find the value declaration of symbol '${this.getName()}'.`));
  }

  /**
   * Gets the value declaration of the symbol or returns undefined if it doesn't exist.
   */
  getValueDeclaration(): Node | undefined {
    const declaration = this.compilerSymbol.valueDeclaration;
    if (declaration == null)
      return undefined;
    return this._context.compilerFactory.getNodeFromCompilerNode(declaration, this._context.compilerFactory.getSourceFileForNode(declaration));
  }

  /**
   * Gets the symbol declarations.
   */
  getDeclarations(): Node[] {
    return (this.compilerSymbol.declarations ?? [])
      .map(d => this._context.compilerFactory.getNodeFromCompilerNode(d, this._context.compilerFactory.getSourceFileForNode(d)));
  }

  /**
   * Gets the export of the symbol by the specified name or throws if not exists.
   * @param name - Name of the export.
   */
  getExportOrThrow(name: string, message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getExport(name), message || `Expected to find export with name: ${name}`);
  }

  /**
   * Gets the export of the symbol by the specified name or returns undefined if not exists.
   * @param name - Name of the export.
   */
  getExport(name: string): Symbol | undefined {
    if (this.compilerSymbol.exports == null)
      return undefined;

    const tsSymbol = this.compilerSymbol.exports.get(ts.escapeLeadingUnderscores(name));
    return tsSymbol == null ? undefined : this._context.compilerFactory.getSymbol(tsSymbol);
  }

  /**
   * Gets the exports from the symbol.
   */
  getExports(): Symbol[] {
    if (this.compilerSymbol.exports == null)
      return [];
    return ArrayUtils.from(this.compilerSymbol.exports.values()).map(symbol => this._context.compilerFactory.getSymbol(symbol));
  }

  /**
   * Gets the global export of the symbol by the specified name or throws if not exists.
   * @param name - Name of the global export.
   */
  getGlobalExportOrThrow(name: string, message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getGlobalExport(name), message || `Expected to find global export with name: ${name}`);
  }

  /**
   * Gets the global export of the symbol by the specified name or returns undefined if not exists.
   * @param name - Name of the global export.
   */
  getGlobalExport(name: string): Symbol | undefined {
    if (this.compilerSymbol.globalExports == null)
      return undefined;

    const tsSymbol = this.compilerSymbol.globalExports.get(ts.escapeLeadingUnderscores(name));
    return tsSymbol == null ? undefined : this._context.compilerFactory.getSymbol(tsSymbol);
  }

  /**
   * Gets the global exports from the symbol.
   */
  getGlobalExports(): Symbol[] {
    if (this.compilerSymbol.globalExports == null)
      return [];
    return ArrayUtils.from(this.compilerSymbol.globalExports.values()).map(symbol => this._context.compilerFactory.getSymbol(symbol));
  }

  /**
   * Gets the member of the symbol by the specified name or throws if not exists.
   * @param name - Name of the export.
   */
  getMemberOrThrow(name: string, message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getMember(name), message || `Expected to find member with name: ${name}`);
  }

  /**
   * Gets the member of the symbol by the specified name or returns undefined if not exists.
   * @param name - Name of the member.
   */
  getMember(name: string): Symbol | undefined {
    if (this.compilerSymbol.members == null)
      return undefined;

    const tsSymbol = this.compilerSymbol.members.get(ts.escapeLeadingUnderscores(name));
    return tsSymbol == null ? undefined : this._context.compilerFactory.getSymbol(tsSymbol);
  }

  /**
   * Gets the members of the symbol
   */
  getMembers(): Symbol[] {
    if (this.compilerSymbol.members == null)
      return [];
    return ArrayUtils.from(this.compilerSymbol.members.values()).map(symbol => this._context.compilerFactory.getSymbol(symbol));
  }

  /**
   * Gets the declared type of the symbol.
   */
  getDeclaredType(): Type {
    return this._context.typeChecker.getDeclaredTypeOfSymbol(this);
  }

  /**
   * Gets the type of the symbol at a location.
   * @param node - Location to get the type at for this symbol.
   */
  getTypeAtLocation(node: Node) {
    return this._context.typeChecker.getTypeOfSymbolAtLocation(this, node);
  }

  /**
   * Gets the fully qualified name.
   */
  getFullyQualifiedName() {
    return this._context.typeChecker.getFullyQualifiedName(this);
  }

  /** Gets the JS doc tag infos of the symbol. */
  getJsDocTags() {
    return this.compilerSymbol.getJsDocTags(this._context.typeChecker.compilerObject)
      .map(info => new JSDocTagInfo(info));
  }
}
