import {getAst, getClassViewModels, getStructureViewModels} from "./common";
import {ClassViewModel, MixinViewModel} from "./view-models";
import {isAllowedMixin, isAllowedClass} from "./config";

const ast = getAst();
const classVMs = Array.from(getClassViewModels(ast));
const structureVMs = Array.from(getStructureViewModels(ast));

for (const classVM of classVMs.filter(c => isAllowedClass(c))) {
    const structureName = getStructureName(classVM);
    const structureVM = structureVMs.find(s => s.name === structureName);
    if (structureVM == null)
        continue;

    for (const mixin of classVM.mixins.filter(m => isAllowedMixin(m))) {
        const mixinStructureName = getStructureName(mixin);
        const structureHasMixin = structureVM.extends.some(s => s === mixinStructureName);
        if (!structureHasMixin)
            console.error(`${structureVM.name} does not have ${mixinStructureName}.`);
    }
}

function getStructureName(vm: ClassViewModel | MixinViewModel) {
    return vm.name + "Structure";
}
