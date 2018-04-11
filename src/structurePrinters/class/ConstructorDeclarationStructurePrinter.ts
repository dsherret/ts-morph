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
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly parameterWriter = new ParameterDeclarationStructurePrinter();
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly bodyWriter = new BodyTextStructurePrinter(this.options);

    constructor(private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: ConstructorDeclarationStructure) {
        this.printOverloads(writer, getOverloadStructures());
        this.printBase(writer, structure);
        if (this.options.isAmbient)
            writer.write(";");
        else
            writer.space().inlineBlock(() => {
                this.bodyWriter.printText(writer, structure);
            });

        function getOverloadStructures() {
            // all the overloads need to have the same scope as the implementation
            const overloads = ObjectUtils.clone(structure.overloads);
            if (overloads == null || overloads.length === 0)
                return;

            for (const overload of overloads)
                setValueIfUndefined(overload, "scope", structure.scope);

            return overloads;
        }
    }

    private printOverloads(writer: CodeBlockWriter, structures: ConstructorDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(writer, structure);
            writer.newLine();
        }
    }

    printOverload(writer: CodeBlockWriter, structure: ConstructorDeclarationOverloadStructure) {
        this.printBase(writer, structure);
        writer.write(";");
    }

    private printBase(writer: CodeBlockWriter, structure: ConstructorDeclarationOverloadStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierWriter.printText(writer, structure);
        writer.write("constructor");
        this.typeParameterWriter.printTexts(writer, structure.typeParameters);
        writer.write("(");
        this.parameterWriter.printTexts(writer, structure.parameters);
        writer.write(")");
    }
}
