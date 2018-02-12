import {ts} from "./../../typescript";
import {GlobalContainer} from "./../../GlobalContainer";
import {SymbolDisplayPart} from "./../tools";
import {JSDocTagInfo} from "./../doc";
import {TypeParameter, Type} from "./../type";
import {Symbol} from "./Symbol";

export class Signature {
    /** @internal */
    private readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerSignature: ts.Signature;

    /**
     * Initializes a new instance of Signature.
     * @internal
     * @param global - GlobalContainer.
     * @param signature - Compiler signature.
     */
    constructor(global: GlobalContainer, signature: ts.Signature) {
        this.global = global;
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
        return typeParameters.map(t => this.global.compilerFactory.getTypeParameter(t));
    }

    /**
     * Gets the parameters.
     */
    getParameters(): Symbol[] {
        return this.compilerSignature.parameters.map(p => this.global.compilerFactory.getSymbol(p));
    }

    /**
     * Gets the signature return type.
     */
    getReturnType(): Type {
        return this.global.compilerFactory.getType(this.compilerSignature.getReturnType());
    }

    /**
     * Get the documentation comments.
     */
    getDocumentationComments(): SymbolDisplayPart[] {
        const docs = this.compilerSignature.getDocumentationComment(this.global.typeChecker.compilerObject);
        return docs.map(d => this.global.compilerFactory.getSymbolDisplayPart(d));
    }

    /**
     * Gets the JS doc tags.
     */
    getJsDocTags(): JSDocTagInfo[] {
        const tags = this.compilerSignature.getJsDocTags();
        return tags.map(t => this.global.compilerFactory.getJSDocTagInfo(t));
    }
}
