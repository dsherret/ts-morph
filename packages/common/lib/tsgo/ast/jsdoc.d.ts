import type { JSDocComment, JSDocTag } from "./ast.generated";
import { type Node, type NodeArray, SyntaxKind } from "./ast";
/** Get all JSDoc tags related to a node, including those on parent nodes. */
export declare function getJSDocTags(node: Node): readonly JSDocTag[];
/** Gets all JSDoc tags that match a specified predicate */
export declare function getAllJSDocTags<T extends JSDocTag>(node: Node, predicate: (tag: JSDocTag) => tag is T): readonly T[];
/** Gets all JSDoc tags of a specified kind */
export declare function getAllJSDocTagsOfKind(node: Node, kind: SyntaxKind): readonly JSDocTag[];
/** Gets the text of a jsdoc comment, flattening links to their text. */
export declare function getTextOfJSDocComment(comment?: string | NodeArray<JSDocComment>): string | undefined;
//# sourceMappingURL=jsdoc.d.ts.map