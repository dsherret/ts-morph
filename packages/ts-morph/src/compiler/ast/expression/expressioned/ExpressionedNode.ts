import { errors, getSyntaxKindName, ts, SyntaxKind } from "@ts-morph/common";
import { ExpressionedNodeStructure } from "../../../../structures";
import { Constructor, WriterFunction } from "../../../../types";
import { callBaseSet } from "../../callBaseSet";
import { KindToExpressionMappings } from "../../kindToNodeMappings";
import { Node } from "../../common";
import { Expression } from "../Expression";

export type ExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.Expression; }>;

export interface ExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): Expression;
    /**
     * Gets the expression if its of a certain kind or returns undefined.
     * @param kind - Syntax kind of the expression.
     */
    getExpressionIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
    /**
     * Gets the expression if its of a certain kind or throws.
     * @param kind - Syntax kind of the expression.
     */
    getExpressionIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
    /**
     * Sets the expression.
     * @param textOrWriterFunction - Text to set the expression with.
     */
    setExpression(textOrWriterFunction: string | WriterFunction): this;
}

export function ExpressionedNode<T extends Constructor<ExpressionedNodeExtensionType>>(Base: T): Constructor<ExpressionedNode> & T {
    return class extends Base implements ExpressionedNode {
        getExpression() {
            return this._getNodeFromCompilerNode(this.compilerNode.expression);
        }

        getExpressionIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined {
            const { expression } = this.compilerNode;
            return expression.kind === kind ? (this._getNodeFromCompilerNode(expression) as KindToExpressionMappings[TKind]) : undefined;
        }

        getExpressionIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] {
            return errors.throwIfNullOrUndefined(this.getExpressionIfKind(kind), `An expression of the kind ${getSyntaxKindName(kind)} was expected.`);
        }

        setExpression(textOrWriterFunction: string | WriterFunction) {
            this.getExpression().replaceWithText(textOrWriterFunction);
            return this;
        }

        set(structure: Partial<ExpressionedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.expression != null)
                this.setExpression(structure.expression);

            return this;
        }
    };
}
