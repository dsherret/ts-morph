/**
 * Code Verification - Ensure Structures Match Classes.
 * ----------------------------------------------------
 * Classes like ClassDeclaration can extend a mixin like ExportableNode. In this case, we need to then also make sure
 * that ClassDeclarationStructure will extend ExportableNodeStructure.
 *
 * This code verification ensures the equivalent class' mixins match the equivalent structure's base structures.
 * ----------------------------------------------------
 */
import { isAllowedMixin, isAllowedMixinForStructure } from "../config";
import { TsMorphInspector } from "../inspectors";
import { Problem } from "./Problem";

export function ensureStructuresMatchClasses(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
    const nodes = inspector.getWrappedNodes();
    const structures = inspector.getStructures();

    for (const node of nodes) {
        const structureName = getStructureName(node.getName());
        const structure = structures.find(s => s.getName() === structureName);
        if (structure == null)
            continue;

        for (const mixin of node.getMixins().filter(m => isAllowedMixin(m.getName()) && isAllowedMixinForStructure(m.getName(), structure.getName()))) {
            const mixinStructureName = getStructureName(mixin.getName());
            const structureHasMixin = structure.getBaseStructures().some(s => s.getName() === mixinStructureName);
            if (!structureHasMixin) {
                addProblem({
                    filePath: structure.getFilePath(),
                    lineNumber: structure.getStartLineNumber(),
                    message: `${structure.getName()} does not have ${mixinStructureName}.`
                });
            }
        }

        for (const baseStructure of structure.getBaseStructures().filter(s => isAllowedBaseStructure(s.getName()))) {
            const declarationName = baseStructure.getName().replace(/Structure$/, "");
            const mixin = node.getMixins().find(m => m.getName() === declarationName);

            if (mixin == null) {
                addProblem({
                    filePath: structure.getFilePath(),
                    lineNumber: structure.getStartLineNumber(),
                    message: `${structure.getName()} has ${baseStructure.getName()}, but it shouldn't.`
                });
            }
        }
    }
}

function getStructureName(name: string) {
    return name + "Structure";
}

function isAllowedBaseStructure(name: string) {
    if (name === "Structure")
        return false;
    if (/SpecificStructure$/.test(name))
        return false;

    if (/OverloadStructure$/.test(name))
        return false;

    return true;
}
