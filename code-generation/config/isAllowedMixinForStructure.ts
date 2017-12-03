import {MixinViewModel, InterfaceViewModel} from "./../view-models";

export function isAllowedMixinForStructure(mixin: MixinViewModel, structure: InterfaceViewModel) {
    if (structure.name === "PropertyAssignmentStructure")
        return mixin.name !== "QuestionTokenableNode";
    if (structure.name === "ShorthandPropertyAssignmentStructure")
        return mixin.name !== "QuestionTokenableNode";

    return true;
}
