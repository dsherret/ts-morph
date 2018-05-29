import { CodeBlockWriter } from "../../codeBlockWriter";
import { AbstractableNodeStructure, AmbientableNodeStructure, AsyncableNodeStructure, ExportableNodeStructure,
    ReadonlyableNodeStructure, ScopeableNodeStructure, ScopedNodeStructure, StaticableNodeStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { ConstableNodeStructure } from '../../structures/base/ConstableNodeStructure';

export type ModifierableNodeStructures = AbstractableNodeStructure | AmbientableNodeStructure | AsyncableNodeStructure |
    ExportableNodeStructure | ReadonlyableNodeStructure | ScopeableNodeStructure | ScopedNodeStructure |
    StaticableNodeStructure | ConstableNodeStructure;

export class ModifierableNodeStructurePrinter extends FactoryStructurePrinter<ModifierableNodeStructures> {
    printText(writer: CodeBlockWriter, structure: ModifierableNodeStructures) {
        const scope = (structure as ScopeableNodeStructure).scope;
        if ((structure as ExportableNodeStructure).isDefaultExport)
            writer.write("export default ");
        else if ((structure as ExportableNodeStructure).isExported)
            writer.write("export ");
        if ((structure as AmbientableNodeStructure).hasDeclareKeyword)
            writer.write("declare ");
        if ((structure as AbstractableNodeStructure).isAbstract)
            writer.write("abstract ");
        if (scope != null)
            writer.write(`${scope} `);
        if ((structure as StaticableNodeStructure).isStatic)
            writer.write("static ");
        if ((structure as AsyncableNodeStructure).isAsync)
            writer.write("async ");
        if ((structure as ReadonlyableNodeStructure).isReadonly)
            writer.write("readonly ");
        if ((structure as ConstableNodeStructure).isConst)
            writer.write("const ");
    }
}
