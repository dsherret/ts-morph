import * as ts from "typescript";
import * as errors from "./../../errors";
import {Constructor} from "./../../Constructor";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";
import {HeritageClause} from "./../general/HeritageClause";

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
    getHeritageClauseByKind(kind: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword): HeritageClause | undefined;
    /**
     * Gets the heritage clause by kind or throws if it doesn't exist.
     * @kind - Kind of heritage clause.
     */
    getHeritageClauseByKindOrThrow(kind: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword): HeritageClause;
}

export function HeritageClauseableNode<T extends Constructor<HeritageClauseableNodeExtensionType>>(Base: T): Constructor<HeritageClauseableNode> & T {
    return class extends Base implements HeritageClauseableNode {
        getHeritageClauses(): HeritageClause[] {
            const heritageClauses = this.compilerNode.heritageClauses;
            if (heritageClauses == null)
                return [];
            return heritageClauses.map(c => this.global.compilerFactory.getNodeFromCompilerNode(c, this.sourceFile) as HeritageClause);
        }

        getHeritageClauseByKindOrThrow(kind: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword) {
            return errors.throwIfNullOrUndefined(this.getHeritageClauseByKind(kind), `Expected to have heritage clause of kind ${ts.SyntaxKind[kind]}.`);
        }

        getHeritageClauseByKind(kind: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword) {
            return ArrayUtils.find(this.getHeritageClauses(), c => c.compilerNode.token === kind);
        }
    };
}
