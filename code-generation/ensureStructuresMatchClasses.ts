import {ArrayUtils} from "./../src/utils";
import {ClassViewModel, MixinViewModel, InterfaceViewModel} from "./view-models";
import {isAllowedMixin, isAllowedClass, isAllowedMixinForStructure} from "./config";
import {InspectorFactory} from "./inspectors";

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
    throw new Error("Classes and structures did not match!");
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
