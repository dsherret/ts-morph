import * as ts from "typescript";
import {TsNode} from "./TsNode";

export class TsIdentifier extends TsNode<ts.Identifier> {
    setText(text: string) {
        this.factory.replaceIdentifier(this, ts.createIdentifier(text));
        this.parent!.refresh(this.parentRefreshInfo!);
    }
}
