import {AbstractableNodeStructure, AmbientableNodeStructure, AsyncableNodeStructure, ExportableNodeStructure,
    ReadonlyableNodeStructure, ScopeableNodeStructure, ScopedNodeStructure, StaticableNodeStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";

export type ModifierableNodeStructures = AbstractableNodeStructure | AmbientableNodeStructure | AsyncableNodeStructure |
    ExportableNodeStructure | ReadonlyableNodeStructure | ScopeableNodeStructure | ScopedNodeStructure |
    StaticableNodeStructure;

export class ModifierableNodeStructurePrinter extends StructurePrinter<ModifierableNodeStructures> {
    printText(structure: ModifierableNodeStructures) {
        const scope = (structure as ScopeableNodeStructure).scope;
        if ((structure as ExportableNodeStructure).isDefaultExport)
            this.writer.write("export default ");
        else if ((structure as ExportableNodeStructure).isExported)
            this.writer.write("export ");
        if ((structure as AmbientableNodeStructure).hasDeclareKeyword)
            this.writer.write("declare ");
        if ((structure as AbstractableNodeStructure).isAbstract)
            this.writer.write("abstract ");
        if (scope != null)
            this.writer.write(`${scope} `);
        if ((structure as StaticableNodeStructure).isStatic)
            this.writer.write("static ");
        if ((structure as AsyncableNodeStructure).isAsync)
            this.writer.write("async ");
        if ((structure as ReadonlyableNodeStructure).isReadonly)
            this.writer.write("readonly ");
    }
}
