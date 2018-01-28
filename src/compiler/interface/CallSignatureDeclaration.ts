import * as ts from "typescript";
import {CallSignatureDeclarationStructure} from "./../../structures";
import {removeInterfaceMember} from "./../../manipulation";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {JSDocableNode, ChildOrderableNode} from "./../base";
import {SignaturedDeclaration} from "./../function";

export const CallSignatureDeclarationBase = ChildOrderableNode(JSDocableNode(SignaturedDeclaration(Node)));
export class CallSignatureDeclaration extends CallSignatureDeclarationBase<ts.CallSignatureDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<CallSignatureDeclarationStructure>) {
        callBaseFill(CallSignatureDeclarationBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this call signature.
     */
    remove() {
        removeInterfaceMember(this);
    }
}
