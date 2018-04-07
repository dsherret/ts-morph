import CodeBlockWriter from "code-block-writer";
import {ConstructorDeclarationStructure, ConstructorDeclarationOverloadStructure} from "../../structures";
import {ObjectUtils, setValueIfUndefined} from "../../utils";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {ParameterDeclarationStructureToText} from "../function";
import {BodyTextStructureToText} from "../statement";
import {TypeParameterDeclarationStructureToText} from "../types";

export class ConstructorDeclarationStructureToText extends StructureToText<ConstructorDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly parameterWriter = new ParameterDeclarationStructureToText(this.writer);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly bodyWriter = new BodyTextStructureToText(this.writer);

    constructor(writer: CodeBlockWriter, private readonly opts: { isAmbient: boolean; }) {
        super(writer);
    }

    writeText(structure: ConstructorDeclarationStructure) {
        this.writeOverloads(getOverloadStructures());
        this.writeBase(structure);
        if (this.opts.isAmbient)
            this.writer.write(";");
        else
            this.writer.space().inlineBlock(() => {
                this.bodyWriter.writeText(structure);
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

    private writeOverloads(structures: ConstructorDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.writeOverload(structure);
            this.writer.newLine();
        }
    }

    writeOverload(structure: ConstructorDeclarationOverloadStructure) {
        this.writeBase(structure);
        this.writer.write(";");
    }

    private writeBase(structure: ConstructorDeclarationOverloadStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierWriter.writeText(structure);
        this.writer.write("constructor");
        this.typeParameterWriter.writeTexts(structure.typeParameters);
        this.writer.write("(");
        this.parameterWriter.writeTexts(structure.parameters);
        this.writer.write(")");
    }
}
