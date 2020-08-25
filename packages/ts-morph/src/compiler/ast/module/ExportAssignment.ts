import { ts, SyntaxKind } from "@ts-morph/common";
import { ExpressionedNode } from "../expression";
import { Statement } from "../statement";
import { ExportAssignmentStructure, ExportAssignmentSpecificStructure, StructureKind } from "../../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";

export const ExportAssignmentBase = ExpressionedNode(Statement);
export class ExportAssignment extends ExportAssignmentBase<ts.ExportAssignment> {
    /**
     * Gets if this is an export equals assignment.
     *
     * If this is false, then it's `export default`.
     */
    isExportEquals() {
        return this.compilerNode.isExportEquals || false;
    }

    /**
     * Sets if this is an export equals assignment or export default.
     * @param value - Whether it should be an export equals assignment.
     */
    setIsExportEquals(value: boolean) {
        if (this.isExportEquals() === value)
            return this;

        if (value)
            this.getFirstChildByKindOrThrow(SyntaxKind.DefaultKeyword).replaceWithText("=");
        else
            this.getFirstChildByKindOrThrow(SyntaxKind.EqualsToken).replaceWithText("default");

        return this;
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ExportAssignmentStructure>) {
        callBaseSet(ExportAssignmentBase.prototype, this, structure);

        if (structure.expression != null)
            this.setExpression(structure.expression);
        if (structure.isExportEquals != null)
            this.setIsExportEquals(structure.isExportEquals);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ExportAssignmentStructure {
        return callBaseGetStructure<ExportAssignmentSpecificStructure>(Statement.prototype, this, {
            kind: StructureKind.ExportAssignment,
            expression: this.getExpression().getText(),
            isExportEquals: this.isExportEquals(),
        }) as any as ExportAssignmentStructure;
    }
}
