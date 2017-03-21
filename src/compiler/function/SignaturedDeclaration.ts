import * as ts from "typescript";
import {ReturnTypedNode} from "./../base";
import {Node} from "./../common";
import {ParameterDeclaration} from "./ParameterDeclaration";

export type SignaturedDeclarationExtensionType = Node<ts.SignatureDeclaration>;

export interface SignaturedDeclarationBase {
    getParameters(): ParameterDeclaration[];
}

export function SignaturedDeclarationBase<T extends Constructor<SignaturedDeclarationExtensionType>>(Base: T): Constructor<SignaturedDeclarationBase> & T {
    return class extends Base implements SignaturedDeclarationBase {
        getParameters() {
            return this.node.parameters.map(p => this.factory.getParameterDeclaration(p));
        }
    };
}

export interface SignaturedDeclaration extends SignaturedDeclarationBase, ReturnTypedNode {
}

export function SignaturedDeclaration<T extends Constructor<SignaturedDeclarationExtensionType>>(Base: T): Constructor<SignaturedDeclaration> & T {
    return ReturnTypedNode(SignaturedDeclarationBase(Base));
}
