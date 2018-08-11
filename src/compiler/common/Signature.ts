import { ProjectContext } from "../../ProjectContext";
import { ts } from "../../typescript";
import { JSDocTagInfo } from "../doc";
import { SymbolDisplayPart } from "../tools";
import { Type } from "../type";
import { Symbol } from "./Symbol";

export class Signature {
    /** @internal */
    private readonly context: ProjectContext;
    /** @internal */
    private readonly _compilerSignature: ts.Signature;

    /**
     * Initializes a new instance of Signature.
     * @internal
     * @param context - Project context.
     * @param signature - Compiler signature.
     */
    constructor(context: ProjectContext, signature: ts.Signature) {
        this.context = context;
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
        return typeParameters.map(t => this.context.compilerFactory.getTypeParameter(t));
    }

    /**
     * Gets the parameters.
     */
    getParameters(): Symbol[] {
        return this.compilerSignature.parameters.map(p => this.context.compilerFactory.getSymbol(p));
    }

    /**
     * Gets the signature return type.
     */
    getReturnType(): Type {
        return this.context.compilerFactory.getType(this.compilerSignature.getReturnType());
    }

    /**
     * Get the documentation comments.
     */
    getDocumentationComments(): SymbolDisplayPart[] {
        const docs = this.compilerSignature.getDocumentationComment(this.context.typeChecker.compilerObject);
        return docs.map(d => this.context.compilerFactory.getSymbolDisplayPart(d));
    }

    /**
     * Gets the JS doc tags.
     */
    getJsDocTags(): JSDocTagInfo[] {
        const tags = this.compilerSignature.getJsDocTags();
        return tags.map(t => this.context.compilerFactory.getJSDocTagInfo(t));
    }
}
