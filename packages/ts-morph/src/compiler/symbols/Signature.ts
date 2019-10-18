import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../ProjectContext";
import { JSDocTagInfo } from "../ast";
import { SymbolDisplayPart } from "../tools";
import { Type } from "../types";
import { Symbol } from "./Symbol";

export class Signature {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private readonly _compilerSignature: ts.Signature;

    /**
     * Initializes a new instance of Signature.
     * @private
     * @param context - Project context.
     * @param signature - Compiler signature.
     */
    constructor(context: ProjectContext, signature: ts.Signature) {
        this._context = context;
        this._compilerSignature = signature;
    }

    /**
     * Gets the underlying compiler signature.
     */
    get compilerSignature() {
        return this._compilerSignature;
    }

    /**
     * Gets the type parameters.
     */
    getTypeParameters() {
        const typeParameters = this.compilerSignature.typeParameters || [];
        return typeParameters.map(t => this._context.compilerFactory.getTypeParameter(t));
    }

    /**
     * Gets the parameters.
     */
    getParameters(): Symbol[] {
        return this.compilerSignature.parameters.map(p => this._context.compilerFactory.getSymbol(p));
    }

    /**
     * Gets the signature return type.
     */
    getReturnType(): Type {
        return this._context.compilerFactory.getType(this.compilerSignature.getReturnType());
    }

    /**
     * Get the documentation comments.
     */
    getDocumentationComments(): SymbolDisplayPart[] {
        const docs = this.compilerSignature.getDocumentationComment(this._context.typeChecker.compilerObject);
        return docs.map(d => this._context.compilerFactory.getSymbolDisplayPart(d));
    }

    /**
     * Gets the JS doc tags.
     */
    getJsDocTags(): JSDocTagInfo[] {
        const tags = this.compilerSignature.getJsDocTags();
        return tags.map(t => this._context.compilerFactory.getJSDocTagInfo(t));
    }

    /**
     * Gets the signature's declaration.
     */
    getDeclaration() {
        const { compilerFactory } = this._context;
        // the compiler says this is non-nullable, but it can return undefined for an unknown signature
        // returned by calling `TypeChecker#getResolvedType()`; however, we're returning undefined in that scenario
        // and so this should never be null (hopefully)
        const compilerSignatureDeclaration = this.compilerSignature.getDeclaration();
        return compilerFactory.getNodeFromCompilerNode(compilerSignatureDeclaration, compilerFactory.getSourceFileForNode(compilerSignatureDeclaration));
    }
}
