import {ArrayUtils} from "./../src/utils";
import {getAst, getClassViewModels, getStructureViewModels, getMixinsOfMixins} from "./common";
import {ClassViewModel, MixinViewModel, InterfaceViewModel} from "./view-models";
import {isAllowedMixin, isAllowedClass} from "./config";

const ast = getAst();
const classVMs = ArrayUtils.from(getClassViewModels(ast));
const structureVMs = ArrayUtils.from(getStructureViewModels(ast));
const mixinsOfMixins = getMixinsOfMixins(classVMs);
const problems: string[] = [];

for (const vm of [...classVMs.filter(c => isAllowedClass(c)), ...mixinsOfMixins.filter(m => m.mixins.length > 0)]) {
    const structureName = getStructureName(vm);
    const structureVM = ArrayUtils.find(structureVMs, s => s.name === structureName);
    if (structureVM == null)
        continue;

    for (const mixin of vm.mixins.filter(m => isAllowedMixin(m))) {
        const mixinStructureName = getStructureName(mixin);
        const structureHasMixin = structureVM.extends.some(s => s.name === mixinStructureName);
        if (!structureHasMixin)
            problems.push(`${structureVM.name} does not have ${mixinStructureName}.`);
    }

    for (const structureExtend of structureVM.extends.filter(e => !isStructureToIgnore(e))) {
        const declarationName = structureExtend.name.replace(/Structure$/, "");
        const mixin = ArrayUtils.find(vm.mixins, m => m.name === declarationName);

        if (mixin == null)
            problems.push(`${structureVM.name} has ${structureExtend.name}, but it shouldn't.`);
    }
}

if (problems.length > 0) {
    console.log(problems);
    throw new Error("Classes and structures did not match!");
}

function getStructureName(vm: ClassViewModel | MixinViewModel) {
    return vm.name + "Structure";
}

function isStructureToIgnore(structure: InterfaceViewModel) {
    if (/SpecificStructure$/.test(structure.name))
        return true;

    if (/OverloadStructure$/.test(structure.name))
        return true;

    return false;
}
