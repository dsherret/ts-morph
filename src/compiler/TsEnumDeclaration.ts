import * as ts from "typescript";
import {TsIdentifier} from "./TsIdentifier";
import {TsNode} from "./TsNode";
import {RefreshInfo} from "./RefreshInfo";

export type SupportedRefreshInfos = IdentifierNameRefreshInfo;
export type IdentifierNameRefreshInfo = RefreshInfo<"name">;

export class TsEnumDeclaration extends TsNode<ts.EnumDeclaration> {
    getNameNode() {
        const refreshInfo: IdentifierNameRefreshInfo = { name: "name" };
        return this.factory.getIdentifier(this.node.name, this, refreshInfo);
    }

    refresh(refresh: SupportedRefreshInfos) {
        if (refresh.name === "name")
            this.update({ name: this.getNameNode() });
    }

    update(opts: Partial<{ name: TsIdentifier; }>) {
        ts.updateEnumDeclaration(this.node,
            this.node.decorators,
            this.node.modifiers,
            opts.name && opts.name.getCompilerNode() || this.node.name,
            this.node.members);
    }
}
