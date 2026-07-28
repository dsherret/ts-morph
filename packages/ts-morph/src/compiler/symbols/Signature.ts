import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../ProjectContext";
import { toSymbolDisplayParts } from "../../utils";
import { wrapStaleHandleErrors } from "../../utils/compiler/wrapStaleHandleErrors";
import { JSDocTagInfo } from "../ast/doc/JSDocTagInfo";
import { SymbolDisplayPart } from "../tools/results";
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
    return this.compilerSignature.getTypeParameters().map(t => this.#context.compilerFactory.getTypeParameter(t));
  }

  /**
   * Gets the parameters.
   */
  getParameters(): Symbol[] {
    return this.compilerSignature.getParameters().map(p => this.#context.compilerFactory.getSymbol(p));
  }

  /**
   * Gets the signature return type.
   */
  getReturnType(): Type {
    return this.#context.compilerFactory.getType(this.compilerSignature.getReturnType());
  }

  /**
   * Gets the documentation comments.
   */
  getDocumentationComments(): SymbolDisplayPart[] {
    return toSymbolDisplayParts(this.compilerSignature.getDocumentationComment(this.#context.typeChecker.compilerObject))
      .map(part => new SymbolDisplayPart(part));
  }

  /**
   * Gets the JS doc tags.
   */
  getJsDocTags(): JSDocTagInfo[] {
    return this.compilerSignature.getJsDocTags(this.#context.typeChecker.compilerObject)
      .map(info => new JSDocTagInfo(info));
  }

  /**
   * Gets the signature's declaration.
   */
  getDeclaration() {
    const { compilerFactory } = this.#context;
    // the compiler says this is non-nullable, but it can return undefined for an unknown signature
    // returned by calling `TypeChecker#getResolvedType()`; however, we're returning undefined in that scenario
    // and so this should never be null (hopefully)
    // tsgo resolves a node handle to a bare `Node`, but a signature's declaration is
    // always function-like, so this restates what the compiler already guarantees and
    // keeps the wrapped return type narrow.
    const compilerSignatureDeclaration = this.compilerSignature.declaration!.resolve()! as ts.SignatureDeclaration;
    return compilerFactory.getNodeFromCompilerNode(compilerSignatureDeclaration, compilerFactory.getSourceFileForNode(compilerSignatureDeclaration));
  }
}

// a signature is a handle into the program that produced it, and any method here can be the one that finds it stale
wrapStaleHandleErrors(Signature.prototype);
