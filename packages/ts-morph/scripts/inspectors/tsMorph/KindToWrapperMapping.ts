import { WrappedNode } from "./WrappedNode";

export interface KindToWrapperMapping {
    wrapperName: string;
    wrappedNode: WrappedNode;
    syntaxKindNames: string[];
}
