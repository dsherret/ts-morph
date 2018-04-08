import CodeBlockWriter from "code-block-writer";
import {ConstructorDeclarationStructure, ConstructorDeclarationOverloadStructure} from "../../structures";
import {ObjectUtils, setValueIfUndefined} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {ParameterDeclarationStructurePrinter} from "../function";
import {BodyTextStructurePrinter} from "../statement";
import {TypeParameterDeclarationStructurePrinter} from "../types";

export class ConstructorDeclarationStructurePrinter extends StructurePrinter<ConstructorDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly parameterWriter = new ParameterDeclarationStructurePrinter(this.writer);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly bodyWriter = new BodyTextStructurePrinter(this.writer, this.options);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    printText(structure: ConstructorDeclarationStructure) {
        this.printOverloads(getOverloadStructures());
        this.printBase(structure);
        if (this.options.isAmbient)
            this.writer.write(";");
        else
            this.writer.space().inlineBlock(() => {
                this.bodyWriter.printText(structure);
            });

        function getOverloadStructures() {
            // all the overloads need to have the same scope as the implementation
            const overloads = ObjectUtils.clone(structure.overloads);
            if (overloads == null || overloads.length === 0)
                return;

            for (const overload of overloads) {
                setValueIfUndefined(overload, "scope", structure.scope);
            }

            return overloads;
        }
    }

    private printOverloads(structures: ConstructorDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(structure);
            this.writer.newLine();
        }
    }

    printOverload(structure: ConstructorDeclarationOverloadStructure) {
        this.printBase(structure);
        this.writer.write(";");
    }

    private printBase(structure: ConstructorDeclarationOverloadStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierWriter.printText(structure);
        this.writer.write("constructor");
        this.typeParameterWriter.printTexts(structure.typeParameters);
        this.writer.write("(");
        this.parameterWriter.printTexts(structure.parameters);
        this.writer.write(")");
    }
}
