import { WrappedNode } from "./WrappedNode.ts";

export interface KindToWrapperMapping {
  wrapperName: string;
  wrappedNode: WrappedNode;
  syntaxKindNames: string[];
}
