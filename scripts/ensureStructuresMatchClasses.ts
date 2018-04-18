/**
 * Code Verification - Ensure Structures Match Classes.
 * ----------------------------------------------------
 * Classes like ClassDeclaration can extend a mixin like ExportableNode. In this case, we need to then also make sure
 * that ClassDeclarationStructure will extend ExportableNodeStructure.
 *
 * This code verification ensures the equivalent class' mixins match the equivalent structure's base structures.
 * ----------------------------------------------------
 */
import { ArrayUtils } from "../src/utils";
import { isAllowedMixin, isAllowedMixinForStructure } from "./config";
import { InspectorFactory } from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

// get info
const nodes = inspector.getWrappedNodes();
const structures = inspector.getStructures();

// find problems
const problems: string[] = [];

for (const node of nodes) {
    const structureName = getStructureName(node.getName());
    const structure = ArrayUtils.find(structures, s => s.getName() === structureName);
    if (structure == null)
        continue;

    for (const mixin of node.getMixins().filter(m => isAllowedMixin(m.getName()) && isAllowedMixinForStructure(m.getName(), structure.getName()))) {
        const mixinStructureName = getStructureName(mixin.getName());
        const structureHasMixin = structure.getBaseStructures().some(s => s.getName() === mixinStructureName);
        if (!structureHasMixin)
            problems.push(`${structure.getName()} does not have ${mixinStructureName}.`);
    }

    for (const baseStructure of structure.getBaseStructures().filter(s => !isStructureToIgnore(s.getName()))) {
        const declarationName = baseStructure.getName().replace(/Structure$/, "");
        const mixin = ArrayUtils.find(node.getMixins(), m => m.getName() === declarationName);

        if (mixin == null)
            problems.push(`${structure.getName()} has ${baseStructure.getName()}, but it shouldn't.`);
    }
}

// output
if (problems.length > 0) {
    console.log(problems);
    console.error("Classes and structures did not match!");
    process.exit(1);
}

function getStructureName(name: string) {
    return name + "Structure";
}

function isStructureToIgnore(name: string) {
    if (/SpecificStructure$/.test(name))
        return true;

    if (/OverloadStructure$/.test(name))
        return true;

    return false;
}
