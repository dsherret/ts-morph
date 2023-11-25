import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../ProjectContext";
import { JSDocTagInfo } from "../ast";
import { SymbolDisplayPart } from "../tools";
import { Type } from "../types";
import { Symbol } from "./Symbol";

export class Signature {
  /** @internal */
  readonly #context: ProjectContext;
  /** @internal */
  readonly #compilerSignature: ts.Signature;

  /**
   * Initializes a new instance of Signature.
   * @private
   * @param context - Project context.
   * @param signature - Compiler signature.
   */
  constructor(context: ProjectContext, signature: ts.Signature) {
    this.#context = context;
    this.#compilerSignature = signature;
  }

  /**
   * Gets the underlying compiler signature.
   */
  get compilerSignature() {
    return this.#compilerSignature;
  }

  /**
   * Gets the type parameters.
   */
  getTypeParameters() {
    const typeParameters = this.compilerSignature.typeParameters || [];
    return typeParameters.map(t => this.#context.compilerFactory.getTypeParameter(t));
  }

  /**
   * Gets the parameters.
   */
  getParameters(): Symbol[] {
    return this.compilerSignature.parameters.map(p => this.#context.compilerFactory.getSymbol(p));
  }

  /**
   * Gets the signature return type.
   */
  getReturnType(): Type {
    return this.#context.compilerFactory.getType(this.compilerSignature.getReturnType());
  }

  /**
   * Get the documentation comments.
   */
  getDocumentationComments(): SymbolDisplayPart[] {
    const docs = this.compilerSignature.getDocumentationComment(this.#context.typeChecker.compilerObject);
    return docs.map(d => this.#context.compilerFactory.getSymbolDisplayPart(d));
  }

  /**
   * Gets the JS doc tags.
   */
  getJsDocTags(): JSDocTagInfo[] {
    const tags = this.compilerSignature.getJsDocTags();
    return tags.map(t => this.#context.compilerFactory.getJSDocTagInfo(t));
  }

  /**
   * Gets the signature's declaration.
   */
  getDeclaration() {
    const { compilerFactory } = this.#context;
    // the compiler says this is non-nullable, but it can return undefined for an unknown signature
    // returned by calling `TypeChecker#getResolvedType()`; however, we're returning undefined in that scenario
    // and so this should never be null (hopefully)
    const compilerSignatureDeclaration = this.compilerSignature.getDeclaration();
    return compilerFactory.getNodeFromCompilerNode(compilerSignatureDeclaration, compilerFactory.getSourceFileForNode(compilerSignatureDeclaration));
  }
}
