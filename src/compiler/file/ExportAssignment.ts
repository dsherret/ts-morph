import { ts } from "../../typescript";
import { Expression } from "../expression";
import { Statement } from "../statement";
import { ExportAssignmentStructure } from "../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";

export class ExportAssignment extends Statement<ts.ExportAssignment> {
    /**
     * Gets if this is an export equals assignment.
     *
     * If this is false, then it's `export default`.
     */
    isExportEquals() {
        return this.compilerNode.isExportEquals || false;
    }

    /**
     * Gets the export assignment expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ExportAssignmentStructure {
        return callBaseGetStructure<ExportAssignmentStructure>(Statement.prototype, this, {
            expression: this.getExpression().getText(),
            isExportEquals: this.isExportEquals()
        }) as any as ExportAssignmentStructure;
    }
}
