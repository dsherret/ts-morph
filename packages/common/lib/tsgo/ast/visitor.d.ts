/**
 * Hand-written visitor implementations for nodes with runtime-dependent
 * child ordering. Generated code in visitor.generated.ts and factory.generated.ts
 * delegates to these functions.
 */
import type { JSDocParameterOrPropertyTag, Node, NodeArray } from "./ast";
import type { Visitor } from "./visitor.generated";
export type { Visitor };
export { visitEachChild, visitNode, visitNodes, visitNodesArray } from "./visitor.generated";
declare function forEachChildOfJSDocParameterOrPropertyTag<T>(data: any, cbNode: (node: Node) => T, cbNodes: ((nodes: NodeArray<Node>) => T) | undefined): T | undefined;
export { forEachChildOfJSDocParameterOrPropertyTag as forEachChildOfJSDocParameterTag, forEachChildOfJSDocParameterOrPropertyTag as forEachChildOfJSDocPropertyTag };
declare function visitEachChildOfJSDocParameterOrPropertyTag(node: JSDocParameterOrPropertyTag, visitor: Visitor): JSDocParameterOrPropertyTag;
export { visitEachChildOfJSDocParameterOrPropertyTag as visitEachChildOfJSDocParameterTag, visitEachChildOfJSDocParameterOrPropertyTag as visitEachChildOfJSDocPropertyTag };
