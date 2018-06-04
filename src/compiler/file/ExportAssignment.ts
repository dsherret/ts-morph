import { ts } from "../../typescript";
import { Expression } from "../expression";
import { Statement } from "../statement";

export class ExportAssignment extends Statement<ts.ExportAssignment> {
    /**
     * Gets if this is an export equals assignemnt.
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
}
