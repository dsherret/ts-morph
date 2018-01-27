import {WrappedNode} from "./WrappedNode";

export interface NodeToWrapperMapping {
    wrapperName: string;
    wrappedNode: WrappedNode;
    syntaxKindNames: string[];
}
