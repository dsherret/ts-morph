import { ts } from "@ts-morph/common";
import { ReferenceFindableNode, RenameableNode } from "../base";
import { Node } from "../common";
import { CommonIdentifierBase } from "./base";

const createBase = <T extends typeof Node>(ctor: T) => CommonIdentifierBase(ReferenceFindableNode(RenameableNode(ctor)));
export const PrivateIdentifierBase = createBase(Node);
export class PrivateIdentifier extends PrivateIdentifierBase<ts.PrivateIdentifier> {
}
