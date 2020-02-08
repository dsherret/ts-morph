import { ts, errors } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { JSDocTag } from "../JSDocTag";
import { TypeParameterDeclaration } from "../../type";

export type JSDocTypeParameteredTagExtensionType = Node<ts.Node & { typeParameters: ts.NodeArray<ts.TypeParameterDeclaration>; }> & JSDocTag;

export interface JSDocTypeParameteredTag {
    /** Gets the type parameters. */
    getTypeParameters(): TypeParameterDeclaration[];
}

export function JSDocTypeParameteredTag<T extends Constructor<JSDocTypeParameteredTagExtensionType>>(Base: T): Constructor<JSDocTypeParameteredTag> & T {
    return class extends Base implements JSDocTypeParameteredTag {
        getTypeParameters() {
            return this.compilerNode.typeParameters
                .map(p => this._getNodeFromCompilerNode(p))
                .filter(p => p.getWidth() > 0); // temporary until https://github.com/microsoft/TypeScript/issues/36692 is fixed
        }
    };
}
