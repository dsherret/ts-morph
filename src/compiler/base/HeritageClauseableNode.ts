import * as errors from "../../errors";
import { Constructor } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, getSyntaxKindName } from "../../utils";
import { Node } from "../common";
import { HeritageClause } from "../general/HeritageClause";

export type HeritageClauseableNodeExtensionType = Node<ts.Node & { heritageClauses?: ts.NodeArray<ts.HeritageClause>; }>;

export interface HeritageClauseableNode {
    /**
     * Gets the heritage clauses of the node.
     */
    getHeritageClauses(): HeritageClause[];
    /**
     * Gets the heritage clause by kind.
     * @kind - Kind of heritage clause.
     */
    getHeritageClauseByKind(kind: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword): HeritageClause | undefined;
    /**
     * Gets the heritage clause by kind or throws if it doesn't exist.
     * @kind - Kind of heritage clause.
     */
    getHeritageClauseByKindOrThrow(kind: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword): HeritageClause;
}

export function HeritageClauseableNode<T extends Constructor<HeritageClauseableNodeExtensionType>>(Base: T): Constructor<HeritageClauseableNode> & T {
    return class extends Base implements HeritageClauseableNode {
        getHeritageClauses(): HeritageClause[] {
            const heritageClauses = this.compilerNode.heritageClauses;
            if (heritageClauses == null)
                return [];
            return heritageClauses.map(c => this.getNodeFromCompilerNode(c));
        }

        getHeritageClauseByKindOrThrow(kind: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword) {
            return errors.throwIfNullOrUndefined(this.getHeritageClauseByKind(kind), `Expected to have heritage clause of kind ${getSyntaxKindName(kind)}.`);
        }

        getHeritageClauseByKind(kind: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword) {
            return ArrayUtils.find(this.getHeritageClauses(), c => c.compilerNode.token === kind);
        }
    };
}
