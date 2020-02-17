import { ts } from "@ts-morph/common";
import { ReferenceFindableNode, RenameableNode } from "../base";
import { Node } from "../common";
import { CommonIdentifierBase } from "./base";

export const PrivateIdentifierBase = CommonIdentifierBase(ReferenceFindableNode(RenameableNode(Node)));
export class PrivateIdentifier extends PrivateIdentifierBase<ts.PrivateIdentifier> {
}
